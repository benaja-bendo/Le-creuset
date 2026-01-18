import { 
  Scale, 
  ArrowUpRight, 
  ArrowDownLeft, 
  History,
  TrendingUp,
  TrendingDown,
  AlertCircle
} from 'lucide-react';

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
};

interface WeightGaugesProps {
  accounts: MetalAccount[];
}

export default function WeightGauges({ accounts }: WeightGaugesProps) {
  const getMetalColor = (type: string) => {
    if (type.includes('OR')) return 'from-amber-400 to-amber-600';
    if (type.includes('ARGENT')) return 'from-slate-300 to-slate-400';
    if (type.includes('PLATINE') || type.includes('PALLADIUM')) return 'from-slate-400 to-slate-600';
    return 'from-secondary-400 to-secondary-600';
  };

  const formatMetalLabel = (type: string) => {
    return type.replace(/_/g, ' ');
  };

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {accounts.map((acc) => {
          const isNegative = acc.balance < 0;
          return (
            <div 
              key={acc.id} 
              className={`relative overflow-hidden bg-white rounded-2xl border-2 transition-all p-6 shadow-sm
                ${isNegative ? 'border-red-100' : 'border-emerald-100'}`}
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${getMetalColor(acc.metalType)} text-white shadow-lg`}>
                  <Scale size={20} />
                </div>
                {isNegative ? (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-bold border border-red-100 uppercase tracking-tight">
                    <TrendingDown size={14} /> Solde Débiteur
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold border border-emerald-100 uppercase tracking-tight">
                    <TrendingUp size={14} /> Stock Disponible
                  </div>
                )}
              </div>

              {/* Balance */}
              <div className="space-y-1">
                <h3 className="text-secondary-500 text-sm font-medium uppercase tracking-wider">
                  {formatMetalLabel(acc.metalType)}
                </h3>
                <div className="flex items-baseline gap-2">
                  <span className={`text-3xl font-black tracking-tighter ${isNegative ? 'text-red-600' : 'text-emerald-600'}`}>
                    {acc.balance.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-secondary-400 font-bold text-lg">g</span>
                </div>
              </div>

              {/* Progress/Gauge indicator */}
              <div className="mt-6 space-y-2">
                <div className="h-2 w-full bg-secondary-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${isNegative ? 'bg-red-500' : 'bg-emerald-500'}`}
                    style={{ width: `${Math.min(100, Math.abs(acc.balance) * 2)}%` }} // Arbitrary ratio for visualization
                  />
                </div>
                <div className="flex justify-between text-[10px] text-secondary-400 font-bold uppercase tracking-widest">
                  <span>Usage Fonderie</span>
                  <span>Apport Atelier</span>
                </div>
              </div>

              {/* Alert for negative balance */}
              {isNegative && (
                <div className="mt-4 flex items-start gap-2 p-3 bg-red-50 text-red-800 rounded-lg text-xs leading-relaxed border border-red-100">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  <p>Metal dû à la fonderie. Merci de prévoir un apport pour vos prochaines fontes.</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Transaction History Sub-sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {accounts.filter(a => a.transactions && a.transactions.length > 0).map(acc => (
          <div key={`history-${acc.id}`} className="bg-white rounded-2xl border border-secondary-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-secondary-100 bg-secondary-50/50 flex items-center justify-between">
              <h3 className="font-bold text-secondary-900 flex items-center gap-2">
                <History size={18} className="text-primary-500" />
                Historique {formatMetalLabel(acc.metalType)}
              </h3>
            </div>
            <div className="divide-y divide-secondary-100">
              {acc.transactions?.map((tx) => (
                <div key={tx.id} className="px-6 py-4 flex items-center justify-between hover:bg-secondary-50/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center
                      ${tx.type === 'CREDIT' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                      {tx.type === 'CREDIT' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                    </div>
                    <div>
                      <p className="font-semibold text-secondary-900">{tx.label}</p>
                      <p className="text-xs text-secondary-500">
                        {new Date(tx.date).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${tx.type === 'CREDIT' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {tx.type === 'CREDIT' ? '+' : '-'}{Math.abs(tx.amount).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} g
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
