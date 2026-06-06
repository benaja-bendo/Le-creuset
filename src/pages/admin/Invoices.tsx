import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  FileText, 
  Eye, 
  Trash2, 
  X, 
  Search,
  Calendar,
  Building2,
  Loader2,
  AlertCircle,
  Plus,
  Layers
} from 'lucide-react';
import { getJSON, BASE_URL, getToken, resolveUrl } from '../../api/client';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const initialOrderId = searchParams.get('orderId');

  const loadData = useCallback(async () => {
    try {
      const [inv, groups] = await Promise.all([
        getJSON<Invoice[]>('/invoices'),
        getJSON<InvoiceGroup[]>('/invoice-groups'),
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
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
        <Link
          to="/client/admin/invoices/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors shadow-sm"
        >
          <Plus size={18} />
          Déposer une facture
        </Link>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-secondary-950/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setPreviewUrl(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
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

    </div>
  );
}
