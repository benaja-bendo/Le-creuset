import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getJSON, patchJSON, postJSON } from '../../api/client';
import { Box, AlertCircle, Loader2, Download, Package, Flame, Send, Eye, FilePlus, Layers, Plus } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../components/ui/tooltip';

type Order = {
  id: string;
  status: string;
  createdAt: string;
  stlFileUrl?: string;
  estimatedPrice?: number;
  notes?: string;
  materialType?: string;
  invoiceGroupId?: string;
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
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  
  // States for Group Invoice
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [isGrouping, setIsGrouping] = useState(false);

  // States for Manual Order Modal
  const [showManualModal, setShowManualModal] = useState(false);
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);
  const [manualForm, setManualForm] = useState({
    userId: '',
    materialType: 'OR_750_JAUNE',
    estimatedPrice: '',
    notes: ''
  });

  const materialOptions = [
    { value: 'OR_750_JAUNE', label: 'Or Jaune 750' },
    { value: 'OR_375_JAUNE', label: 'Or Jaune 375' },
    { value: 'OR_750_ROSE', label: 'Or Rose 750' },
    { value: 'OR_375_ROSE', label: 'Or Rose 375' },
    { value: 'OR_750_GRIS', label: 'Or Gris 750' },
    { value: 'OR_375_GRIS', label: 'Or Gris 375' },
    { value: 'OR_750_PALLADIE_13', label: 'Or Gris 750 Palladié 13%' },
    { value: 'OR_750_ROUGE', label: 'Or Rouge 750' },
    { value: 'ARGENT_925', label: 'Argent 925' },
    { value: 'PLATINE_950', label: 'Platine 950' },
    { value: 'PROTOTYPE_LAITON', label: 'Prototype Laiton' },
    { value: 'IMPRESSION_CIRE', label: 'Impression Cire Seule' }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [ordersData, usersData] = await Promise.all([
        getJSON<Order[]>('/orders/all'),
        getJSON<User[]>('/users/all')
      ]);
      setOrders(ordersData);
      setUsers(usersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await patchJSON(`/orders/${orderId}/status`, { status: newStatus });
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'EN_ATTENTE': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'TIRAGE_OK': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'FONDU': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'EXPEDIE': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-secondary-100 text-secondary-700 border-secondary-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'EN_ATTENTE': return 'Attente';
      case 'TIRAGE_OK': return 'Cires OK';
      case 'FONDU': return 'Fondu';
      case 'EXPEDIE': return 'Expédié';
      default: return status;
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

  const handleGroupOrders = async () => {
    if (selectedOrders.size < 1) return;
    
    const selectedOrdersData = orders.filter(o => selectedOrders.has(o.id));
    const firstOrder = selectedOrdersData[0];
    const allSameUser = selectedOrdersData.every(o => o.user?.id === firstOrder.user?.id);
    
    if (!allSameUser) {
      alert("Toutes les commandes groupées doivent appartenir au même client.");
      return;
    }

    const allFinished = selectedOrdersData.every(o => o.status === 'EXPEDIE' || o.status === 'FONDU');
    if (!allFinished) {
       if(!window.confirm("Certaines commandes n'ont pas encore le statut FONDU ou EXPEDIE. Voulez-vous continuer la facturation ?")) {
           return;
       }
    }

    const manualInvoiceNumber = window.prompt("Entrez un numéro de facture groupée (Laisser vide pour autogénération):", "FAC-GRP-" + Date.now().toString().slice(-6));
    if (manualInvoiceNumber === null) return; // annulation

    setIsGrouping(true);
    try {
      const groupData = {
        orderIds: Array.from(selectedOrders),
        userId: firstOrder.user?.id,
        invoiceNumber: manualInvoiceNumber || `INV-GRP-${Date.now()}`,
        amount: selectedOrdersData.reduce((sum, o) => sum + (o.estimatedPrice || 0), 0)
      };

      await postJSON('/invoice-groups', groupData);
      
      await fetchData();
      setSelectedOrders(new Set());
      alert("Facturation groupée créée avec succès !");
    } catch (err: any) {
       alert(err.message || "Erreur lors de la création du groupe de factures.");
    } finally {
       setIsGrouping(false);
    }
  };

  const handleCreateManualOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.userId || !manualForm.materialType) return;

    setIsSubmittingManual(true);
    try {
      await postJSON('/orders/manual', {
        ...manualForm,
        estimatedPrice: manualForm.estimatedPrice ? parseFloat(manualForm.estimatedPrice) : undefined
      });
      setShowManualModal(false);
      setManualForm({
        userId: '',
        materialType: 'OR_750_JAUNE',
        estimatedPrice: '',
        notes: ''
      });
      await fetchData(); // Refresh list
    } catch (e: any) {
      alert(e.message || "Erreur lors de la création de la commande.");
    } finally {
      setIsSubmittingManual(false);
    }
  };


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
        <div className="flex gap-3">
            {selectedOrders.size > 0 && (
                <button
                onClick={handleGroupOrders}
                disabled={isGrouping}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg shadow-sm font-bold transition-colors cursor-pointer disabled:opacity-50"
                >
                {isGrouping ? <Loader2 className="animate-spin" size={18} /> : <Layers size={18} />}
                Grouper ({selectedOrders.size})
                </button>
            )}
            <button
               onClick={() => setShowManualModal(true)}
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
        </div>
      )}

      {/* Manual Order Modal */}
      {showManualModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-secondary-950/40 backdrop-blur-sm" onClick={() => setShowManualModal(false)}>
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
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Prix Estimé (€)</label>
                  <input 
                     type="number"
                     step="0.01"
                     value={manualForm.estimatedPrice}
                     onChange={e => setManualForm({...manualForm, estimatedPrice: e.target.value})}
                     placeholder="Ex: 150.00"
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
              {orders.map((order) => {
                  const isGrouped = !!order.invoiceGroupId;
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
                         <p className="text-xs font-mono text-secondary-400">#{order.id.slice(-6).toUpperCase()}</p>
                         <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] bg-secondary-100 text-secondary-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">{order.materialType || 'N/A'}</span>
                            {isGrouped && <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-bold uppercase flex items-center gap-1"><Layers size={10}/> Groupée</span>}
                         </div>
                         <p className="text-xs text-secondary-600 italic truncate max-w-[200px] mt-1.5 leading-snug">{order.notes || 'Sans spécifications'}</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-widest border ${getStatusStyle(order.status)}`}>
                      {getStatusLabel(order.status)}
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
                              <button 
                                onClick={() => handleUpdateStatus(order.id, 'EXPEDIE')}
                                className={`p-2 rounded-lg transition-all ${order.status === 'EXPEDIE' ? 'bg-green-600 text-white shadow-lg' : 'bg-secondary-100 text-secondary-400 hover:bg-green-50 hover:text-green-600'}`}
                              >
                                <Send size={18} />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>Clôturer (Expédier)</TooltipContent>
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
        {orders.length === 0 && (
          <div className="p-12 text-center text-secondary-400">
             <Box className="mx-auto mb-4 opacity-20" size={48} />
             <p>Aucune commande à gérer pour le moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}
