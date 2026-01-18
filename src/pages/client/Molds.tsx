import { useState, useEffect } from 'react';
import { getJSON, API_URL } from '../../api/client';
import { Layers, Search, AlertCircle, Loader2, CameraOff } from 'lucide-react';

type Mold = {
  id: string;
  reference: string;
  name: string;
  photoUrl?: string;
};

export default function Molds() {
  const [molds, setMolds] = useState<Mold[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchMolds() {
      try {
        const data = await getJSON<Mold[]>('/molds/me');
        setMolds(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur de chargement');
      } finally {
        setLoading(false);
      }
    }
    fetchMolds();
  }, []);

  const filteredMolds = molds.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) || 
    m.reference.toLowerCase().includes(search.toLowerCase())
  );

  const resolvePhotoUrl = (path?: string) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${API_URL}/storage/file/${path.split('/').pop()}`;
  };

  if (loading) {
    return (
      <div className="p-12 flex justify-center">
        <Loader2 className="animate-spin text-primary-500" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 font-serif">Bibliothèque de Moules</h1>
          <p className="text-secondary-500">Consultez vos empreintes et moules archivés à la fonderie.</p>
        </div>
        
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" size={18} />
          <input
            type="text"
            placeholder="Rechercher un moule..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-secondary-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}

      {filteredMolds.length === 0 ? (
        <div className="p-16 bg-white rounded-xl border border-secondary-200 text-center shadow-sm">
          <Layers className="mx-auto text-secondary-100 mb-6" size={64} />
          <h3 className="text-xl font-medium text-secondary-900 mb-2">
            {search ? 'Aucun résultat' : 'Votre bibliothèque est vide'}
          </h3>
          <p className="text-secondary-500 max-w-sm mx-auto">
            {search 
              ? "Aucun moule ne correspond à votre recherche. Essayez avec un autre mot-clé." 
              : "Vos empreintes apparaîtront ici une fois les premiers tirages effectués et archivés."
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMolds.map((mold) => (
            <div key={mold.id} className="group bg-white rounded-xl border border-secondary-200 shadow-sm overflow-hidden hover:shadow-xl hover:border-primary-200 transition-all duration-300 transform hover:-translate-y-1">
              <div className="h-48 bg-secondary-50 relative overflow-hidden flex items-center justify-center">
                {mold.photoUrl ? (
                  <img 
                    src={resolvePhotoUrl(mold.photoUrl) || ''} 
                    alt={mold.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-secondary-300">
                    <CameraOff size={32} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Pas d'image</span>
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-secondary-900/80 backdrop-blur-sm text-white px-2 py-1 rounded text-[10px] font-mono tracking-tighter border border-secondary-700">
                  REF: {mold.reference}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-secondary-900 truncate mb-1">{mold.name}</h3>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest">Moule Permanent</span>
                  <button className="text-primary-600 text-xs font-bold hover:text-primary-700 transition-colors uppercase tracking-tight underline-offset-4 hover:underline">
                    Commander
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
