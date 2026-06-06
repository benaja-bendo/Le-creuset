import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { 
  FileText, 
  Upload, 
  ArrowLeft,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { getJSON, postJSON, uploadFile } from '../../api/client';

type Order = {
  id: string;
  status: string;
  userId: string;
  invoiceGroupId?: string;
  user?: { companyName: string; email: string };
  createdAt: string;
};

export default function AdminCreateInvoice() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialOrderId = searchParams.get('orderId');

  const [orders, setOrders] = useState<Order[]>([]);
  const [invoicedOrderIds, setInvoicedOrderIds] = useState<Set<string>>(new Set());
  const [loadingData, setLoadingData] = useState(true);

  const [selectedUserId, setSelectedUserId] = useState('');
  const [form, setForm] = useState({
    invoiceNumber: '',
    orderId: initialOrderId || '',
    amount: '',
    notes: '',
  });
  
  // Transaction métal optionnelle (dépôt métal) persistante
  const [metalForm, setMetalForm] = useState({
    metalType: 'OR_FIN',
    metalWeight: '',
    metalTransactionType: 'CREDIT' as 'CREDIT' | 'DEBIT',
  });
  
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [ord, inv] = await Promise.all([
          getJSON<Order[]>('/orders'),
          getJSON<{ orderId?: string }[]>('/invoices'),
        ]);
        setOrders(ord);
        setInvoicedOrderIds(new Set(inv.filter(i => i.orderId).map(i => i.orderId as string)));
        
        if (initialOrderId) {
          const initialOrder = ord.find(o => o.id === initialOrderId);
          if (initialOrder) {
            setSelectedUserId(initialOrder.userId);
          }
        }
      } catch {
        setError('Erreur lors du chargement des données.');
      } finally {
        setLoadingData(false);
      }
    }
    load();
  }, [initialOrderId]);

  // Get unique users from orders
  const uniqueUsers = Array.from(
    new Map(orders.filter(o => o.user).map(o => [o.user!.email, o.user!])).values()
  );

  const availableOrders = orders.filter(o =>
    o.userId === selectedUserId &&
    !o.invoiceGroupId &&
    !invoicedOrderIds.has(o.id)
  );

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
      
      const includeMetal = !!metalForm.metalWeight && parseFloat(metalForm.metalWeight) > 0;
      
      await postJSON('/invoices', {
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

      navigate('/client/admin/invoices');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création');
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="animate-spin text-primary-500" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <Link to="/client/admin/invoices" className="inline-flex items-center gap-2 text-secondary-500 hover:text-secondary-700 text-sm font-medium">
        <ArrowLeft size={16} />
        Retour aux factures
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Nouvelle Facture</h1>
        <p className="text-secondary-500">Créer une facture individuelle et ajouter un dépôt métal si nécessaire.</p>
      </div>

      <div className="bg-white rounded-xl border border-secondary-200 shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center gap-2">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1.5">
                Commande associée
              </label>
              <select
                value={form.orderId}
                onChange={e => setForm({ ...form, orderId: e.target.value })}
                className="w-full px-4 py-2.5 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-secondary-900"
                disabled={!selectedUserId}
              >
                <option value="">Aucune (facture libre)</option>
                <option value="DEPOT_METAL">⚙ Dépôt métal uniquement</option>
                {availableOrders.map(o => (
                  <option key={o.id} value={o.id}>
                    #{o.id.slice(-6)} - {o.status} ({new Date(o.createdAt).toLocaleDateString('fr-FR')})
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
                className="w-full px-4 py-2.5 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-secondary-900"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Affichage persistant du dépôt métal */}
          <div className="p-5 bg-amber-50 border border-amber-200 rounded-xl space-y-4">
            <div>
              <h4 className="font-bold text-amber-800 flex items-center gap-2">
                Transaction Métal Optionnelle
              </h4>
              <p className="text-sm text-amber-700 mt-1">
                Laissez la masse vide si vous ne souhaitez pas modifier le compte poids.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Métal</label>
                <select
                  value={metalForm.metalType}
                  onChange={e => setMetalForm({ ...metalForm, metalType: e.target.value })}
                  className="w-full px-3 py-2.5 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-secondary-900 bg-white"
                >
                  <option value="OR_FIN">Or Fin</option>
                  <option value="ARGENT_FIN">Argent Fin</option>
                  <option value="PLATINE">Platine</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Sens</label>
                <select
                  value={metalForm.metalTransactionType}
                  onChange={e => setMetalForm({ ...metalForm, metalTransactionType: e.target.value as 'CREDIT' | 'DEBIT' })}
                  className="w-full px-3 py-2.5 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-secondary-900 bg-white"
                >
                  <option value="CREDIT">Crédit (apport)</option>
                  <option value="DEBIT">Débit (retrait)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Masse (g)</label>
                <input
                  type="number"
                  step="0.001"
                  value={metalForm.metalWeight}
                  onChange={e => setMetalForm({ ...metalForm, metalWeight: e.target.value })}
                  className="w-full px-3 py-2.5 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-secondary-900"
                  placeholder="0.000"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1.5">
              Fichier PDF *
            </label>
            <div className="border-2 border-dashed border-secondary-200 rounded-xl p-8 text-center hover:border-primary-400 transition-colors">
              <input
                type="file"
                accept=".pdf"
                onChange={e => setFile(e.target.files?.[0] || null)}
                className="hidden"
                id="invoice-file"
              />
              <label htmlFor="invoice-file" className="cursor-pointer">
                {file ? (
                  <div className="flex flex-col items-center justify-center gap-2 text-primary-600">
                    <FileText size={32} />
                    <span className="font-medium text-lg">{file.name}</span>
                    <span className="text-sm text-secondary-500 hover:underline">Changer de fichier</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-secondary-50 rounded-full flex items-center justify-center mb-4">
                      <Upload size={28} className="text-secondary-400" />
                    </div>
                    <p className="font-medium text-secondary-900 text-lg mb-1">Cliquez pour sélectionner un PDF</p>
                    <p className="text-sm text-secondary-500">Formats supportés: .pdf</p>
                  </div>
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
              rows={3}
              placeholder="Notes internes, détails sur le dépôt métal..."
            />
          </div>

          <div className="pt-4 flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/client/admin/invoices')}
              className="flex-1 px-6 py-3 border border-secondary-200 text-secondary-700 rounded-xl font-medium hover:bg-secondary-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center gap-2 shadow-md transition-colors"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} />}
              {loading ? 'Création en cours...' : 'Créer la facture'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}