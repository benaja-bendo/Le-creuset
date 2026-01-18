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
  Flame,
  Upload,
  Scale,
  Mail,
  User
} from 'lucide-react';
import { getJSON, postJSON, BASE_URL, uploadFile } from '../../api/client';
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
  user: {
    id: string;
    email: string;
    companyName: string | null;
    phone: string | null;
  };
  invoices: Invoice[];
};

type Invoice = {
  id: string;
  invoiceNumber: string;
  fileUrl: string;
  amount: number | null;
  issueDate: string;
};

const ORDER_STATUSES = [
  { key: 'EN_ATTENTE', label: 'En attente', icon: Clock, color: 'text-orange-500' },
  { key: 'TIRAGE_OK', label: 'Cires prêtes', icon: Layers, color: 'text-blue-500' },
  { key: 'FONDU', label: 'Fondu', icon: Flame, color: 'text-purple-500' },
  { key: 'EXPEDIE', label: 'Expédié', icon: Truck, color: 'text-green-500' },
];

const METAL_TYPES = [
  { value: 'OR_JAUNE_375', label: 'Or Jaune 375' },
  { value: 'OR_JAUNE_750', label: 'Or Jaune 750' },
  { value: 'OR_ROSE_750', label: 'Or Rose 750' },
  { value: 'OR_GRIS_750', label: 'Or Gris 750' },
  { value: 'PLATINE_950', label: 'Platine 950' },
  { value: 'PALLADIUM', label: 'Palladium' },
  { value: 'ARGENT_925', label: 'Argent 925' },
];

export default function AdminOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (id) loadOrder();
  }, [id]);

  const loadOrder = async () => {
    try {
      const data = await getJSON<Order>(`/orders/${id}`);
      setOrder(data);
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
  const isCompleted = order.status === 'EXPEDIE';

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link to="/client/admin/orders" className="inline-flex items-center gap-2 text-secondary-500 hover:text-secondary-700 text-sm font-medium">
        <ArrowLeft size={16} />
        Retour aux commandes
      </Link>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 flex items-center gap-3">
            <Package size={28} className="text-primary-500" />
            Commande #{order.id.slice(-6)}
          </h1>
          <div className="flex items-center gap-4 mt-2 text-secondary-500">
            <span className="flex items-center gap-1.5">
              <Calendar size={14} />
              {new Date(order.createdAt).toLocaleDateString('fr-FR')}
            </span>
            <span className="flex items-center gap-1.5">
              <User size={14} />
              {order.user.companyName || order.user.email}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!isCompleted && (
            <button
              onClick={() => setShowCloseModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors shadow-sm"
            >
              <CheckCircle size={18} />
              Clôturer & Importer Facture
            </button>
          )}
          {isCompleted && (
            <span className="px-4 py-2 bg-green-100 text-green-700 rounded-xl font-medium flex items-center gap-2">
              <CheckCircle size={18} />
              Commande terminée
            </span>
          )}
        </div>
      </div>

      {/* Status Timeline */}
      <div className="bg-white rounded-xl border border-secondary-200 p-6">
        <h2 className="text-lg font-semibold text-secondary-900 mb-6">Progression</h2>
        <div className="flex items-center justify-between relative">
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
                <span className={`text-xs mt-2 font-medium ${isCurrent ? 'text-primary-600' : 'text-secondary-500'}`}>
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

        {/* Right: Client & Order Info */}
        <div className="space-y-6">
          {/* Client Info */}
          <div className="bg-white rounded-xl border border-secondary-200 p-5">
            <h3 className="font-semibold text-secondary-900 mb-4 flex items-center gap-2">
              <User size={18} className="text-primary-500" />
              Client
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-secondary-500">Entreprise</span>
                <span className="font-medium text-secondary-900">{order.user.companyName || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-500">Email</span>
                <span className="text-secondary-900">{order.user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-500">Téléphone</span>
                <span className="text-secondary-900">{order.user.phone || '-'}</span>
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div className="bg-white rounded-xl border border-secondary-200 p-5">
            <h3 className="font-semibold text-secondary-900 mb-4">Détails commande</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-secondary-50 rounded-lg p-3">
                <p className="text-xs text-secondary-500 mb-1">Prix estimé</p>
                <p className="font-bold text-secondary-900">{order.estimatedPrice ? `${order.estimatedPrice} €` : '-'}</p>
              </div>
              <div className="bg-secondary-50 rounded-lg p-3">
                <p className="text-xs text-secondary-500 mb-1">Quantité</p>
                <p className="font-bold text-secondary-900">{order.quantity} pièce(s)</p>
              </div>
            </div>
            {order.notes && (
              <div className="mt-3 p-3 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg">
                <p className="text-xs text-amber-700 mb-1">Notes</p>
                <p className="text-sm text-amber-900">{order.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Invoices Section */}
      <div className="bg-white rounded-xl border border-secondary-200 p-6">
        <h3 className="font-semibold text-secondary-900 mb-4 flex items-center gap-2">
          <FileText size={18} className="text-primary-500" />
          Factures ({order.invoices.length})
        </h3>

        {order.invoices.length === 0 ? (
          <div className="text-center py-8 text-secondary-400">
            <FileText size={32} className="mx-auto mb-2 opacity-50" />
            <p>Aucune facture associée</p>
          </div>
        ) : (
          <div className="space-y-3">
            {order.invoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center gap-4 p-4 bg-secondary-50 rounded-lg">
                <div className="w-10 h-10 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center">
                  <FileText size={20} />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-secondary-900">{invoice.invoiceNumber}</p>
                  <div className="flex items-center gap-3 text-sm text-secondary-500">
                    <span>{new Date(invoice.issueDate).toLocaleDateString('fr-FR')}</span>
                    {invoice.amount && <span className="font-medium">{invoice.amount} €</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreviewUrl(resolveUrl(invoice.fileUrl))}
                    className="p-2 text-primary-600 hover:bg-primary-100 rounded-lg"
                  >
                    <Eye size={18} />
                  </button>
                  <a
                    href={resolveUrl(invoice.fileUrl)}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 text-secondary-600 hover:bg-secondary-200 rounded-lg"
                  >
                    <Download size={18} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Close Order Modal */}
      {showCloseModal && (
        <CloseOrderModal
          orderId={order.id}
          clientName={order.user.companyName || order.user.email}
          onClose={() => setShowCloseModal(false)}
          onSuccess={() => {
            setShowCloseModal(false);
            loadOrder();
          }}
        />
      )}

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

// ============================================
// Close Order Modal Component
// ============================================
function CloseOrderModal({ 
  orderId, 
  clientName,
  onClose, 
  onSuccess 
}: { 
  orderId: string; 
  clientName: string;
  onClose: () => void; 
  onSuccess: () => void;
}) {
  const [form, setForm] = useState({
    invoiceNumber: '',
    finalAmount: '',
    finalWeight: '',
    debitWeightAccount: false,
    metalType: 'OR_JAUNE_750',
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !form.invoiceNumber) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Upload the PDF file
      const uploadRes = await uploadFile(file);

      // 2. Close the order
      await postJSON(`/orders/${orderId}/close`, {
        invoiceNumber: form.invoiceNumber,
        invoiceFileUrl: uploadRes.url,
        finalAmount: form.finalAmount ? parseFloat(form.finalAmount) : undefined,
        finalWeight: form.finalWeight ? parseFloat(form.finalWeight) : undefined,
        debitWeightAccount: form.debitWeightAccount,
        metalType: form.debitWeightAccount ? form.metalType : undefined,
      });

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la clôture');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-secondary-200 sticky top-0 bg-white">
          <div>
            <h3 className="text-lg font-semibold text-secondary-900">Clôturer la commande</h3>
            <p className="text-sm text-secondary-500">Client : {clientName}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-secondary-100 rounded-lg">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* Invoice Number */}
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

          {/* PDF Upload */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1.5">
              Fichier Facture (PDF) *
            </label>
            <div className="border-2 border-dashed border-secondary-200 rounded-lg p-6 text-center hover:border-primary-400 transition-colors">
              <input
                type="file"
                accept=".pdf"
                onChange={e => setFile(e.target.files?.[0] || null)}
                className="hidden"
                id="close-invoice-file"
              />
              <label htmlFor="close-invoice-file" className="cursor-pointer">
                {file ? (
                  <div className="flex items-center justify-center gap-2 text-primary-600">
                    <FileText size={20} />
                    <span className="font-medium">{file.name}</span>
                  </div>
                ) : (
                  <>
                    <Upload size={24} className="mx-auto text-secondary-400 mb-2" />
                    <p className="text-sm text-secondary-500">Glissez ou cliquez pour sélectionner</p>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1.5">
              Montant final (€)
            </label>
            <div className="relative">
              <DollarSign size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" />
              <input
                type="number"
                step="0.01"
                value={form.finalAmount}
                onChange={e => setForm({ ...form, finalAmount: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Debit Section */}
          <div className="bg-secondary-50 rounded-xl p-4 space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.debitWeightAccount}
                onChange={e => setForm({ ...form, debitWeightAccount: e.target.checked })}
                className="w-5 h-5 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
              />
              <div>
                <span className="font-medium text-secondary-900">Débiter le compte poids</span>
                <p className="text-xs text-secondary-500">Retire automatiquement le poids du compte métal du client</p>
              </div>
            </label>

            {form.debitWeightAccount && (
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1.5">
                    Poids réel (g)
                  </label>
                  <div className="relative">
                    <Scale size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" />
                    <input
                      type="number"
                      step="0.001"
                      value={form.finalWeight}
                      onChange={e => setForm({ ...form, finalWeight: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="10.400"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1.5">
                    Type de métal
                  </label>
                  <select
                    value={form.metalType}
                    onChange={e => setForm({ ...form, metalType: e.target.value })}
                    className="w-full px-4 py-2.5 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {METAL_TYPES.map(m => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Info box */}
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
            <div className="flex items-start gap-3">
              <Mail size={18} className="text-blue-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">Notification automatique</p>
                <p className="text-xs text-blue-700 mt-0.5">
                  Un email sera envoyé au client pour l'informer que sa commande est terminée et que sa facture est disponible.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
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
              className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />}
              {loading ? 'Clôture...' : 'Clôturer & Notifier'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
