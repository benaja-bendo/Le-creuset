import { useEffect, useState } from 'react';
import { getJSON, postJSON } from '../../api/client';
import { Plus, Search, User, History, ArrowUpRight, ArrowDownLeft, Loader2, AlertCircle, TrendingDown, Scale } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../components/ui/tooltip';

type Transaction = {
  id: string;
  type: 'CREDIT' | 'DEBIT';
  amount: number;
  label: string;
  date: string;
};

type MetalAccount = {
  id: string;
  metalType: string;
  balance: number;
  lastUpdate: string;
  transactions?: Transaction[];
  user: {
    id: string;
    email: string;
    companyName: string | null;
  };
};

type UserWithAccounts = {
  userId: string;
  email: string;
  companyName: string | null;
  accounts: MetalAccount[];
};

export default function Weights() {
  const [groupedUsers, setGroupedUsers] = useState<UserWithAccounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  
  // Transaction Modal State
  const [showTxModal, setShowTxModal] = useState(false);
  const [selectedUserForTx, setSelectedUserForTx] = useState<UserWithAccounts | null>(null);
  const [selectedMetalTypeForTx, setSelectedMetalTypeForTx] = useState<string>('');
  
  const [txForm, setTxForm] = useState({
    type: 'CREDIT',
    amount: '',
    label: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [submitting, setSubmitting] = useState(false);

  // History Modal State
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedUserForHistory, setSelectedUserForHistory] = useState<UserWithAccounts | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      // Backend actually returns a flat list of accounts. We group them here.
      const data = await getJSON<MetalAccount[]>('/weights/all');
      
      const userMap = new Map<string, UserWithAccounts>();
      
      data.forEach(acc => {
        if (!userMap.has(acc.user.id)) {
          userMap.set(acc.user.id, {
            userId: acc.user.id,
            email: acc.user.email,
            companyName: acc.user.companyName,
            accounts: []
          });
        }
        userMap.get(acc.user.id)!.accounts.push(acc);
      });
      
      // Sort users by name, but prioritize those with negative balances
      const sortedUsers = Array.from(userMap.values() || []).sort((a, b) => {
        const aHasDebt = a.accounts.some(acc => acc.balance < 0);
        const bHasDebt = b.accounts.some(acc => acc.balance < 0);
        if (aHasDebt && !bHasDebt) return -1;
        if (!aHasDebt && bHasDebt) return 1;
        
        const nameA = (a.companyName || a.email).toLowerCase();
        const nameB = (b.companyName || b.email).toLowerCase();
        return nameA.localeCompare(nameB);
      });

      setGroupedUsers(sortedUsers);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filteredUsers = groupedUsers.filter(u => 
    u.companyName?.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const getMetalColor = (type: string) => {
    if (type.includes('OR')) return 'bg-amber-50 text-amber-700 border-amber-200';
    if (type.includes('ARGENT')) return 'bg-slate-50 text-slate-700 border-slate-200';
    if (type.includes('PLATINE') || type.includes('PALLADIUM')) return 'bg-zinc-100 text-zinc-700 border-zinc-300';
    return 'bg-secondary-50 text-secondary-700 border-secondary-200';
  };

  const getMetalName = (type: string) => type.replace(/_/g, ' ');

  const handleTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForTx || !selectedMetalTypeForTx) return;
    
    // Find specific account
    const account = selectedUserForTx.accounts.find(a => a.metalType === selectedMetalTypeForTx);
    if (!account) return;

    setSubmitting(true);
    try {
      await postJSON(`/weights/${account.id}/transaction`, {
        ...txForm,
        amount: parseFloat(txForm.amount),
      });
      setShowTxModal(false);
      setTxForm({ type: 'CREDIT', amount: '', label: '', date: new Date().toISOString().split('T')[0] });
      load(); // Refresh data
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erreur lors de la transaction');
    } finally {
      setSubmitting(false);
    }
  };

  const openTxModal = (user: UserWithAccounts, metalType: string = '') => {
    setSelectedUserForTx(user);
    const mType = metalType || (user.accounts.length > 0 ? user.accounts[0].metalType : '');
    setSelectedMetalTypeForTx(mType);
    setShowTxModal(true);
  };
  
  const openHistoryModal = async (user: UserWithAccounts) => {
    setSelectedUserForHistory(user);
    setShowHistoryModal(true);
    
    // Fetch transaction history explicitly for this user's accounts
    try {
        const fullAccounts = await getJSON<MetalAccount[]>(`/weights/user/${user.userId}`);
        setSelectedUserForHistory({
            ...user,
            accounts: fullAccounts
        });
    } catch (err) {
        console.error(err);
    }
  };

  if (loading && groupedUsers.length === 0) {
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
          <div className="flex items-center gap-3 mb-1">
             <div className="p-2 bg-primary-100 text-primary-600 rounded-xl">
               <Scale size={24} />
             </div>
             <h1 className="text-2xl font-bold text-secondary-900">Soldes Métaux Clients</h1>
          </div>
          <p className="text-secondary-500">Supervisez les comptes (Or Fin, Argent, Platine, Palladium) et ajustez les soldes.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" size={18} />
          <input
            type="text"
            placeholder="Rechercher un client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 bg-white border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none w-full md:w-80 shadow-sm text-secondary-900"
          />
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}

      {/* Grid of Users */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {filteredUsers.length === 0 ? (
          <div className="col-span-full p-12 text-center text-secondary-400 bg-white rounded-2xl border border-secondary-200">
            <User size={48} className="mx-auto mb-4 opacity-20" />
            <p>Aucun client trouvé</p>
          </div>
        ) : (
          filteredUsers.map(user => {
            const hasDebt = user.accounts.some(a => a.balance < 0);
            
            return (
              <div key={user.userId} className={`bg-white rounded-2xl shadow-sm border-2 overflow-hidden flex flex-col transition-shadow hover:shadow-md
                  ${hasDebt ? 'border-red-200' : 'border-secondary-200'}`}>
                
                {/* User Header */}
                <div className="p-5 border-b border-secondary-100 flex items-center justify-between bg-secondary-50/30">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg
                      ${hasDebt ? 'bg-red-100 text-red-700' : 'bg-primary-100 text-primary-700'}`}>
                      {user.companyName ? user.companyName.substring(0, 2).toUpperCase() : <User size={24} />}
                    </div>
                    <div>
                      <h3 className="font-bold text-secondary-900 text-lg flex items-center gap-2">
                        {user.companyName || 'Sans entreprise'}
                        {hasDebt && (
                           <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">
                             <TrendingDown size={12} /> Débiteur
                           </span>
                        )}
                      </h3>
                      <p className="text-sm text-secondary-500">{user.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                     <Tooltip>
                        <TooltipTrigger asChild>
                           <button 
                             onClick={() => openHistoryModal(user)}
                             className="p-2 text-secondary-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                           >
                             <History size={18} />
                           </button>
                        </TooltipTrigger>
                        <TooltipContent>Voir l'historique complet</TooltipContent>
                     </Tooltip>
                     <button
                       onClick={() => openTxModal(user)}
                       className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary-900 text-white rounded-lg text-sm font-medium hover:bg-secondary-800 transition-colors shadow-sm"
                     >
                       <Plus size={16} /> Ajuster
                     </button>
                  </div>
                </div>

                {/* Metal Accounts Grid */}
                <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-3 bg-white flex-1">
                  {user.accounts.map(acc => {
                     const isNegative = acc.balance < 0;
                     return (
                        <div key={acc.id} className={`p-3 rounded-xl border flex flex-col justify-between
                            ${isNegative ? 'bg-red-50 border-red-200' : getMetalColor(acc.metalType)}`}>
                            <span className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${isNegative ? 'text-red-700' : 'opacity-70'}`}>
                                {getMetalName(acc.metalType)}
                            </span>
                            <div className="flex items-baseline gap-1 mt-auto">
                                <span className={`text-xl font-black tracking-tighter ${isNegative ? 'text-red-700' : ''}`}>
                                  {acc.balance.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
                                </span>
                                <span className={`text-xs font-bold ${isNegative ? 'text-red-500' : 'opacity-60'}`}>g</span>
                            </div>
                            {isNegative && (
                              <p className="text-[9px] font-bold text-red-600 mt-1.5 leading-tight">
                                ⚠️ Veuillez régulariser votre compte poids
                              </p>
                            )}
                        </div>
                     )
                  })}
                  {user.accounts.length === 0 && (
                     <div className="col-span-4 text-center py-4 text-sm text-secondary-400 italic">
                        Aucun compte initialisé
                     </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Transaction Modal (Same logic but adapted for user selection visually) */}
      {showTxModal && selectedUserForTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-secondary-950/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-secondary-100 flex items-center justify-between">
              <div>
                 <h3 className="text-xl font-bold text-secondary-900">Nouveau Mouvement</h3>
                 <p className="text-sm text-secondary-500 font-medium">{selectedUserForTx.companyName || selectedUserForTx.email}</p>
              </div>
              <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center">
                 <Scale size={24} />
              </div>
            </div>
            
            <form onSubmit={handleTransaction} className="p-6 space-y-4">
              <div>
                 <label className="block text-sm font-medium text-secondary-700 mb-1.5">Compte Métal Ciblé *</label>
                 <select 
                   value={selectedMetalTypeForTx}
                   onChange={e => setSelectedMetalTypeForTx(e.target.value)}
                   className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 text-secondary-900 font-medium"
                   required
                 >
                    <option value="" disabled>Sélectionner le métal...</option>
                    {selectedUserForTx.accounts.map(acc => (
                       <option key={acc.id} value={acc.metalType}>{getMetalName(acc.metalType)} (Solde: {acc.balance}g)</option>
                    ))}
                 </select>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setTxForm({ ...txForm, type: 'CREDIT' })}
                  className={`py-3 rounded-xl flex items-center justify-center gap-2 font-bold border-2 transition-all
                    ${txForm.type === 'CREDIT' 
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm' 
                      : 'bg-white border-secondary-100 text-secondary-400 hover:border-secondary-300'}`}
                >
                  <ArrowDownLeft size={18} /> CRÉDIT (Dépôt)
                </button>
                <button
                  type="button"
                  onClick={() => setTxForm({ ...txForm, type: 'DEBIT' })}
                  className={`py-3 rounded-xl flex items-center justify-center gap-2 font-bold border-2 transition-all
                    ${txForm.type === 'DEBIT' 
                      ? 'bg-red-50 border-red-500 text-red-700 shadow-sm' 
                      : 'bg-white border-secondary-100 text-secondary-400 hover:border-secondary-300'}`}
                >
                  <ArrowUpRight size={18} /> DÉBIT (Retrait)
                </button>
              </div>

              <div className="pt-2">
                <label className="block text-sm font-medium text-secondary-700 mb-1.5">Masse (en grammes) *</label>
                <div className="relative">
                   <input
                     type="number"
                     step="0.01"
                     required
                     value={txForm.amount}
                     onChange={(e) => setTxForm({ ...txForm, amount: e.target.value })}
                     placeholder="0.00"
                     className="w-full pl-4 pr-12 py-2.5 bg-white border border-secondary-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 text-secondary-900 font-bold text-lg"
                   />
                   <div className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary-400 font-bold">g</div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1.5">Libellé / Référence *</label>
                <input
                  type="text"
                  required
                  value={txForm.label}
                  onChange={(e) => setTxForm({ ...txForm, label: e.target.value })}
                  placeholder="Ex: Apport métal comptoir, Sortie prod #123..."
                  className="w-full px-4 py-2.5 bg-white border border-secondary-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 text-secondary-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1.5">Date effective</label>
                <input
                  type="date"
                  required
                  value={txForm.date}
                  onChange={(e) => setTxForm({ ...txForm, date: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-secondary-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 text-secondary-900"
                />
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-secondary-100">
                <button
                  type="button"
                  onClick={() => setShowTxModal(false)}
                  className="px-6 py-2.5 text-secondary-600 font-medium hover:bg-secondary-50 rounded-xl transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-2.5 bg-secondary-900 text-white font-bold rounded-xl hover:bg-secondary-800 disabled:opacity-50 shadow-lg flex items-center gap-2"
                >
                  {submitting && <Loader2 className="animate-spin" size={18} />}
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && selectedUserForHistory && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-secondary-950/40 backdrop-blur-sm" onClick={() => setShowHistoryModal(false)}>
         <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300" onClick={e => e.stopPropagation()}>
           <div className="p-6 border-b border-secondary-100 flex items-center justify-between shrink-0 bg-secondary-50/50">
             <div>
                <h3 className="text-xl font-bold text-secondary-900 flex items-center gap-2">
                   <History className="text-primary-500" />
                   Historique complet
                </h3>
                <p className="text-secondary-600 font-medium mt-1">{selectedUserForHistory.companyName || selectedUserForHistory.email}</p>
             </div>
             <button 
               onClick={() => setShowHistoryModal(false)}
               className="p-2 text-secondary-400 hover:text-secondary-700 hover:bg-secondary-100 rounded-xl transition-colors"
             >
                Fermer
             </button>
           </div>
           
           <div className="p-6 overflow-y-auto bg-slate-50 flex-1 space-y-8">
              {selectedUserForHistory.accounts.filter(a => a.transactions?.length).length === 0 ? (
                 <div className="text-center py-12 text-secondary-400">Aucune transaction enregistrée pour ce client.</div>
              ) : (
                 selectedUserForHistory.accounts.filter(a => a.transactions?.length).map(acc => (
                 <div key={acc.id} className="bg-white rounded-xl border border-secondary-200 overflow-hidden shadow-sm">
                    <div className="px-5 py-3 border-b border-secondary-100 flex justify-between items-center bg-secondary-50/30">
                       <span className="font-bold text-secondary-900 uppercase tracking-wide text-sm">{getMetalName(acc.metalType)}</span>
                       <span className={`font-black tracking-tighter ${acc.balance < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                          Solde: {acc.balance.toLocaleString('fr-FR')} g
                       </span>
                    </div>
                    <div className="divide-y divide-secondary-100">
                       {acc.transactions?.map(tx => (
                          <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-secondary-50/30 transition-colors">
                             <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm border
                                   ${tx.type === 'CREDIT' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                                   {tx.type === 'CREDIT' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                                </div>
                                <div>
                                   <p className="font-bold text-secondary-900">{tx.label}</p>
                                   <p className="text-xs text-secondary-500 font-medium">
                                      {new Date(tx.date).toLocaleDateString('fr-FR', {
                                         day: '2-digit', month: 'short', year: 'numeric'
                                      })}
                                   </p>
                                </div>
                             </div>
                             <div className="text-right">
                                <p className={`font-black text-lg tracking-tighter ${tx.type === 'CREDIT' ? 'text-emerald-600' : 'text-red-600'}`}>
                                   {tx.type === 'CREDIT' ? '+' : '-'}{Math.abs(tx.amount).toLocaleString('fr-FR')} g
                                </p>
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>
                 ))
              )}
           </div>
         </div>
       </div>
      )}
    </div>
  );
}
