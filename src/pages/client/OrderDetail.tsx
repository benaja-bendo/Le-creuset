import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Package, 
  Clock,
  CheckCircle,
  FileText,
  Download,
  Eye,
  X,
  Loader2,
  AlertCircle,
  Layers,
  DollarSign,
  Calendar,
  Truck,
  Flame
} from 'lucide-react';
import { getJSON, BASE_URL } from '../../api/client';
import STLViewer from '../../components/STLViewer';

type Order = {
  id: string;
  userId: string;
  status: string;
  stlFileUrl: string | null;
  estimatedPrice: number | null;
  notes: string | null;
  materialType: string | null;
  finishType: string | null;
  quantity: number;
  createdAt: string;
  updatedAt: string;
};

type Invoice = {
  id: string;
  invoiceNumber: string;
  fileUrl: string;
  amount: number | null;
  issueDate: string;
  notes: string | null;
};

const ORDER_STATUSES = [
  { key: 'EN_ATTENTE', label: 'En attente', icon: Clock, color: 'text-orange-500' },
  { key: 'TIRAGE_OK', label: 'Cires prêtes', icon: Layers, color: 'text-blue-500' },
  { key: 'FONDU', label: 'Fondu', icon: Flame, color: 'text-purple-500' },
  { key: 'EXPEDIE', label: 'Expédié', icon: Truck, color: 'text-green-500' },
];

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (id) loadOrder();
  }, [id]);

  const loadOrder = async () => {
    try {
      const [orderData, invoicesData] = await Promise.all([
        getJSON<Order>(`/orders/${id}`),
        getJSON<Invoice[]>(`/invoices/order/${id}`),
      ]);
      setOrder(orderData);
      setInvoices(invoicesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const resolveUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${BASE_URL}${url}`;
  };

  const getCurrentStatusIndex = () => {
    if (!order) return -1;
    return ORDER_STATUSES.findIndex(s => s.key === order.status);
  };

  const getMaterialLabel = (type: string | null) => {
    const labels: Record<string, string> = {
      'or-jaune': 'Or Jaune',
      'or-rose': 'Or Rose',
      'argent': 'Argent 925',
      'bronze': 'Bronze',
      'resine': 'Résine',
    };
    return labels[type || ''] || type || 'Non spécifié';
  };

  const getFinishLabel = (type: string | null) => {
    const labels: Record<string, string> = {
      'poli': 'Poli miroir',
      'satine': 'Satiné',
      'brut': 'Brut de fonderie',
    };
    return labels[type || ''] || type || 'Standard';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="animate-spin text-primary-500" size={48} />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-8 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2">
        <AlertCircle size={18} />
        <span>{error || 'Commande introuvable'}</span>
      </div>
    );
  }

  const currentStatusIndex = getCurrentStatusIndex();

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link to="/client/orders" className="inline-flex items-center gap-2 text-secondary-500 hover:text-secondary-700 text-sm font-medium">
        <ArrowLeft size={16} />
        Retour aux commandes
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 flex items-center gap-3">
            <Package size={28} className="text-primary-500" />
            Commande #{order.id.slice(-6)}
          </h1>
          <p className="text-secondary-500 mt-1">
            Créée le {new Date(order.createdAt).toLocaleDateString('fr-FR', { 
              day: 'numeric', month: 'long', year: 'numeric' 
            })}
          </p>
        </div>
        {order.estimatedPrice && (
          <div className="bg-gradient-to-br from-primary-500 to-primary-600 text-white px-5 py-3 rounded-xl shadow-lg">
            <p className="text-xs uppercase tracking-wide opacity-80">Montant estimé</p>
            <p className="text-2xl font-bold">{order.estimatedPrice} €</p>
          </div>
        )}
      </div>

      {/* Status Timeline */}
      <div className="bg-white rounded-xl border border-secondary-200 p-6">
        <h2 className="text-lg font-semibold text-secondary-900 mb-6">Suivi de commande</h2>
        <div className="flex items-center justify-between relative">
          {/* Progress line */}
          <div className="absolute top-5 left-0 right-0 h-1 bg-secondary-200 -z-10" />
          <div 
            className="absolute top-5 left-0 h-1 bg-primary-500 -z-10 transition-all duration-500" 
            style={{ width: `${Math.max(0, currentStatusIndex) / (ORDER_STATUSES.length - 1) * 100}%` }}
          />
          
          {ORDER_STATUSES.map((status, idx) => {
            const isCompleted = idx <= currentStatusIndex;
            const isCurrent = idx === currentStatusIndex;
            const Icon = status.icon;
            
            return (
              <div key={status.key} className="flex flex-col items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all
                  ${isCompleted 
                    ? 'bg-primary-500 border-primary-500 text-white' 
                    : 'bg-white border-secondary-300 text-secondary-400'
                  }
                  ${isCurrent ? 'ring-4 ring-primary-100' : ''}
                `}>
                  {isCompleted && idx < currentStatusIndex ? (
                    <CheckCircle size={20} />
                  ) : (
                    <Icon size={18} />
                  )}
                </div>
                <span className={`
                  text-xs mt-2 font-medium text-center max-w-[80px]
                  ${isCurrent ? 'text-primary-600' : 'text-secondary-500'}
                `}>
                  {status.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: 3D Preview */}
        <div className="bg-white rounded-xl border border-secondary-200 overflow-hidden">
          <div className="p-4 border-b border-secondary-100">
            <h3 className="font-semibold text-secondary-900">Aperçu 3D</h3>
          </div>
          <div className="h-80">
            {order.stlFileUrl ? (
              <STLViewer
                fileUrl={resolveUrl(order.stlFileUrl)}
                fileName="model.stl"
                materialType={order.materialType || 'or-jaune'}
                finishType={order.finishType || 'poli'}
              />
            ) : (
              <div className="h-full flex items-center justify-center bg-secondary-50 text-secondary-400">
                <p>Aucun fichier 3D</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Order Details */}
        <div className="bg-white rounded-xl border border-secondary-200 p-6">
          <h3 className="font-semibold text-secondary-900 mb-4">Détails de la commande</h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-secondary-50 rounded-lg p-4">
                <p className="text-xs text-secondary-500 uppercase tracking-wide mb-1">Métal</p>
                <p className="font-medium text-secondary-900">{getMaterialLabel(order.materialType)}</p>
              </div>
              <div className="bg-secondary-50 rounded-lg p-4">
                <p className="text-xs text-secondary-500 uppercase tracking-wide mb-1">Finition</p>
                <p className="font-medium text-secondary-900">{getFinishLabel(order.finishType)}</p>
              </div>
              <div className="bg-secondary-50 rounded-lg p-4">
                <p className="text-xs text-secondary-500 uppercase tracking-wide mb-1">Quantité</p>
                <p className="font-medium text-secondary-900">{order.quantity} pièce(s)</p>
              </div>
              <div className="bg-secondary-50 rounded-lg p-4">
                <p className="text-xs text-secondary-500 uppercase tracking-wide mb-1">Dernière MAJ</p>
                <p className="font-medium text-secondary-900">
                  {new Date(order.updatedAt).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>

            {order.notes && (
              <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
                <p className="text-xs text-amber-700 uppercase tracking-wide mb-1">Notes</p>
                <p className="text-sm text-amber-900">{order.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Invoices Section */}
      <div className="bg-white rounded-xl border border-secondary-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-secondary-900 flex items-center gap-2">
            <FileText size={18} className="text-primary-500" />
            Factures associées
          </h3>
          <span className="text-sm text-secondary-500">{invoices.length} facture(s)</span>
        </div>

        {invoices.length === 0 ? (
          <div className="text-center py-8 text-secondary-400">
            <FileText size={32} className="mx-auto mb-2 opacity-50" />
            <p>Aucune facture pour cette commande</p>
          </div>
        ) : (
          <div className="space-y-3">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center gap-4 p-4 bg-secondary-50 rounded-lg">
                <div className="w-10 h-10 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center shrink-0">
                  <FileText size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-secondary-900">{invoice.invoiceNumber}</p>
                  <div className="flex items-center gap-3 text-sm text-secondary-500">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(invoice.issueDate).toLocaleDateString('fr-FR')}
                    </span>
                    {invoice.amount && (
                      <span className="flex items-center gap-1">
                        <DollarSign size={12} />
                        {invoice.amount} €
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreviewUrl(resolveUrl(invoice.fileUrl))}
                    className="p-2 text-primary-600 hover:bg-primary-100 rounded-lg transition-colors"
                    title="Voir"
                  >
                    <Eye size={18} />
                  </button>
                  <a
                    href={resolveUrl(invoice.fileUrl)}
                    download
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 text-secondary-600 hover:bg-secondary-200 rounded-lg transition-colors"
                    title="Télécharger"
                  >
                    <Download size={18} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setPreviewUrl(null)}>
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-secondary-200">
              <h3 className="font-semibold text-secondary-900">Aperçu du document</h3>
              <button onClick={() => setPreviewUrl(null)} className="p-2 hover:bg-secondary-100 rounded-lg">
                <X size={18} />
              </button>
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
