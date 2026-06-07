import { useState, useEffect } from 'react';
import { getJSON, API_URL, resolveUrl } from '../../api/client';
import { Layers, Search, AlertCircle, Loader2, CameraOff, Box, Download, Eye, FileText, X, ZoomIn } from 'lucide-react';
import STLViewer from '../../components/STLViewer';
import ImageViewerModal from '../../components/ImageViewerModal';

type Mold = {
  id: string;
  reference: string;
  name: string;
  photoUrl?: string;
  notes?: string;
};

type LibraryFile = {
  id: string;
  name: string;
  reference?: string;
  fileUrl: string;
  notes?: string;
  createdAt: string;
};

export default function Library() {
  const [tab, setTab] = useState<'stl' | 'molds'>('stl');
  const [molds, setMolds] = useState<Mold[]>([]);
  const [stlFiles, setStlFiles] = useState<LibraryFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [preview, setPreview] = useState<LibraryFile | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [moldsData, stlData] = await Promise.all([
          getJSON<Mold[]>('/molds/me'),
          getJSON<LibraryFile[]>('/library/me'),
        ]);
        setMolds(moldsData);
        setStlFiles(stlData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur de chargement');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredMolds = molds.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.reference.toLowerCase().includes(search.toLowerCase())
  );

  const filteredStl = stlFiles.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    (f.reference || '').toLowerCase().includes(search.toLowerCase())
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
          <h1 className="text-2xl font-bold text-secondary-900 font-serif">Ma Bibliothèque</h1>
          <p className="text-secondary-500">Vos fichiers STL et vos moules archivés à la fonderie.</p>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" size={18} />
          <input
            type="text"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-secondary-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-secondary-200 flex gap-2">
        <button
          onClick={() => setTab('stl')}
          className={`px-5 py-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${
            tab === 'stl' ? 'text-primary-600 border-primary-600' : 'text-secondary-500 border-transparent hover:text-secondary-700'
          }`}
        >
          <Box size={16} /> Fichiers STL
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${tab === 'stl' ? 'bg-primary-100 text-primary-700' : 'bg-secondary-100 text-secondary-600'}`}>{stlFiles.length}</span>
        </button>
        <button
          onClick={() => setTab('molds')}
          className={`px-5 py-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${
            tab === 'molds' ? 'text-primary-600 border-primary-600' : 'text-secondary-500 border-transparent hover:text-secondary-700'
          }`}
        >
          <Layers size={16} /> Moules
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${tab === 'molds' ? 'bg-primary-100 text-primary-700' : 'bg-secondary-100 text-secondary-600'}`}>{molds.length}</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}

      {/* STL TAB */}
      {tab === 'stl' && (
        filteredStl.length === 0 ? (
          <div className="p-16 bg-white rounded-xl border border-secondary-200 text-center shadow-sm">
            <Box className="mx-auto text-secondary-100 mb-6" size={64} />
            <h3 className="text-xl font-medium text-secondary-900 mb-2">
              {search ? 'Aucun résultat' : 'Aucun fichier STL'}
            </h3>
            <p className="text-secondary-500 max-w-sm mx-auto">
              Vos fichiers STL déposés par La Grenaille apparaîtront ici.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredStl.map((f) => (
              <div key={f.id} className="group bg-white rounded-xl border border-secondary-200 shadow-sm overflow-hidden hover:shadow-lg transition-all">
                <div className="h-32 bg-secondary-50 flex items-center justify-center text-secondary-300">
                  <Box size={40} />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-secondary-900 truncate mb-1">{f.name}</h3>
                  {f.reference && <p className="text-[10px] font-mono text-secondary-400 mb-2">REF: {f.reference}</p>}
                  {f.notes && <p className="text-xs text-secondary-500 italic line-clamp-2 mb-3">{f.notes}</p>}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => setPreview(f)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
                    >
                      <Eye size={14} /> Aperçu
                    </button>
                    <a
                      href={resolveUrl(f.fileUrl)}
                      target="_blank"
                      rel="noreferrer"
                      download
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-secondary-600 bg-secondary-50 hover:bg-secondary-100 rounded-lg transition-colors"
                    >
                      <Download size={14} /> Télécharger
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* MOLDS TAB */}
      {tab === 'molds' && (
        filteredMolds.length === 0 ? (
          <div className="p-16 bg-white rounded-xl border border-secondary-200 text-center shadow-sm">
            <Layers className="mx-auto text-secondary-100 mb-6" size={64} />
            <h3 className="text-xl font-medium text-secondary-900 mb-2">
              {search ? 'Aucun résultat' : 'Aucun moule'}
            </h3>
            <p className="text-secondary-500 max-w-sm mx-auto">
              Vos empreintes apparaîtront ici une fois les premiers tirages archivés.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMolds.map((mold) => (
              <div key={mold.id} className="group bg-white rounded-xl border border-secondary-200 shadow-sm overflow-hidden hover:shadow-xl transition-all">
                <div 
                  className="h-48 bg-secondary-50 relative overflow-hidden flex items-center justify-center cursor-pointer"
                  onClick={() => mold.photoUrl && setPreviewImage(resolvePhotoUrl(mold.photoUrl))}
                >
                  {mold.photoUrl ? (
                    <>
                      <img
                        src={resolvePhotoUrl(mold.photoUrl) || ''}
                        alt={mold.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <ZoomIn className="text-white" size={24} />
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-secondary-300">
                      <CameraOff size={32} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Pas d'image</span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-secondary-900/80 backdrop-blur-sm text-white px-2 py-1 rounded text-[10px] font-mono tracking-tighter border border-secondary-700 z-20">
                    REF: {mold.reference}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-secondary-900 truncate mb-1">{mold.name}</h3>
                  {mold.notes ? (
                    <p className="text-xs text-secondary-500 italic mt-2 flex items-start gap-1.5">
                      <FileText size={12} className="mt-0.5 shrink-0" /> {mold.notes}
                    </p>
                  ) : (
                    <span className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest">Moule Permanent</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* STL Preview Modal */}
      {preview && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setPreview(null)}>
          <div className="bg-white rounded-xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-secondary-200">
              <h3 className="font-semibold text-secondary-900 truncate">{preview.name}</h3>
              <button onClick={() => setPreview(null)} className="p-2 hover:bg-secondary-100 rounded-lg"><X size={18} /></button>
            </div>
            <div className="flex-1 bg-secondary-950">
              <STLViewer
                fileUrl={resolveUrl(preview.fileUrl)}
                fileName={preview.name.toLowerCase().endsWith('.stl') ? preview.name : `${preview.name}.stl`}
                materialType="OR_JAUNE_750"
                finishType="poli"
              />
            </div>
          </div>
        </div>
      )}

      <ImageViewerModal 
        isOpen={!!previewImage} 
        onClose={() => setPreviewImage(null)} 
        imageUrl={previewImage || ''} 
      />
    </div>
  );
}
