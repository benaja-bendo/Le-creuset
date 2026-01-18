import { useEffect, useState } from 'react';
import { getJSON, patchJSON } from '../../api/client';
import { CheckCircle2, XCircle, FileSignature } from 'lucide-react';

type PendingUser = {
  id: string;
  email: string;
  companyName: string;
  phone: string;
  address: string;
  kbisFileUrl: string;
  customsFileUrl: string;
  status: 'PENDING' | 'ACTIVE' | 'REJECTED';
};

export default function UsersPending() {
  const [users, setUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getJSON<PendingUser[]>('/users/pending');
        setUsers(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erreur de chargement');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const updateStatus = async (id: string, status: 'ACTIVE' | 'REJECTED') => {
    try {
      const ok = status === 'ACTIVE' 
        ? window.confirm('Confirmer la validation de ce compte ?')
        : window.confirm('Confirmer le rejet et suppression de ce compte ?');
      if (!ok) return;
      await patchJSON(`/users/${id}/status`, { status });
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur lors de la mise à jour');
    }
  };

  if (loading) {
    return (
      <div className="p-8 bg-white rounded-xl border border-secondary-200 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-secondary-100 rounded w-1/3"></div>
          <div className="h-4 bg-secondary-100 rounded w-1/2"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-24 bg-secondary-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Validation des Comptes</h1>
        <p className="text-secondary-500">Analysez les demandes et validez ou rejetez les comptes clients.</p>
      </div>

      {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded">{error}</div>}

      {users.length === 0 ? (
        <div className="p-8 bg-secondary-50 border border-secondary-200 rounded text-secondary-700">
          Aucune demande en attente.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {users.map((u) => (
            <div key={u.id} className="bg-white rounded-xl border border-secondary-200 shadow-sm">
              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-secondary-500">Entreprise</p>
                    <p className="text-lg font-semibold text-secondary-900">{u.companyName}</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">PENDING</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-secondary-500">Email</p>
                    <p className="text-sm text-secondary-900">{u.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-secondary-500">Téléphone</p>
                    <p className="text-sm text-secondary-900">{u.phone}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-secondary-500">Adresse</p>
                    <p className="text-sm text-secondary-900">{u.address}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <a className="text-sm text-primary-600 hover:underline flex items-center gap-1" href={u.kbisFileUrl} target="_blank" rel="noreferrer">
                    <FileSignature size={16} /> KBIS
                  </a>
                  <a className="text-sm text-primary-600 hover:underline flex items-center gap-1" href={u.customsFileUrl} target="_blank" rel="noreferrer">
                    <FileSignature size={16} /> Douanes
                  </a>
                </div>
              </div>
              <div className="p-4 border-t border-secondary-100 flex justify-end gap-3">
                <button
                  onClick={() => updateStatus(u.id, 'REJECTED')}
                  className="px-3 py-2 bg-red-50 text-red-700 border border-red-200 rounded hover:bg-red-100 flex items-center gap-2"
                  aria-label="Rejeter"
                >
                  <XCircle size={16} /> Rejeter
                </button>
                <button
                  onClick={() => updateStatus(u.id, 'ACTIVE')}
                  className="px-3 py-2 bg-green-50 text-green-700 border border-green-200 rounded hover:bg-green-100 flex items-center gap-2"
                  aria-label="Valider"
                >
                  <CheckCircle2 size={16} /> Valider
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
