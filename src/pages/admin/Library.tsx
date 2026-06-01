import { useState, useEffect, useCallback } from 'react';
import { getJSON, postJSON, deleteJSON, uploadFile, resolveUrl, API_URL } from '../../api/client';
import { Layers, Box, Loader2, AlertCircle, Plus, Trash2, Upload, Search, FileText, CameraOff } from 'lucide-react';

type User = { id: string; email: string; companyName: string | null };

type LibraryFile = {
  id: string;
  name: string;
  reference?: string;
  fileUrl: string;
  notes?: string;
  createdAt: string;
};

type Mold = {
  id: string;
  userId: string;
  reference: string;
  name: string;
  photoUrl?: string;
  notes?: string;
};

export default function AdminLibrary() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [search, setSearch] = useState('');
  const [stlFiles, setStlFiles] = useState<LibraryFile[]>([]);
  const [molds, setMolds] = useState<Mold[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // STL upload form
  const [stlForm, setStlForm] = useState({ name: '', reference: '', notes: '' });
  const [stlFile, setStlFile] = useState<File | null>(null);
  const [savingStl, setSavingStl] = useState(false);

  // Mold form
  const [moldForm, setMoldForm] = useState({ name: '', reference: '', notes: '' });
  const [moldPhoto, setMoldPhoto] = useState<File | null>(null);
  const [savingMold, setSavingMold] = useState(false);

  useEffect(() => {
    getJSON<User[]>('/users/all')
      .then(setUsers)
      .catch(e => setError(e instanceof Error ? e.message : 'Erreur de chargement'))
      .finally(() => setLoading(false));
  }, []);

  const loadClientData = useCallback(async (userId: string) => {
    if (!userId) return;
    try {
      const [stl, allMolds] = await Promise.all([
        getJSON<LibraryFile[]>(`/library/user/${userId}`),
        getJSON<Mold[]>('/molds/all'),
      ]);
      setStlFiles(stl);
      setMolds(allMolds.filter(m => m.userId === userId));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur de chargement');
    }
  }, []);

  useEffect(() => {
    if (selectedUserId) loadClientData(selectedUserId);
    else { setStlFiles([]); setMolds([]); }
  }, [selectedUserId, loadClientData]);

  const resolvePhotoUrl = (path?: string) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${API_URL}/storage/file/${path.split('/').pop()}`;
  };

  const handleAddStl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !stlFile || !stlForm.name) return;
    setSavingStl(true);
    try {
      const up = await uploadFile(stlFile);
      await postJSON('/library', {
        userId: selectedUserId,
        name: stlForm.name,
        reference: stlForm.reference || undefined,
        notes: stlForm.notes || undefined,
        fileUrl: up.url,
      });
      setStlForm({ name: '', reference: '', notes: '' });
      setStlFile(null);
      await loadClientData(selectedUserId);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur lors du dépôt');
    } finally {
      setSavingStl(false);
    }
  };

  const handleDeleteStl = async (id: string) => {
    if (!window.confirm('Supprimer ce fichier STL ?')) return;
    try {
      await deleteJSON(`/library/${id}`);
      setStlFiles(prev => prev.filter(f => f.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const handleAddMold = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !moldForm.name || !moldForm.reference) return;
    setSavingMold(true);
    try {
      let photoUrl: string | undefined;
      if (moldPhoto) {
        const up = await uploadFile(moldPhoto);
        photoUrl = up.url;
      }
      await postJSON('/molds', {
        userId: selectedUserId,
        name: moldForm.name,
        reference: moldForm.reference,
        notes: moldForm.notes || undefined,
        photoUrl,
      });
      setMoldForm({ name: '', reference: '', notes: '' });
      setMoldPhoto(null);
      await loadClientData(selectedUserId);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur lors de la création');
    } finally {
      setSavingMold(false);
    }
  };

  const handleDeleteMold = async (id: string) => {
    if (!window.confirm('Supprimer ce moule ?')) return;
    try {
      await deleteJSON(`/molds/${id}`);
      setMolds(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const filteredUsers = users.filter(u =>
    (u.companyName || u.email).toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-primary-500" size={40} /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900 font-serif">Bibliothèque Clients</h1>
        <p className="text-secondary-500">Déposez les fichiers STL et les moules de chaque client.</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} /><p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Client selector */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-secondary-200 shadow-sm p-4 h-fit">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" size={16} />
            <input
              type="text"
              placeholder="Client..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-secondary-50 border border-secondary-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="space-y-1 max-h-[420px] overflow-y-auto">
            {filteredUsers.map(u => (
              <button
                key={u.id}
                onClick={() => setSelectedUserId(u.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  selectedUserId === u.id ? 'bg-primary-600 text-white' : 'hover:bg-secondary-50 text-secondary-700'
                }`}
              >
                <p className="font-medium truncate">{u.companyName || u.email}</p>
                <p className={`text-xs truncate ${selectedUserId === u.id ? 'text-primary-100' : 'text-secondary-400'}`}>{u.email}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Management */}
        <div className="lg:col-span-3 space-y-6">
          {!selectedUserId ? (
            <div className="p-16 bg-white rounded-xl border border-secondary-200 text-center text-secondary-400">
              <Layers size={48} className="mx-auto mb-4 opacity-30" />
              <p>Sélectionnez un client pour gérer sa bibliothèque.</p>
            </div>
          ) : (
            <>
              {/* STL section */}
              <section className="bg-white rounded-xl border border-secondary-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-secondary-100 bg-secondary-50/50 flex items-center gap-2">
                  <Box size={18} className="text-primary-600" />
                  <h2 className="font-bold text-secondary-900">Fichiers STL</h2>
                </div>
                <form onSubmit={handleAddStl} className="p-5 grid grid-cols-1 md:grid-cols-4 gap-3 border-b border-secondary-100 bg-secondary-50/30">
                  <input value={stlForm.name} onChange={e => setStlForm({ ...stlForm, name: e.target.value })} placeholder="Nom *" required className="px-3 py-2 border border-secondary-200 rounded-lg text-sm text-secondary-900" />
                  <input value={stlForm.reference} onChange={e => setStlForm({ ...stlForm, reference: e.target.value })} placeholder="Référence" className="px-3 py-2 border border-secondary-200 rounded-lg text-sm text-secondary-900" />
                  <input value={stlForm.notes} onChange={e => setStlForm({ ...stlForm, notes: e.target.value })} placeholder="Notes" className="px-3 py-2 border border-secondary-200 rounded-lg text-sm text-secondary-900" />
                  <div className="flex gap-2">
                    <label className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border border-dashed border-secondary-300 rounded-lg text-xs text-secondary-500 cursor-pointer hover:border-primary-400 truncate">
                      <Upload size={14} /> {stlFile ? stlFile.name.slice(0, 12) : 'STL/OBJ'}
                      <input type="file" accept=".stl,.obj" className="hidden" onChange={e => setStlFile(e.target.files?.[0] || null)} />
                    </label>
                    <button type="submit" disabled={savingStl || !stlFile} className="px-3 py-2 bg-primary-600 text-white rounded-lg disabled:opacity-50 flex items-center">
                      {savingStl ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                    </button>
                  </div>
                </form>
                <div className="divide-y divide-secondary-100">
                  {stlFiles.length === 0 ? (
                    <p className="p-6 text-center text-sm text-secondary-400">Aucun fichier STL.</p>
                  ) : stlFiles.map(f => (
                    <div key={f.id} className="p-4 flex items-center justify-between hover:bg-secondary-50/50">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-secondary-100 text-secondary-500 flex items-center justify-center shrink-0"><Box size={18} /></div>
                        <div className="min-w-0">
                          <p className="font-medium text-secondary-900 truncate">{f.name}</p>
                          <p className="text-xs text-secondary-400 truncate">{f.reference && `REF ${f.reference} · `}{f.notes}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <a href={resolveUrl(f.fileUrl)} target="_blank" rel="noreferrer" className="p-2 text-secondary-500 hover:bg-secondary-100 rounded-lg"><FileText size={16} /></a>
                        <button onClick={() => handleDeleteStl(f.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Molds section */}
              <section className="bg-white rounded-xl border border-secondary-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-secondary-100 bg-secondary-50/50 flex items-center gap-2">
                  <Layers size={18} className="text-primary-600" />
                  <h2 className="font-bold text-secondary-900">Moules</h2>
                </div>
                <form onSubmit={handleAddMold} className="p-5 grid grid-cols-1 md:grid-cols-4 gap-3 border-b border-secondary-100 bg-secondary-50/30">
                  <input value={moldForm.name} onChange={e => setMoldForm({ ...moldForm, name: e.target.value })} placeholder="Nom *" required className="px-3 py-2 border border-secondary-200 rounded-lg text-sm text-secondary-900" />
                  <input value={moldForm.reference} onChange={e => setMoldForm({ ...moldForm, reference: e.target.value })} placeholder="Référence *" required className="px-3 py-2 border border-secondary-200 rounded-lg text-sm text-secondary-900" />
                  <input value={moldForm.notes} onChange={e => setMoldForm({ ...moldForm, notes: e.target.value })} placeholder="Notes" className="px-3 py-2 border border-secondary-200 rounded-lg text-sm text-secondary-900" />
                  <div className="flex gap-2">
                    <label className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border border-dashed border-secondary-300 rounded-lg text-xs text-secondary-500 cursor-pointer hover:border-primary-400 truncate">
                      <Upload size={14} /> {moldPhoto ? moldPhoto.name.slice(0, 12) : 'Image'}
                      <input type="file" accept="image/*" className="hidden" onChange={e => setMoldPhoto(e.target.files?.[0] || null)} />
                    </label>
                    <button type="submit" disabled={savingMold} className="px-3 py-2 bg-primary-600 text-white rounded-lg disabled:opacity-50 flex items-center">
                      {savingMold ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                    </button>
                  </div>
                </form>
                <div className="p-5 grid grid-cols-2 md:grid-cols-3 gap-4">
                  {molds.length === 0 ? (
                    <p className="col-span-full p-2 text-center text-sm text-secondary-400">Aucun moule.</p>
                  ) : molds.map(m => (
                    <div key={m.id} className="border border-secondary-200 rounded-xl overflow-hidden">
                      <div className="h-28 bg-secondary-50 flex items-center justify-center">
                        {m.photoUrl ? (
                          <img src={resolvePhotoUrl(m.photoUrl) || ''} alt={m.name} className="w-full h-full object-cover" />
                        ) : (
                          <CameraOff size={24} className="text-secondary-300" />
                        )}
                      </div>
                      <div className="p-3">
                        <p className="font-medium text-sm text-secondary-900 truncate">{m.name}</p>
                        <p className="text-[10px] font-mono text-secondary-400">REF {m.reference}</p>
                        {m.notes && <p className="text-xs text-secondary-500 italic mt-1 line-clamp-2">{m.notes}</p>}
                        <button onClick={() => handleDeleteMold(m.id)} className="mt-2 text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
                          <Trash2 size={12} /> Supprimer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
