import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  History,
  TrendingDown,
  TrendingUp,
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
  const getMetalColor = (type: string, isNegative: boolean) => {
    if (isNegative) return 'bg-gradient-to-br from-red-800 to-red-900 border-red-700';
    
    if (type.includes('OR')) return 'bg-gradient-to-br from-amber-600 to-amber-700 border-amber-600';
    if (type.includes('ARGENT')) return 'bg-gradient-to-br from-slate-400 to-slate-500 border-slate-400';
    if (type.includes('PLATINE') || type.includes('PALLADIUM')) return 'bg-gradient-to-br from-zinc-600 to-zinc-700 border-zinc-500';
    
    return 'bg-gradient-to-br from-secondary-800 to-secondary-900 border-secondary-800';
  };

  const getMetalName = (type: string) => type.replace(/_/g, ' ');

  return (
    <div className="space-y-12">
      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {accounts.map((acc) => {
          const isNegative = acc.balance < 0;
          return (
            <div 
              key={acc.id} 
              className={`p-6 rounded-2xl text-white shadow-lg overflow-hidden relative border border-transparent transition-all min-h-[160px]
                 ${getMetalColor(acc.metalType, isNegative)}`}
            >
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex justify-between items-start">
                   <p className="text-white/80 text-sm font-bold uppercase tracking-widest mb-2">
                      {getMetalName(acc.metalType)}
                   </p>
                   {isNegative && (
                     <div className="px-2 py-0.5 bg-red-950/50 text-red-200 text-[10px] uppercase font-bold rounded-full border border-red-800/50">
                       Débiteur
                     </div>
                   )}
                </div>
                <div className="flex items-baseline gap-1 mt-auto">
                   <p className={`text-4xl lg:text-5xl font-black tracking-tighter ${isNegative ? 'text-red-100' : 'text-white'}`}>
                     {acc.balance.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
                   </p>
                   <span className="text-lg font-bold opacity-70">g</span>
                </div>
              </div>
              <div className="absolute -right-4 -bottom-4 opacity-10">
                {isNegative ? <TrendingDown size={140} /> : <TrendingUp size={140} />}
              </div>
            </div>
          );
        })}
      </div>

      {accounts.some(a => a.balance < 0) && (
        <div className="p-4 bg-red-50 text-red-800 rounded-xl border border-red-200 flex gap-3 text-sm">
           <AlertCircle className="shrink-0 mt-0.5 text-red-600" size={18} />
           <div>
              <p className="font-bold mb-1">⚠️ Veuillez régulariser votre compte poids</p>
              <p>Votre solde de métal est négatif. Ceci indique que nous vous avons avancé du métal de notre propre stock lors de vos dernières commandes. Veuillez prévoir un apport pour régulariser votre compte.</p>
           </div>
        </div>
      )}

      {/* Transaction History Sub-sections */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-secondary-900 flex items-center gap-2">
           <History className="text-primary-500" />
           Historique détaillé des flux
        </h2>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {accounts.filter(a => a.transactions && a.transactions.length > 0).map(acc => (
            <div key={`history-${acc.id}`} className="bg-white rounded-2xl border border-secondary-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-secondary-100 bg-secondary-50/50 flex items-center justify-between">
                <h3 className="font-bold text-secondary-900 uppercase tracking-widest text-sm text-secondary-500">
                  {getMetalName(acc.metalType)}
                </h3>
              </div>
              <div className="divide-y divide-secondary-100">
                {acc.transactions?.map((tx) => (
                  <div key={tx.id} className="p-5 flex items-center justify-between hover:bg-secondary-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl shadow-sm flex items-center justify-center border
                        ${tx.type === 'CREDIT' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                        {tx.type === 'CREDIT' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                      </div>
                      <div>
                        <p className="font-bold text-secondary-900">{tx.label}</p>
                        <p className="text-xs text-secondary-500 font-medium">
                          {new Date(tx.date).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-black text-lg tracking-tighter ${tx.type === 'CREDIT' ? 'text-emerald-600' : 'text-red-600'}`}>
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
    </div>
  );
}
