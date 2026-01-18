import { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Eye, 
  X, 
  Calendar,
  DollarSign,
  Loader2,
  AlertCircle,
  Package
} from 'lucide-react';
import { getJSON, BASE_URL } from '../../api/client';

type Invoice = {
  id: string;
  invoiceNumber: string;
  orderId: string;
  fileUrl: string;
  amount: number | null;
  issueDate: string;
  notes: string | null;
  createdAt: string;
  order: { id: string; status: string; estimatedPrice: number | null };
};

export default function MyInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      const data = await getJSON<Invoice[]>('/invoices/me');
      setInvoices(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const resolveUrl = (url: string) => {
    if (url.startsWith('http')) return url;
    return `${BASE_URL}${url}`;
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'EN_ATTENTE': return 'En attente';
      case 'TIRAGE_OK': return 'Cires prêtes';
      case 'FONDU': return 'Fondu';
      case 'EXPEDIE': return 'Expédié';
      default: return status;
    }
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
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Mes Factures</h1>
        <p className="text-secondary-500">Consultez et téléchargez vos factures.</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Invoices List */}
      {invoices.length === 0 ? (
        <div className="bg-white rounded-xl border border-secondary-200 p-12 text-center">
          <FileText size={48} className="mx-auto text-secondary-300 mb-4" />
          <h3 className="text-lg font-medium text-secondary-700 mb-1">Aucune facture</h3>
          <p className="text-secondary-500">Vos factures apparaîtront ici une fois déposées.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {invoices.map((invoice) => (
            <div key={invoice.id} className="bg-white rounded-xl border border-secondary-200 shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
                  <FileText size={24} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h3 className="font-semibold text-secondary-900">{invoice.invoiceNumber}</h3>
                    {invoice.amount && (
                      <span className="text-lg font-bold text-secondary-900 flex items-center gap-1">
                        <DollarSign size={16} className="text-secondary-400" />
                        {invoice.amount} €
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-secondary-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} />
                      {new Date(invoice.issueDate).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Package size={14} />
                      Commande #{invoice.orderId.slice(-6)} 
                      <span className="text-xs px-2 py-0.5 rounded-full bg-secondary-100 text-secondary-600 ml-1">
                        {getStatusLabel(invoice.order.status)}
                      </span>
                    </div>
                  </div>

                  {invoice.notes && (
                    <p className="text-sm text-secondary-500 mt-2 italic">{invoice.notes}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setPreviewUrl(resolveUrl(invoice.fileUrl))}
                    className="flex items-center gap-2 px-4 py-2 text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg font-medium transition-colors"
                  >
                    <Eye size={16} />
                    <span className="hidden sm:inline">Voir</span>
                  </button>
                  <a
                    href={resolveUrl(invoice.fileUrl)}
                    download
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-4 py-2 text-secondary-700 bg-secondary-100 hover:bg-secondary-200 rounded-lg font-medium transition-colors"
                  >
                    <Download size={16} />
                    <span className="hidden sm:inline">Télécharger</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setPreviewUrl(null)}>
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-secondary-200">
              <h3 className="font-semibold text-secondary-900">Aperçu de la facture</h3>
              <div className="flex items-center gap-2">
                <a
                  href={previewUrl}
                  download
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-secondary-700 hover:bg-secondary-100 rounded-lg"
                >
                  <Download size={16} />
                  Télécharger
                </a>
                <button onClick={() => setPreviewUrl(null)} className="p-2 hover:bg-secondary-100 rounded-lg">
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-secondary-50">
              <iframe src={previewUrl} className="w-full h-[70vh] border border-secondary-200 rounded-lg bg-white" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
