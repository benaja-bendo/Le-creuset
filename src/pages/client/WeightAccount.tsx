import { useEffect, useState } from 'react';
import { getJSON } from '../../api/client';
import { Scale, Loader2, AlertCircle } from 'lucide-react';
import WeightGauges from '../../components/WeightGauges';

export default function WeightAccount() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getJSON<any[]>('/weights/me');
        setAccounts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur de chargement');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-24 space-y-4">
        <Loader2 className="animate-spin text-primary-500" size={48} />
        <p className="text-secondary-500 font-medium animate-pulse">Chargement de votre stock métaux...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-100 text-primary-600 rounded-xl">
            <Scale size={28} />
          </div>
          <h1 className="text-3xl font-bold text-secondary-900 tracking-tight font-serif">
            Mon Compte Poids
          </h1>
        </div>
        <p className="text-secondary-500 max-w-2xl">
          Consultez en temps réel vos disponibilités en métaux précieux et l'historique de vos apports et consommations de fonderie.
        </p>
      </div>

      {error ? (
        <div className="p-6 bg-red-50 border-2 border-red-100 text-red-700 rounded-2xl flex items-center gap-4">
          <AlertCircle size={24} className="shrink-0" />
          <div>
            <p className="font-bold">Une erreur est survenue</p>
            <p className="text-sm opacity-90">{error}</p>
          </div>
        </div>
      ) : accounts.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border-2 border-dashed border-secondary-200">
          <Scale size={64} className="mx-auto text-secondary-200 mb-4" />
          <h3 className="text-xl font-bold text-secondary-900">Aucun compte actif</h3>
          <p className="text-secondary-500">
            Vous n'avez pas encore de compte poids configuré. Vos comptes seront initialisés lors de votre première commande ou apport.
          </p>
        </div>
      ) : (
        <WeightGauges accounts={accounts} />
      )}

      {/* Warning/Info Footer */}
      <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100">
        <div className="flex gap-4">
          <div className="p-2 bg-amber-100 text-amber-600 rounded-xl h-fit">
            <AlertCircle size={20} />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-amber-900">À propos de votre compte poids</h4>
            <p className="text-sm text-amber-800 leading-relaxed">
              Votre solde est mis à jour après chaque opération de fonte ou apport de métal. 
              Un solde <span className="font-bold text-emerald-700 underline">positif</span> indique que vous avez du métal en stock chez nous. 
              Un solde <span className="font-bold text-red-700 underline">négatif</span> indique que vous avez utilisé du métal fourni par la fonderie qui reste à régulariser.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
