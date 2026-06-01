import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  FileText, 
  Upload, 
  Eye, 
  Trash2, 
  X, 
  Search,
  Calendar,
  Building2,
  DollarSign,
  Loader2,
  AlertCircle,
  Plus,
  Layers
} from 'lucide-react';
import { getJSON, postJSON, BASE_URL, uploadFile, getToken, resolveUrl } from '../../api/client';

type Invoice = {
  id: string;
  invoiceNumber: string;
  orderId?: string;
  userId: string;
  fileUrl: string | null;
  amount: number | null;
  issueDate: string;
  notes: string | null;
  createdAt: string;
  type?: 'individual' | 'group';
  order?: { id: string; status: string; estimatedPrice: number | null };
  orders?: { id: string; status: string; estimatedPrice: number | null }[];
  user: { id: string; email: string; companyName: string | null };
};

type Order = {
  id: string;
  status: string;
  userId: string;
  invoiceGroupId?: string;
  user?: { companyName: string; email: string };
  estimatedPrice: number | null;
  createdAt: string;
};

type InvoiceGroup = {
  id: string;
  invoiceNumber: string;
  userId: string;
  fileUrl: string | null;
  amount: number | null;
  issueDate: string;
  notes: string | null;
  createdAt: string;
  orders?: { id: string; status: string; estimatedPrice: number | null }[];
  user: { id: string; email: string; companyName: string | null };
};

export default function AdminInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const initialOrderId = searchParams.get('orderId');

  const loadData = useCallback(async () => {
    try {
      const [inv, groups, ord] = await Promise.all([
        getJSON<Invoice[]>('/invoices'),
        getJSON<InvoiceGroup[]>('/invoice-groups'),
        getJSON<Order[]>('/orders'),
      ]);
      
      const formattedInv = inv.map(i => ({ ...i, type: 'individual' as const }));
      const formattedGroups = groups.map(g => ({
        ...g,
        id: g.id,
        invoiceNumber: g.invoiceNumber,
        userId: g.userId,
        fileUrl: g.fileUrl,
        amount: g.amount,
        issueDate: g.issueDate,
        notes: g.notes,
        createdAt: g.createdAt,
        type: 'group' as const,
        orders: g.orders,
        user: g.user,
      }));
      
      // Merge and sort
      const allInvoices = [...formattedInv, ...formattedGroups].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      setInvoices(allInvoices);
      setOrders(ord);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
    if (initialOrderId) {
      setShowUploadModal(true);
    }
  }, [loadData, initialOrderId]);

  const handleDelete = async (id: string, type: 'individual' | 'group' = 'individual') => {
    if (!confirm(`Supprimer cette facture ${type === 'group' ? 'groupée ' : ''}?`)) return;
    try {
      if (type === 'group') {
        await fetch(`${BASE_URL}/api/invoice-groups/${id}`, { method: 'DELETE', headers: {
          'Authorization': `Bearer ${getToken()}`
        } });
      } else {
        await fetch(`${BASE_URL}/api/invoices/${id}`, { method: 'DELETE', headers: {
          'Authorization': `Bearer ${getToken()}`
        } });
      }
      setInvoices(prev => prev.filter(i => i.id !== id));
    } catch {
      setError('Erreur lors de la suppression');
    }
  };

  const filteredInvoices = invoices.filter(inv =>
    inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.user.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );



  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="animate-spin text-primary-500" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Gestion des Factures</h1>
          <p className="text-secondary-500">Déposez et gérez les factures clients (Individuelles et Groupées).</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors shadow-sm"
        >
          <Plus size={18} />
          Déposer une facture
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2">
          <AlertCircle size={18} />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto">×</button>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-400" />
        <input
          type="text"
          placeholder="Rechercher par numéro, client..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 border border-secondary-200 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-secondary-900"
        />
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-xl border border-secondary-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary-50 text-secondary-600 font-medium">
              <tr>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">N° Facture</th>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Montant</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Commande(s)</th>
                <th className="px-6 py-4">Notes</th>
                <th className="px-6 py-4 hover:text-secondary-800">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-100">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-secondary-400">
                    <FileText size={40} className="mx-auto mb-3 opacity-30" />
                    <p>Aucune facture</p>
                  </td>
                </tr>
              ) : filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-secondary-50/50 transition-colors">
                  <td className="px-6 py-4">
                    {inv.type === 'group' ? (
                       <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-tighter border border-indigo-200">
                           <Layers size={14}/> Groupée
                       </span>
                    ) : (
                       <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-secondary-50 text-secondary-700 text-xs font-bold uppercase tracking-tighter border border-secondary-200">
                           <FileText size={14}/> Indiv.
                       </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-secondary-900">{inv.invoiceNumber}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       <Building2 size={14} className="text-secondary-400" />
                       <span className="text-secondary-700">{inv.user.companyName || inv.user.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-secondary-700">
                       <DollarSign size={14} className="text-secondary-400" />
                       {inv.amount ? `${inv.amount} €` : '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-secondary-500">
                       <Calendar size={14} />
                       {new Date(inv.issueDate).toLocaleDateString('fr-FR')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                     {inv.type === 'group' ? (
                        <div className="text-xs text-secondary-500 flex flex-col gap-1">
                           <span className="font-medium text-secondary-700">{inv.orders?.length} commandes stipulées</span>
                           {inv.orders && inv.orders.length > 0 && (
                               <span className="font-mono text-[10px] text-secondary-400 truncate w-32">
                                  {inv.orders.map(o => `#${o.id.slice(-6)}`).join(', ')}
                               </span>
                           )}
                        </div>
                     ) : (
                        <span className="text-xs font-mono text-secondary-500">#{inv.orderId?.slice(-6) || ' N/A'}</span>
                     )}
                  </td>
                  <td className="px-6 py-4">
                    {inv.notes ? (
                      <span className="text-xs text-secondary-600 italic truncate block max-w-[150px]" title={inv.notes}>{inv.notes}</span>
                    ) : (
                      <span className="text-xs text-secondary-300">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {inv.fileUrl ? (
                          <>
                            <button
                                onClick={() => setPreviewUrl(resolveUrl(inv.fileUrl))}
                                className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                title="Voir"
                            >
                                <Eye size={16} />
                            </button>
                            <a
                                href={resolveUrl(inv.fileUrl)}
                                target="_blank"
                                rel="noreferrer"
                                className="p-2 text-secondary-500 hover:bg-secondary-100 rounded-lg transition-colors"
                                title="Télécharger"
                            >
                                <FileText size={16} />
                            </a>
                          </>
                      ) : (
                         <span className="text-xs italic text-secondary-400">PDF manquant</span>
                      )}
                      
                      <button
                        onClick={() => handleDelete(inv.id, inv.type)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setPreviewUrl(null)}>
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-secondary-200">
              <h3 className="font-semibold text-secondary-900">Aperçu de la facture</h3>
              <button onClick={() => setPreviewUrl(null)} className="p-2 hover:bg-secondary-100 rounded-lg">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <iframe src={previewUrl} className="w-full h-[70vh] border border-secondary-200 rounded-lg" />
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadInvoiceModal
          orders={orders}
          invoicedOrderIds={new Set(invoices.filter(i => i.type !== 'group' && i.orderId).map(i => i.orderId as string))}
          initialOrderId={initialOrderId}
          onClose={() => {
            setShowUploadModal(false);
            if (initialOrderId) setSearchParams({}); // Clear param after close
          }} 
          onSuccess={(inv) => {
            setInvoices(prev => [inv, ...prev]);
            setShowUploadModal(false);
            if (initialOrderId) setSearchParams({});
          }}
        />
      )}
    </div>
  );
}

// Upload Modal Component
function UploadInvoiceModal({
  orders,
  invoicedOrderIds,
  initialOrderId,
  onClose,
  onSuccess
}: {
  orders: Order[];
  invoicedOrderIds: Set<string>;
  initialOrderId?: string | null;
  onClose: () => void;
  onSuccess: (inv: Invoice) => void;
}) {
  // Get unique users from orders
  const uniqueUsers = Array.from(
    new Map(orders.filter(o => o.user).map(o => [o.user!.email, o.user!])).values()
  );

  // Find initial user from initialOrderId
  const initialOrder = initialOrderId ? orders.find(o => o.id === initialOrderId) : null;
  const initialUserId = initialOrder?.userId || '';

  const [selectedUserId, setSelectedUserId] = useState(initialUserId);
  const [form, setForm] = useState({
    invoiceNumber: '',
    orderId: initialOrderId || '',
    amount: '',
    notes: '',
  });
  // Transaction métal optionnelle (dépôt métal)
  const [metalForm, setMetalForm] = useState({
    metalType: 'OR_FIN',
    metalWeight: '',
    metalTransactionType: 'CREDIT' as 'CREDIT' | 'DEBIT',
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter orders for the selected user, excluding orders already invoiced
  // (groupées ou avec une facture individuelle déjà déposée).
  const availableOrders = orders.filter(o =>
    o.userId === selectedUserId &&
    !o.invoiceGroupId &&
    !invoicedOrderIds.has(o.id)
  );

  const isMetalDeposit = form.orderId === 'DEPOT_METAL';

  // Reset order selection when user changes
  const handleUserChange = (userId: string) => {
    setSelectedUserId(userId);
    setForm({ ...form, orderId: '' });
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !selectedUserId) {
      setError('Veuillez sélectionner un client et un fichier');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const uploadRes = await uploadFile(file);
      
      const includeMetal = isMetalDeposit && metalForm.metalWeight;
      const invoice = await postJSON<Invoice>('/invoices', {
        invoiceNumber: form.invoiceNumber,
        orderId: form.orderId === 'DEPOT_METAL' ? undefined : (form.orderId || undefined),
        userId: selectedUserId,
        fileUrl: uploadRes.url,
        amount: form.amount ? parseFloat(form.amount) : undefined,
        notes: form.notes || undefined,
        ...(includeMetal
          ? {
              metalType: metalForm.metalType,
              metalWeight: parseFloat(metalForm.metalWeight),
              metalTransactionType: metalForm.metalTransactionType,
            }
          : {}),
      });

      onSuccess({ ...invoice, type: 'individual' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl max-w-lg w-full" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-secondary-200">
          <h3 className="text-lg font-semibold text-secondary-900">Déposer une facture</h3>
          <button onClick={onClose} className="p-2 hover:bg-secondary-100 rounded-lg">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1.5">
              N° Facture *
            </label>
            <input
              type="text"
              value={form.invoiceNumber}
              onChange={e => setForm({ ...form, invoiceNumber: e.target.value })}
              className="w-full px-4 py-2.5 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-secondary-900"
              placeholder="FAC-2024-001"
              required
            />
          </div>

          {/* Client selection FIRST */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1.5">
              Client *
            </label>
            <select
              value={selectedUserId}
              onChange={e => handleUserChange(e.target.value)}
              className="w-full px-4 py-2.5 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-secondary-900"
              required
            >
              <option value="">Sélectionner un client</option>
              {uniqueUsers.map(u => (
                <option key={u.email} value={orders.find(o => o.user?.email === u.email)?.userId || ''}>
                  {u.companyName || u.email}
                </option>
              ))}
            </select>
          </div>

          {/* Order selection FILTERED by client */}
          {selectedUserId && (
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1.5">
                Commande associée
              </label>
              <select
                value={form.orderId}
                onChange={e => setForm({ ...form, orderId: e.target.value })}
                className="w-full px-4 py-2.5 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-secondary-900"
              >
                <option value="">Aucune (facture libre)</option>
                <option value="DEPOT_METAL">⚙ Dépôt métal</option>
                {availableOrders.map(o => (
                  <option key={o.id} value={o.id}>
                    #{o.id.slice(-6)} - {o.status} ({new Date(o.createdAt).toLocaleDateString('fr-FR')})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Transaction métal (dépôt métal) */}
          {isMetalDeposit && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg space-y-3">
              <p className="text-xs font-bold text-amber-800 uppercase tracking-wide">Transaction métal associée</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-secondary-700 mb-1">Métal</label>
                  <select
                    value={metalForm.metalType}
                    onChange={e => setMetalForm({ ...metalForm, metalType: e.target.value })}
                    className="w-full px-3 py-2 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-secondary-900 bg-white text-sm"
                  >
                    <option value="OR_FIN">Or Fin</option>
                    <option value="ARGENT_FIN">Argent Fin</option>
                    <option value="PLATINE">Platine</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-secondary-700 mb-1">Sens</label>
                  <select
                    value={metalForm.metalTransactionType}
                    onChange={e => setMetalForm({ ...metalForm, metalTransactionType: e.target.value as 'CREDIT' | 'DEBIT' })}
                    className="w-full px-3 py-2 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-secondary-900 bg-white text-sm"
                  >
                    <option value="CREDIT">Crédit (apport)</option>
                    <option value="DEBIT">Débit (retrait)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-secondary-700 mb-1">Masse (grammes)</label>
                <input
                  type="number"
                  step="0.001"
                  value={metalForm.metalWeight}
                  onChange={e => setMetalForm({ ...metalForm, metalWeight: e.target.value })}
                  className="w-full px-3 py-2 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-secondary-900 text-sm"
                  placeholder="0.000"
                />
              </div>
              <p className="text-[11px] text-amber-700">Le compte poids du client sera mis à jour automatiquement.</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1.5">
              Montant (€)
            </label>
            <input
              type="number"
              step="0.01"
              value={form.amount}
              onChange={e => setForm({ ...form, amount: e.target.value })}
              className="w-full px-4 py-2.5 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-secondary-900"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1.5">
              Fichier PDF *
            </label>
            <div className="border-2 border-dashed border-secondary-200 rounded-lg p-6 text-center hover:border-primary-400 transition-colors">
              <input
                type="file"
                accept=".pdf"
                onChange={e => setFile(e.target.files?.[0] || null)}
                className="hidden"
                id="invoice-file"
              />
              <label htmlFor="invoice-file" className="cursor-pointer">
                {file ? (
                  <div className="flex items-center justify-center gap-2 text-primary-600">
                    <FileText size={20} />
                    <span className="font-medium">{file.name}</span>
                  </div>
                ) : (
                  <>
                    <Upload size={24} className="mx-auto text-secondary-400 mb-2" />
                    <p className="text-sm text-secondary-500">Cliquez pour sélectionner un PDF</p>
                  </>
                )}
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1.5">
              Notes
            </label>
            <textarea
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              className="w-full px-4 py-2.5 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none text-secondary-900"
              rows={2}
              placeholder="Notes internes..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-secondary-200 text-secondary-700 rounded-lg font-medium hover:bg-secondary-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
              {loading ? 'Envoi...' : 'Déposer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
