import { useState, useEffect } from 'react';
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
  Plus
} from 'lucide-react';
import { getJSON, postJSON, BASE_URL, uploadFile } from '../../api/client';

type Invoice = {
  id: string;
  invoiceNumber: string;
  orderId: string;
  userId: string;
  fileUrl: string;
  amount: number | null;
  issueDate: string;
  notes: string | null;
  createdAt: string;
  order: { id: string; status: string; estimatedPrice: number | null };
  user: { id: string; email: string; companyName: string | null };
};

type Order = {
  id: string;
  status: string;
  userId: string;
  user?: { companyName: string; email: string };
  estimatedPrice: number | null;
  createdAt: string;
};

export default function AdminInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [inv, ord] = await Promise.all([
        getJSON<Invoice[]>('/invoices'),
        getJSON<Order[]>('/orders'),
      ]);
      setInvoices(inv);
      setOrders(ord);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette facture ?')) return;
    try {
      await fetch(`${BASE_URL}/api/invoices/${id}`, { method: 'DELETE' });
      setInvoices(prev => prev.filter(i => i.id !== id));
    } catch (err) {
      setError('Erreur lors de la suppression');
    }
  };

  const filteredInvoices = invoices.filter(inv =>
    inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.user.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const resolveUrl = (url: string) => {
    if (url.startsWith('http')) return url;
    return `${BASE_URL}${url}`;
  };

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
          <p className="text-secondary-500">Déposez et gérez les factures clients.</p>
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
          className="w-full pl-11 pr-4 py-3 border border-secondary-200 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-xl border border-secondary-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary-50 text-secondary-600 font-medium">
              <tr>
                <th className="px-6 py-4">N° Facture</th>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Montant</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Commande</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-100">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-secondary-400">
                    <FileText size={40} className="mx-auto mb-3 opacity-30" />
                    <p>Aucune facture</p>
                  </td>
                </tr>
              ) : filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-secondary-50/50 transition-colors">
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
                    <span className="text-xs font-mono text-secondary-500">#{inv.orderId.slice(-6)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
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
                      <button
                        onClick={() => handleDelete(inv.id)}
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
          onClose={() => setShowUploadModal(false)} 
          onSuccess={(inv) => {
            setInvoices(prev => [inv, ...prev]);
            setShowUploadModal(false);
          }}
        />
      )}
    </div>
  );
}

// Upload Modal Component
function UploadInvoiceModal({ 
  orders, 
  onClose, 
  onSuccess 
}: { 
  orders: Order[]; 
  onClose: () => void; 
  onSuccess: (inv: Invoice) => void;
}) {
  const [form, setForm] = useState({
    invoiceNumber: '',
    orderId: '',
    amount: '',
    notes: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedOrder = orders.find(o => o.id === form.orderId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !form.orderId) {
      setError('Veuillez sélectionner un fichier et une commande');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Upload file first
      const uploadRes = await uploadFile(file);
      
      // Create invoice
      const invoice = await postJSON<Invoice>('/invoices', {
        invoiceNumber: form.invoiceNumber,
        orderId: form.orderId,
        userId: selectedOrder?.userId,
        fileUrl: uploadRes.url,
        amount: form.amount ? parseFloat(form.amount) : undefined,
        notes: form.notes || undefined,
      });

      onSuccess(invoice);
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
              className="w-full px-4 py-2.5 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="FAC-2024-001"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1.5">
              Commande associée *
            </label>
            <select
              value={form.orderId}
              onChange={e => setForm({ ...form, orderId: e.target.value })}
              className="w-full px-4 py-2.5 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            >
              <option value="">Sélectionner une commande</option>
              {orders.map(o => (
                <option key={o.id} value={o.id}>
                  #{o.id.slice(-6)} - {o.user?.companyName || 'Client'} ({o.status})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1.5">
              Montant (€)
            </label>
            <input
              type="number"
              step="0.01"
              value={form.amount}
              onChange={e => setForm({ ...form, amount: e.target.value })}
              className="w-full px-4 py-2.5 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
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
              className="w-full px-4 py-2.5 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
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
