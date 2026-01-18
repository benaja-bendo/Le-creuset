import { useEffect, useState } from 'react';
import { getJSON, postJSON } from '../../api/client';
import { Plus, Search, User, History, ArrowUpRight, ArrowDownLeft, Loader2, AlertCircle } from 'lucide-react';

type MetalAccount = {
  id: string;
  metalType: string;
  balance: number;
  lastUpdate: string;
  user: {
    id: string;
    email: string;
    companyName: string;
  };
};

export default function Weights() {
  const [accounts, setAccounts] = useState<MetalAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<MetalAccount | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [txForm, setTxForm] = useState({
    type: 'CREDIT',
    amount: '',
    label: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const data = await getJSON<MetalAccount[]>('/weights/all');
      setAccounts(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filteredAccounts = accounts.filter(acc => 
    acc.user.companyName?.toLowerCase().includes(search.toLowerCase()) ||
    acc.user.email.toLowerCase().includes(search.toLowerCase()) ||
    acc.metalType.toLowerCase().includes(search.toLowerCase())
  );

  const handleTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount) return;
    
    setSubmitting(true);
    try {
      await postJSON(`/weights/${selectedAccount.id}/transaction`, {
        ...txForm,
        amount: parseFloat(txForm.amount),
      });
      setShowModal(false);
      setTxForm({ type: 'CREDIT', amount: '', label: '', date: new Date().toISOString().split('T')[0] });
      load(); // Refresh data
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erreur lors de la transaction');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && accounts.length === 0) {
    return (
      <div className="p-12 flex justify-center">
        <Loader2 className="animate-spin text-primary-500" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Soldes Métaux</h1>
          <p className="text-secondary-500">Gérez les comptes poids des clients et enregistrez les mouvements.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" size={18} />
          <input
            type="text"
            placeholder="Rechercher un client ou métal..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 bg-white border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none w-full md:w-80 shadow-sm"
          />
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}

      <div className="bg-white rounded-xl border border-secondary-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary-50 border-b border-secondary-200 text-secondary-500 font-medium">
              <tr>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Métal</th>
                <th className="px-6 py-4">Solde Actuel</th>
                <th className="px-6 py-4">Dernière MaJ</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-100">
              {filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-secondary-400 italic">Aucun compte trouvé</td>
                </tr>
              ) : (
                filteredAccounts.map((acc) => (
                  <tr key={acc.id} className="hover:bg-secondary-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-secondary-100 flex items-center justify-center text-secondary-600">
                          <User size={16} />
                        </div>
                        <div>
                          <p className="font-semibold text-secondary-900">{acc.user.companyName || 'Sans nom'}</p>
                          <p className="text-xs text-secondary-500">{acc.user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-secondary-700">{acc.metalType}</td>
                    <td className="px-6 py-4">
                      <span className={`text-lg font-bold ${acc.balance < 0 ? 'text-red-600' : 'text-secondary-900'}`}>
                        {acc.balance} <span className="text-xs font-normal text-secondary-500 uppercase">g</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-secondary-500 flex items-center gap-2">
                      <History size={14} /> {acc.lastUpdate ? new Date(acc.lastUpdate).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedAccount(acc);
                          setShowModal(true);
                        }}
                        className="px-3 py-1.5 bg-primary-600 text-white rounded-md text-xs font-medium hover:bg-primary-700 transition-colors inline-flex items-center gap-1.5 shadow-sm"
                      >
                        <Plus size={14} /> Mouvement
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && selectedAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-secondary-950/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-secondary-100">
              <h3 className="text-xl font-bold text-secondary-900">Nouveau Mouvement</h3>
              <p className="text-sm text-secondary-500">
                Client : <span className="font-medium text-secondary-700">{selectedAccount.user.companyName}</span>
                <br />
                Métal : <span className="font-medium text-secondary-700">{selectedAccount.metalType}</span>
              </p>
            </div>
            
            <form onSubmit={handleTransaction} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTxForm({ ...txForm, type: 'CREDIT' })}
                  className={`py-3 rounded-lg flex items-center justify-center gap-2 font-medium border-2 transition-all
                    ${txForm.type === 'CREDIT' 
                      ? 'bg-green-50 border-green-600 text-green-700' 
                      : 'bg-white border-secondary-100 text-secondary-500'}`}
                >
                  <ArrowUpRight size={18} /> Crédit
                </button>
                <button
                  type="button"
                  onClick={() => setTxForm({ ...txForm, type: 'DEBIT' })}
                  className={`py-3 rounded-lg flex items-center justify-center gap-2 font-medium border-2 transition-all
                    ${txForm.type === 'DEBIT' 
                      ? 'bg-red-50 border-red-600 text-red-700' 
                      : 'bg-white border-secondary-100 text-secondary-500'}`}
                >
                  <ArrowDownLeft size={18} /> Débit
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Masse (en grammes)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={txForm.amount}
                  onChange={(e) => setTxForm({ ...txForm, amount: e.target.value })}
                  placeholder="0.00"
                  className="w-full px-4 py-2 bg-secondary-50 border border-secondary-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Libellé / Référence</label>
                <input
                  type="text"
                  required
                  value={txForm.label}
                  onChange={(e) => setTxForm({ ...txForm, label: e.target.value })}
                  placeholder="Ex: Apport métal, Sortie production #123..."
                  className="w-full px-4 py-2 bg-secondary-50 border border-secondary-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={txForm.date}
                  onChange={(e) => setTxForm({ ...txForm, date: e.target.value })}
                  className="w-full px-4 py-2 bg-secondary-50 border border-secondary-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 text-secondary-600 font-medium hover:bg-secondary-50 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-2 bg-secondary-900 text-white font-bold rounded-lg hover:bg-secondary-800 disabled:opacity-50 shadow-lg flex items-center gap-2"
                >
                  {submitting && <Loader2 className="animate-spin" size={18} />}
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
