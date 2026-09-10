import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getJSON, patchJSON, postJSON, deleteJSON } from '../../api/client';
import { Box, AlertCircle, CheckCircle2, AlertTriangle, Loader2, Download, Package, Flame, Send, Eye, FilePlus, Layers, Plus, Trash2, X, Pencil } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../components/ui/tooltip';
import Pagination from '../../components/ui/Pagination';
import { orderRef, orderStatusLabel, orderStatusStyle, materialTypeLabel, MATERIAL_TYPE_LABELS } from '../../lib/orders';

type Paginated<T> = { items: T[]; total: number; page: number; limit: number };
const PAGE_SIZE = 20;

type Order = {
  id: string;
  orderNumber?: string;
  status: string;
  createdAt: string;
  stlFileUrl?: string;
  estimatedPrice?: number;
  notes?: string;
  materialType?: string;
  quantity?: number;
  invoiceGroupId?: string;
  invoices?: { id: string }[];
  user?: {
    id: string;
    companyName: string;
    email: string;
  };
};

type User = {
  id: string;
  email: string;
  companyName: string;
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Modale de confirmation générique — remplace window.confirm, qui ne peut
  // rappeler ni le numéro de commande ni le client concerné par l'action.
  const [confirmState, setConfirmState] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  // States for Group Invoice
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [isGrouping, setIsGrouping] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupForm, setGroupForm] = useState({
    invoiceNumber: '',
    amount: '',
    issueDate: '',
    file: null as File | null,
    notes: ''
  });
  const [groupRecap, setGroupRecap] = useState<{ clientLabel: string; orderRefs: string[] } | null>(null);

  // States for Manual Order Modal
  const [showManualModal, setShowManualModal] = useState(false);
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);
  const [manualForm, setManualForm] = useState({
    userId: '',
    orderNumber: '',
    materialType: 'OR_750_JAUNE',
    quantity: 1,
    notes: ''
  });

  // Status filter
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Edit Order Modal
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editForm, setEditForm] = useState({ materialType: '', notes: '', quantity: 1 });

  const materialOptions = Object.entries(MATERIAL_TYPE_LABELS).map(([value, label]) => ({ value, label }));

  // Remplace l'ancien `CMD-${Date.now()...}` / `FAC-GRP-${Date.now()...}` :
  // une suggestion, pas une réservation — l'admin peut toujours l'éditer, et
  // la contrainte @unique en base tranche en cas de double création concurrente.
  const fetchNextOrderNumber = () =>
    getJSON<{ orderNumber: string }>('/orders/next-number').then(res => res.orderNumber);
  const fetchNextGroupInvoiceNumber = () =>
    getJSON<{ invoiceNumber: string }>('/invoice-groups/next-number').then(res => res.invoiceNumber);

  // Le sélecteur client de la commande manuelle a besoin de TOUS les clients,
  // pas d'une page — limite explicite haute, indépendante de la pagination
  // des commandes. Chargé une seule fois, ne dépend d'aucun filtre.
  useEffect(() => {
    getJSON<Paginated<User>>('/users/all?limit=500')
      .then(res => setUsers(res.items))
      .catch(err => setError(err instanceof Error ? err.message : 'Erreur de chargement'));
  }, []);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
      if (statusFilter) params.set('status', statusFilter);
      const res = await getJSON<Paginated<Order>>(`/orders/all?${params}`);
      setOrders(res.items);
      setTotal(res.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchOrders();
    // La sélection de groupement référence des commandes de la page
    // affichée : changer de page ou de filtre sans la vider validerait un
    // groupe sur des lignes devenues invisibles, voire absentes de `orders`.
    setSelectedOrders(new Set());
  }, [fetchOrders]);

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await patchJSON(`/orders/${orderId}/status`, { status: newStatus });
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
    } finally {
      setUpdatingId(null);
    }
  };

  const toggleOrderSelection = (orderId: string) => {
    const newSelection = new Set(selectedOrders);
    if (newSelection.has(orderId)) {
      newSelection.delete(orderId);
    } else {
      newSelection.add(orderId);
    }
    setSelectedOrders(newSelection);
  };

  const openGroupModal = async (selectedOrdersData: Order[]) => {
    const firstOrder = selectedOrdersData[0];
    setGroupRecap({
      clientLabel: firstOrder.user?.companyName || firstOrder.user?.email || 'Client inconnu',
      orderRefs: selectedOrdersData.map(o => orderRef(o)),
    });
    let invoiceNumber = '';
    try {
      invoiceNumber = await fetchNextGroupInvoiceNumber();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la génération du numéro de facture.');
    }
    // Les commandes manuelles n'ont jamais estimatedPrice renseigné (aucun
    // champ prix dans le formulaire de saisie) : un pré-remplissage basé
    // dessus valait 0 dans tous les cas réels, un faux montant qui semblait
    // volontaire. Le montant réel de la facture groupée se saisit à la main.
    setGroupForm({
      invoiceNumber,
      amount: '',
      issueDate: '',
      file: null,
      notes: ''
    });
    setShowGroupModal(true);
  };

  const handleGroupOrdersClick = () => {
    if (selectedOrders.size < 1) return;

    // Un groupe à 1 commande n'a aucun avantage sur une facture individuelle
    // normale — et contrairement à elle, une facture groupée n'apparaît nulle
    // part côté client (MyInvoices.tsx ne lit que /invoices/me).
    if (selectedOrders.size < 2) {
      setError("Sélectionnez au moins 2 commandes : une seule commande passe par une facture individuelle, pas par un groupe.");
      return;
    }

    const selectedOrdersData = orders.filter(o => selectedOrders.has(o.id));
    const firstOrder = selectedOrdersData[0];
    const allSameUser = selectedOrdersData.every(o => o.user?.id === firstOrder.user?.id);

    if (!allSameUser) {
      setError("Toutes les commandes groupées doivent appartenir au même client.");
      return;
    }

    const allFinished = selectedOrdersData.every(o => o.status === 'EXPEDIE' || o.status === 'FONDU');
    if (!allFinished) {
      setConfirmState({
        title: 'Commandes non finalisées',
        message: `${selectedOrdersData.length} commande(s) sélectionnée(s) pour ${firstOrder.user?.companyName || firstOrder.user?.email} n'ont pas toutes le statut Fondu ou Expédié. Continuer la facturation groupée quand même ?`,
        onConfirm: () => openGroupModal(selectedOrdersData),
      });
      return;
    }

    openGroupModal(selectedOrdersData);
  };

  const submitGroupOrders = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedOrdersData = orders.filter(o => selectedOrders.has(o.id));
    const firstOrder = selectedOrdersData[0];
    
    setIsGrouping(true);
    try {
      let fileUrl = null;
      if (groupForm.file) {
        // We need to import uploadFile at the top if it's not imported.
        const { uploadFile } = await import('../../api/client');
        const uploadRes = await uploadFile(groupForm.file);
        fileUrl = uploadRes.url;
      }

      const groupData = {
        orderIds: Array.from(selectedOrders),
        userId: firstOrder.user?.id,
        invoiceNumber: groupForm.invoiceNumber,
        amount: groupForm.amount ? parseFloat(groupForm.amount) : undefined,
        issueDate: groupForm.issueDate || undefined,
        fileUrl: fileUrl,
        notes: groupForm.notes
      };

      await postJSON('/invoice-groups', groupData);

      await fetchOrders();
      setSelectedOrders(new Set());
      setShowGroupModal(false);
      setSuccessMessage(`Facture groupée ${groupData.invoiceNumber} créée pour ${firstOrder.user?.companyName || firstOrder.user?.email}.`);
    } catch (err) {
       setError(err instanceof Error ? err.message : "Erreur lors de la création du groupe de factures.");
    } finally {
       setIsGrouping(false);
    }
  };

  const handleDeleteOrder = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    setConfirmState({
      title: 'Supprimer la commande',
      message: `Supprimer définitivement la commande ${order ? orderRef(order) : ''}${order?.user?.companyName ? ` de ${order.user.companyName}` : ''} ? Cette action est irréversible.`,
      onConfirm: async () => {
        try {
          await deleteJSON(`/orders/${orderId}`);
          // Un simple filtre local désynchroniserait le total affiché par la
          // pagination ; on recharge la page courante pour rester exact.
          await fetchOrders();
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
        }
      },
    });
  };

  const openEditModal = (order: Order) => {
    setEditingOrder(order);
    setEditForm({
      materialType: order.materialType || '',
      notes: order.notes || '',
      quantity: order.quantity || 1,
    });
  };

  const handleUpdateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;
    setIsSavingEdit(true);
    try {
      await patchJSON(`/orders/${editingOrder.id}`, {
        materialType: editForm.materialType,
        notes: editForm.notes,
        quantity: editForm.quantity,
      });
      setOrders(orders.map(o => o.id === editingOrder.id
        ? { ...o, materialType: editForm.materialType, notes: editForm.notes, quantity: editForm.quantity }
        : o));
      setEditingOrder(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la modification');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleCreateManualOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.userId || !manualForm.materialType) return;

    setIsSubmittingManual(true);
    try {
      await postJSON('/orders/manual', {
        ...manualForm,
      });
      setShowManualModal(false);
      setManualForm({
        userId: '',
        orderNumber: '',
        materialType: 'OR_750_JAUNE',
        quantity: 1,
        notes: ''
      });
      await fetchOrders();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la création de la commande.");
    } finally {
      setIsSubmittingManual(false);
    }
  };

  // Le filtre de statut est désormais appliqué côté serveur (nécessaire pour
  // que la pagination reste cohérente — filtrer après coup ne verrait que la
  // page courante). Il ne reste ici que le tri secondaire "terminé et facturé
  // à la fin", qui ne s'applique plus qu'à l'intérieur de la page affichée :
  // reproduire ce tri globalement demanderait un ORDER BY conditionnel côté
  // base, pour un gain marginal sur une liste déjà triée par date récente.
  const sortedOrders = [...orders].sort((a, b) => {
    const aFinished = a.status === 'EXPEDIE' && !!a.invoiceGroupId;
    const bFinished = b.status === 'EXPEDIE' && !!b.invoiceGroupId;
    if (aFinished && !bFinished) return 1;
    if (!aFinished && bFinished) return -1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  if (loading) {
    return (
      <div className="p-12 flex justify-center">
        <Loader2 className="animate-spin text-primary-500" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 font-serif">Gestion des Commandes</h1>
          <p className="text-secondary-500">Création manuelle, suivi global de la production et mise à jour des statuts.</p>
        </div>
        <div className="flex gap-3 items-end">
            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilterChange(e.target.value)}
                className="appearance-none px-4 py-2.5 pr-8 bg-white border border-secondary-200 rounded-lg text-sm font-medium text-secondary-700 focus:ring-2 focus:ring-primary-500 outline-none cursor-pointer"
              >
                <option value="">Tous les statuts</option>
                <option value="EN_ATTENTE">Attente</option>
                <option value="TIRAGE_OK">Cires OK</option>
                <option value="FONDU">Fondu</option>
                <option value="EXPEDIE">Expédié</option>
              </select>
              {statusFilter && (
                <button
                  onClick={() => handleStatusFilterChange('')}
                  className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-secondary-400 hover:text-secondary-700 transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>

              {selectedOrders.size > 0 && (
                <button
                onClick={handleGroupOrdersClick}
                disabled={isGrouping}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg shadow-sm font-bold transition-colors cursor-pointer disabled:opacity-50"
                >
                {isGrouping ? <Loader2 className="animate-spin" size={18} /> : <Layers size={18} />}
                Grouper ({selectedOrders.size})
                </button>
            )}
            <button
               onClick={async () => {
                 let orderNumber = '';
                 try {
                   orderNumber = await fetchNextOrderNumber();
                 } catch (err) {
                   setError(err instanceof Error ? err.message : 'Erreur lors de la génération du numéro de commande.');
                 }
                 setManualForm(prev => ({ ...prev, orderNumber }));
                 setShowManualModal(true);
               }}
               className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-lg shadow-sm font-bold transition-colors shadow-primary-500/20"
            >
               <Plus size={18} /> Nouvelle Commande
            </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          <p>{error}</p>
          <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700">×</button>
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg flex items-center gap-2">
          <CheckCircle2 size={20} />
          <p>{successMessage}</p>
          <button onClick={() => setSuccessMessage(null)} className="ml-auto text-emerald-500 hover:text-emerald-700">×</button>
        </div>
      )}

      {/* Confirmation Modal — remplace window.confirm */}
      {confirmState && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-secondary-950/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setConfirmState(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-secondary-100 flex items-center gap-3">
              <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                <AlertTriangle size={20} />
              </div>
              <h3 className="font-bold text-lg text-secondary-900">{confirmState.title}</h3>
            </div>
            <div className="p-6 space-y-6">
              <p className="text-secondary-700">{confirmState.message}</p>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmState(null)}
                  className="px-5 py-2.5 text-secondary-600 font-medium hover:bg-secondary-100 rounded-xl transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={() => {
                    confirmState.onConfirm();
                    setConfirmState(null);
                  }}
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md transition-colors"
                >
                  Confirmer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Group Orders Modal */}
      {showGroupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-secondary-950/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowGroupModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-secondary-100 flex items-center justify-between">
              <h3 className="font-bold text-lg text-secondary-900 flex items-center gap-2">
                <Layers size={20} className="text-indigo-600" />
                Créer une Facture Groupée
              </h3>
              <button onClick={() => setShowGroupModal(false)} className="text-secondary-400 hover:text-secondary-600">×</button>
            </div>
            <form onSubmit={submitGroupOrders} className="p-6 space-y-4 bg-secondary-50/50">
              {groupRecap && (
                <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 px-4 py-3 text-sm">
                  <p className="font-medium text-secondary-900">{groupRecap.clientLabel}</p>
                  <p className="mt-1 text-secondary-600">
                    {groupRecap.orderRefs.length} commande(s) : {groupRecap.orderRefs.join(', ')}
                  </p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Numéro de Facture *</label>
                <input 
                  type="text"
                  required
                  value={groupForm.invoiceNumber}
                  onChange={e => setGroupForm({...groupForm, invoiceNumber: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white border border-secondary-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-secondary-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Montant Total (€)</label>
                <input
                  type="number"
                  step="0.01"
                  value={groupForm.amount}
                  onChange={e => setGroupForm({...groupForm, amount: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white border border-secondary-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-secondary-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Date d'émission</label>
                <input
                  type="date"
                  value={groupForm.issueDate}
                  onChange={e => setGroupForm({...groupForm, issueDate: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white border border-secondary-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-secondary-900"
                />
                <p className="text-xs text-secondary-500 mt-1">Laissez vide pour utiliser la date du jour.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Fichier PDF (Facture)</label>
                <input 
                  type="file"
                  accept=".pdf"
                  onChange={e => setGroupForm({...groupForm, file: e.target.files ? e.target.files[0] : null})}
                  className="w-full px-4 py-2 bg-white border border-secondary-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-secondary-900 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Notes</label>
                <textarea 
                  rows={2}
                  value={groupForm.notes}
                  onChange={e => setGroupForm({...groupForm, notes: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white border border-secondary-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-secondary-900 resize-none"
                ></textarea>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowGroupModal(false)} className="px-5 py-2.5 text-secondary-600 font-medium hover:bg-secondary-100 rounded-xl transition-colors">
                  Annuler
                </button>
                <button type="submit" disabled={isGrouping} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md disabled:opacity-50 flex items-center gap-2">
                  {isGrouping && <Loader2 size={16} className="animate-spin" />}
                  Valider
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Order Modal */}
      {showManualModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-secondary-950/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowManualModal(false)}>
           <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
             <div className="px-6 py-4 border-b border-secondary-100 flex items-center justify-between">
                <h3 className="font-bold text-lg text-secondary-900 flex items-center gap-2">
                   <FilePlus size={20} className="text-primary-600" />
                   Saisie Commande Manuelle
                </h3>
                <button onClick={() => setShowManualModal(false)} className="text-secondary-400 hover:text-secondary-600">×</button>
             </div>
             <form onSubmit={handleCreateManualOrder} className="p-6 space-y-4 bg-secondary-50/50">
               <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Numéro de Commande *</label>
                  <input 
                     type="text"
                     required
                     value={manualForm.orderNumber}
                     onChange={e => setManualForm({...manualForm, orderNumber: e.target.value})}
                     className="w-full px-4 py-2.5 bg-white border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-secondary-900"
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Client *</label>
                  <select 
                     required
                     value={manualForm.userId}
                     onChange={e => setManualForm({...manualForm, userId: e.target.value})}
                     className="w-full px-4 py-2.5 bg-white border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-secondary-900"
                  >
                     <option value="" disabled>Sélectionner un client...</option>
                     {users.map(u => (
                        <option key={u.id} value={u.id}>{u.companyName || u.email}</option>
                     ))}
                  </select>
               </div>
               
               <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Alliage / Service *</label>
                  <select 
                     required
                     value={manualForm.materialType}
                     onChange={e => setManualForm({...manualForm, materialType: e.target.value})}
                     className="w-full px-4 py-2.5 bg-white border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-secondary-900"
                  >
                     {materialOptions.map(m => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                     ))}
                  </select>
               </div>

               <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Quantité *</label>
                  <input
                     type="number"
                     required
                     min={1}
                     step={1}
                     value={manualForm.quantity}
                     onChange={e => setManualForm({...manualForm, quantity: Number(e.target.value)})}
                     className="w-full px-4 py-2.5 bg-white border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-secondary-900"
                  />
               </div>

               <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Notes internes / Description</label>
                  <textarea
                     rows={3}
                     value={manualForm.notes}
                     onChange={e => setManualForm({...manualForm, notes: e.target.value})}
                     placeholder="Bague sur mesure t.52..."
                     className="w-full px-4 py-2.5 bg-white border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-secondary-900 resize-none"
                  ></textarea>
               </div>

               <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={() => setShowManualModal(false)} className="px-5 py-2.5 text-secondary-600 font-medium hover:bg-secondary-100 rounded-xl transition-colors">
                     Annuler
                  </button>
                  <button type="submit" disabled={isSubmittingManual} className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-md disabled:opacity-50 flex items-center gap-2">
                     {isSubmittingManual && <Loader2 size={16} className="animate-spin" />}
                     Créer la commande
                  </button>
               </div>
             </form>
           </div>
         </div>
      )}

      {/* Edit Order Modal */}
      {editingOrder && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-secondary-950/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setEditingOrder(null)}>
           <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
             <div className="px-6 py-4 border-b border-secondary-100 flex items-center justify-between">
                <h3 className="font-bold text-lg text-secondary-900 flex items-center gap-2">
                   <Pencil size={20} className="text-amber-600" />
                   Modifier la commande {orderRef(editingOrder)}
                </h3>
                <button onClick={() => setEditingOrder(null)} className="text-secondary-400 hover:text-secondary-600">×</button>
             </div>
             <form onSubmit={handleUpdateOrder} className="p-6 space-y-4 bg-secondary-50/50">
               <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Alliage / Service</label>
                  <select
                     value={editForm.materialType}
                     onChange={e => setEditForm({...editForm, materialType: e.target.value})}
                     className="w-full px-4 py-2.5 bg-white border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-secondary-900"
                  >
                     <option value="">Non spécifié</option>
                     {materialOptions.map(m => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                     ))}
                  </select>
               </div>
               <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Quantité</label>
                  <input
                     type="number"
                     required
                     min={1}
                     step={1}
                     value={editForm.quantity}
                     onChange={e => setEditForm({...editForm, quantity: Number(e.target.value)})}
                     className="w-full px-4 py-2.5 bg-white border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-secondary-900"
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Notes internes / Description</label>
                  <textarea
                     rows={3}
                     value={editForm.notes}
                     onChange={e => setEditForm({...editForm, notes: e.target.value})}
                     className="w-full px-4 py-2.5 bg-white border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-secondary-900 resize-none"
                  ></textarea>
               </div>
               <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={() => setEditingOrder(null)} className="px-5 py-2.5 text-secondary-600 font-medium hover:bg-secondary-100 rounded-xl transition-colors">
                     Annuler
                  </button>
                  <button type="submit" disabled={isSavingEdit} className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md disabled:opacity-50 flex items-center gap-2">
                     {isSavingEdit && <Loader2 size={16} className="animate-spin" />}
                     Enregistrer
                  </button>
               </div>
             </form>
           </div>
         </div>
      )}

      <div className="bg-white rounded-xl border border-secondary-200 shadow-sm overflow-hidden text-secondary-900">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-secondary-50 border-b border-secondary-100">
                <th className="px-6 py-4 w-12 text-center text-xs font-bold text-secondary-500 uppercase tracking-widest">
                  {/* Select */}
                </th>
                <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase tracking-widest drop-shadow-sm">Client</th>
                <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase tracking-widest">Détails Pièce</th>
                <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase tracking-widest">Statut Actuel</th>
                <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-100">
              {sortedOrders.map((order) => {
                  const isGrouped = !!order.invoiceGroupId || (order.invoices && order.invoices.length > 0);
                  const isSelected = selectedOrders.has(order.id);
                  const isManual = !order.stlFileUrl;
                  
                  return (
                <tr key={order.id} className={`hover:bg-secondary-50/30 transition-colors ${isSelected ? 'bg-indigo-50/50' : ''}`}>
                  <td className="px-6 py-4 text-center">
                    <input 
                       type="checkbox" 
                       className="rounded border-secondary-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer w-4 h-4"
                       checked={isSelected}
                       disabled={isGrouped}
                       onChange={() => toggleOrderSelection(order.id)}
                       title={isGrouped ? "Déjà incluse dans un groupe de facturation" : "Sélectionner pour grouper"}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-secondary-900">{order.user?.companyName || 'Inconnu'}</p>
                    <p className="text-xs text-secondary-500">{order.user?.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                       <div className={`w-10 h-10 rounded flex items-center justify-center text-secondary-600
                         ${isManual ? 'bg-amber-100 text-amber-600' : 'bg-secondary-100'}`}>
                         {isManual ? <FilePlus size={18} /> : <Box size={20} />}
                       </div>
                       <div>
                         <p className="text-xs font-mono text-secondary-400">{orderRef(order)}</p>
                         <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] bg-secondary-100 text-secondary-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">{materialTypeLabel(order.materialType)}</span>
                            {isGrouped && <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-bold uppercase flex items-center gap-1"><Layers size={10}/> Groupée</span>}
                         </div>
                         <p className="text-xs text-secondary-600 italic truncate max-w-[200px] mt-1.5 leading-snug">{order.notes || 'Sans spécifications'}</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-widest border ${orderStatusStyle(order.status)}`}>
                      {orderStatusLabel(order.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {updatingId === order.id ? (
                        <Loader2 className="animate-spin text-primary-500" size={20} />
                      ) : (
                        <>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Link 
                                to={`/client/admin/orders/${order.id}`}
                                className="p-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors"
                              >
                                <Eye size={18} />
                              </Link>
                            </TooltipTrigger>
                            <TooltipContent>Détails de la commande</TooltipContent>
                          </Tooltip>

                          {!isGrouped && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Link 
                                  to={`/client/admin/invoices?orderId=${order.id}`}
                                  className="p-2 bg-secondary-100 text-secondary-600 rounded-lg hover:bg-secondary-200 transition-colors"
                                >
                                  <FilePlus size={18} />
                                </Link>
                              </TooltipTrigger>
                              <TooltipContent>Ajouter une facture individuelle</TooltipContent>
                            </Tooltip>
                          )}

                          <div className="h-6 w-px bg-secondary-200 mx-1"></div>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => openEditModal(order)}
                                className="p-2 bg-secondary-100 text-secondary-400 rounded-lg hover:bg-amber-50 hover:text-amber-600 transition-all"
                              >
                                <Pencil size={18} />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>Modifier la commande</TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => handleDeleteOrder(order.id)}
                                className="p-2 bg-secondary-100 text-secondary-400 rounded-lg hover:bg-red-50 hover:text-red-600 transition-all"
                              >
                                <Trash2 size={18} />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>Supprimer la commande</TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button 
                                onClick={() => handleUpdateStatus(order.id, 'TIRAGE_OK')}
                                className={`p-2 rounded-lg transition-all ${order.status === 'TIRAGE_OK' ? 'bg-blue-600 text-white shadow-lg' : 'bg-secondary-100 text-secondary-400 hover:bg-blue-50 hover:text-blue-600'}`}
                              >
                                <Package size={18} />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>Marquer comme Tiré (Cire OK)</TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button 
                                onClick={() => handleUpdateStatus(order.id, 'FONDU')}
                                className={`p-2 rounded-lg transition-all ${order.status === 'FONDU' ? 'bg-purple-600 text-white shadow-lg' : 'bg-secondary-100 text-secondary-400 hover:bg-purple-50 hover:text-purple-600'}`}
                              >
                                <Flame size={18} />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>Marquer comme Fondu</TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              {/* Passer directement au statut EXPEDIE ici court-circuitait la
                                  facture, le débit poids et l'email envoyés par /orders/:id/close
                                  — et masquait ensuite le vrai bouton de clôture sur la fiche
                                  commande (isCompleted = EXPEDIE). Le back refuse maintenant ce
                                  statut sur cette route ; on renvoie donc vers la fiche. */}
                              <Link
                                to={`/client/admin/orders/${order.id}`}
                                className={`p-2 rounded-lg transition-all ${order.status === 'EXPEDIE' ? 'bg-green-600 text-white shadow-lg' : 'bg-secondary-100 text-secondary-400 hover:bg-green-50 hover:text-green-600'}`}
                              >
                                <Send size={18} />
                              </Link>
                            </TooltipTrigger>
                            <TooltipContent>{order.status === 'EXPEDIE' ? 'Commande expédiée' : 'Clôturer via la fiche commande'}</TooltipContent>
                          </Tooltip>
                          
                          {order.stlFileUrl && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <a 
                                  href={order.stlFileUrl} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  className="p-2 bg-secondary-900 text-white rounded-lg hover:bg-secondary-800 shadow-sm"
                                >
                                  <Download size={18} />
                                </a>
                              </TooltipTrigger>
                              <TooltipContent>Télécharger le fichier STL</TooltipContent>
                            </Tooltip>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
        {orders.length === 0 ? (
          <div className="p-12 text-center text-secondary-400">
             <Box className="mx-auto mb-4 opacity-20" size={48} />
             <p>{statusFilter ? 'Aucune commande avec ce statut.' : 'Aucune commande à gérer pour le moment.'}</p>
          </div>
        ) : (
          <Pagination page={page} limit={PAGE_SIZE} total={total} onPageChange={setPage} />
        )}
      </div>
    </div>
  );
}
