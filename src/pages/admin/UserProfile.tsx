import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getJSON, resolveUrl } from '../../api/client';
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  FileText,
  Mail,
  Phone,
  Building2,
  Calendar,
  Download,
  Eye,
  Scale,
  Upload,
  Pencil,
  X
} from 'lucide-react';
import WeightGauges from '../../components/WeightGauges';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../components/ui/tooltip';
import { uploadFile, patchJSON } from '../../api/client';
import { formatAmount } from '../../lib/format';

type ProfileUser = {
  id: string;
  email: string;
  companyName: string | null;
  name?: string | null;
  phone?: string | null;
  address?: string | null;
  kbisFileUrl?: string | null;
  customsFileUrl?: string | null;
  createdAt: string;
};

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

type InvoiceSummary = {
  id: string;
  invoiceNumber: string;
  issueDate: string;
  amount: number | null;
  fileUrl: string | null;
};

export default function AdminUserProfile() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<{
    user: ProfileUser;
    accounts: MetalAccount[];
    invoices: InvoiceSummary[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadingKbis, setUploadingKbis] = useState(false);
  const [uploadingCustoms, setUploadingCustoms] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', companyName: '', phone: '', address: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const [user, accounts, invoices] = await Promise.all([
        getJSON<ProfileUser>(`/users/${id}`),
        getJSON<MetalAccount[]>(`/weights/user/${id}`),
        getJSON<InvoiceSummary[]>(`/invoices/user/${id}`),
      ]);
      setData({ user, accounts, invoices });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleFileUpload = async (file: File, type: 'kbis' | 'customs') => {
    if (!id) return;
    try {
      if (type === 'kbis') setUploadingKbis(true);
      else setUploadingCustoms(true);

      const res = await uploadFile(file);
      await patchJSON(`/users/${id}/documents`, {
        [type === 'kbis' ? 'kbisFileUrl' : 'customsFileUrl']: res.url
      });
      
      // Reload to update UI
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur lors de l'upload");
    } finally {
      if (type === 'kbis') setUploadingKbis(false);
      else setUploadingCustoms(false);
    }
  };



  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-24">
        <Loader2 className="animate-spin text-primary-500 mb-4" size={48} />
        <p className="text-secondary-500 font-medium animate-pulse">Chargement du profil client...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 bg-red-50 border-2 border-red-100 text-red-700 rounded-2xl flex items-center gap-4">
        <AlertCircle size={24} />
        <div>
          <p className="font-bold">Erreur de chargement</p>
          <p className="text-sm">{error || 'Utilisateur introuvable'}</p>
        </div>
      </div>
    );
  }

  const { user, accounts, invoices } = data;

  const openEditModal = () => {
    setEditForm({
      name: user.name || '',
      companyName: user.companyName || '',
      phone: user.phone || '',
      address: user.address || '',
    });
    setEditError(null);
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setIsSaving(true);
    setEditError(null);
    try {
      await patchJSON(`/users/${id}/profile`, editForm);
      setShowEditModal(false);
      await load();
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Erreur lors de la modification');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Back link & Header */}
      <div className="space-y-4">
        <Link to="/client/admin/users" className="inline-flex items-center gap-2 text-secondary-500 hover:text-secondary-700 text-sm font-medium transition-colors">
          <ArrowLeft size={16} />
          Retour à la liste des utilisateurs
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg flex items-center justify-center text-white text-2xl font-black">
              {(user.email || 'U').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-secondary-900 font-serif tracking-tight">
                {user.companyName || user.email}
              </h1>
              <div className="flex flex-wrap gap-4 mt-1 text-secondary-500 text-sm">
                <span className="flex items-center gap-1.5"><Mail size={14} /> {user.email}</span>
                {user.phone && <span className="flex items-center gap-1.5"><Phone size={14} /> {user.phone}</span>}
                <span className="flex items-center gap-1.5"><Calendar size={14} /> Inscrit le {new Date(user.createdAt).toLocaleDateString('fr-FR')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left column: Weight Accounts */}
        <div className="xl:col-span-2 space-y-8">
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-secondary-900 flex items-center gap-2">
                <Scale size={20} className="text-primary-500" />
                Compte Poids
              </h2>
            </div>
            {accounts.length === 0 ? (
              <div className="p-12 bg-white rounded-2xl border-2 border-dashed border-secondary-100 text-center">
                <Scale size={48} className="mx-auto text-secondary-200 mb-3 opacity-20" />
                <p className="text-secondary-400 font-medium">Aucun compte poids initialisé</p>
              </div>
            ) : (
              <WeightGauges accounts={accounts} />
            )}
          </section>
        </div>

        {/* Right column: Invoices & Details */}
        <div className="space-y-8">
          {/* Company Details */}
          <section className="bg-white rounded-2xl border border-secondary-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-secondary-900 flex items-center gap-2">
                <Building2 size={18} className="text-primary-500" />
                Détails Entreprise
              </h3>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={openEditModal}
                    className="p-2 text-secondary-400 hover:bg-amber-50 hover:text-amber-600 rounded-lg transition-all"
                  >
                    <Pencil size={16} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Modifier les informations</TooltipContent>
              </Tooltip>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-secondary-50">
                <span className="text-secondary-500">Nom commercial</span>
                <span className="font-semibold text-secondary-900">{user.companyName || '-'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-secondary-50">
                <span className="text-secondary-500">Contact principal</span>
                <span className="text-secondary-800">{user.name || '-'}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-secondary-500">Adresse</span>
                <span className="text-secondary-800 text-right max-w-[200px]">{user.address || '-'}</span>
              </div>
            </div>
          </section>

          {/* Documents */}
          <section className="bg-white rounded-2xl border border-secondary-200 shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-secondary-900 flex items-center gap-2">
              <FileText size={18} className="text-primary-500" />
              Documents Légaux
            </h3>
            <div className="space-y-3">
              {/* KBIS */}
              <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${user.kbisFileUrl ? 'bg-green-100 text-green-600' : 'bg-secondary-200 text-secondary-400'}`}>
                    <FileText size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-secondary-900">Extrait KBIS</p>
                    <p className="text-[10px] text-secondary-500">{user.kbisFileUrl ? 'Document fourni' : 'Non fourni'}</p>
                  </div>
                </div>
                <div className="flex gap-1 items-center">
                  <label className="p-2 text-secondary-500 hover:bg-secondary-100 rounded-lg transition-colors cursor-pointer" title="Modifier le document">
                    {uploadingKbis ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                    <input type="file" className="hidden" accept="application/pdf" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'kbis')} />
                  </label>
                  {user.kbisFileUrl && (
                    <>
                      <a
                        href={resolveUrl(user.kbisFileUrl)}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors text-xs font-bold flex items-center gap-1"
                      >
                        <Eye size={14} /> Voir
                      </a>
                      <a
                        href={resolveUrl(user.kbisFileUrl)}
                        target="_blank"
                        rel="noreferrer"
                        download
                        className="p-2 text-secondary-500 hover:bg-secondary-100 rounded-lg transition-colors"
                      >
                        <Download size={14} />
                      </a>
                    </>
                  )}
                </div>
              </div>
              {/* Douanes */}
              <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${user.customsFileUrl ? 'bg-green-100 text-green-600' : 'bg-secondary-200 text-secondary-400'}`}>
                    <FileText size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-secondary-900">Fiche Douanes</p>
                    <p className="text-[10px] text-secondary-500">{user.customsFileUrl ? 'Document fourni' : 'Non fourni'}</p>
                  </div>
                </div>
                <div className="flex gap-1 items-center">
                  <label className="p-2 text-secondary-500 hover:bg-secondary-100 rounded-lg transition-colors cursor-pointer" title="Modifier le document">
                    {uploadingCustoms ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                    <input type="file" className="hidden" accept="application/pdf" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'customs')} />
                  </label>
                  {user.customsFileUrl && (
                    <>
                      <a
                        href={resolveUrl(user.customsFileUrl)}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors text-xs font-bold flex items-center gap-1"
                      >
                        <Eye size={14} /> Voir
                      </a>
                      <a
                        href={resolveUrl(user.customsFileUrl)}
                        target="_blank"
                        rel="noreferrer"
                        download
                        className="p-2 text-secondary-500 hover:bg-secondary-100 rounded-lg transition-colors"
                      >
                        <Download size={14} />
                      </a>
                    </>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* User Invoices History */}
          <section className="bg-white rounded-2xl border border-secondary-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
            <div className="p-5 border-b border-secondary-200 bg-secondary-50/50 flex items-center justify-between">
              <h3 className="font-bold text-secondary-900 flex items-center gap-2">
                <FileText size={18} className="text-primary-500" />
                Dernières Factures
              </h3>
              <span className="text-[10px] font-black bg-secondary-200 text-secondary-600 px-2 py-0.5 rounded-full uppercase">
                {invoices.length} Total
              </span>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-secondary-100">
              {invoices.length === 0 ? (
                <div className="p-12 text-center text-secondary-400">
                  <FileText size={32} className="mx-auto opacity-20 mb-2" />
                  <p className="text-sm italic">Aucune facture enregistrée</p>
                </div>
              ) : (
                invoices.map((inv) => (
                  <div key={inv.id} className="p-4 hover:bg-secondary-50/50 transition-colors flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                        <FileText size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-secondary-900">{inv.invoiceNumber}</p>
                        <p className="text-[11px] text-secondary-400 font-medium">
                          {new Date(inv.issueDate).toLocaleDateString('fr-FR')}
                          {inv.amount && <span className="ml-2 font-bold text-secondary-600">• {formatAmount(inv.amount)} €</span>}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <a
                            href={resolveUrl(inv.fileUrl)}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 text-secondary-400 hover:text-primary-600 hover:bg-white rounded-lg transition-all"
                          >
                            <Eye size={16} />
                          </a>
                        </TooltipTrigger>
                        <TooltipContent>Aperçu</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <a
                            href={resolveUrl(inv.fileUrl)}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 text-secondary-400 hover:text-secondary-900 hover:bg-white rounded-lg transition-all"
                          >
                            <Download size={16} />
                          </a>
                        </TooltipTrigger>
                        <TooltipContent>Télécharger</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Edit User Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-secondary-950/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowEditModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-secondary-100 flex items-center justify-between">
              <h3 className="font-bold text-lg text-secondary-900 flex items-center gap-2">
                <Pencil size={20} className="text-amber-600" />
                Modifier les informations
              </h3>
              <button onClick={() => setShowEditModal(false)} className="text-secondary-400 hover:text-secondary-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 bg-secondary-50/50">
              {editError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center gap-2">
                  <AlertCircle size={16} />
                  {editError}
                </div>
              )}

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-start gap-2">
                <Mail size={14} className="mt-0.5 shrink-0" />
                <span>Le client sera notifié par email de cette modification.</span>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Nom commercial</label>
                <input
                  type="text"
                  value={editForm.companyName}
                  onChange={e => setEditForm({ ...editForm, companyName: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-secondary-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-secondary-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Contact principal</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-secondary-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-secondary-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Téléphone</label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-secondary-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-secondary-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Adresse</label>
                <textarea
                  rows={2}
                  value={editForm.address}
                  onChange={e => setEditForm({ ...editForm, address: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-secondary-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-secondary-900 resize-none"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-5 py-2.5 text-secondary-600 font-medium hover:bg-secondary-100 rounded-xl transition-colors">
                  Annuler
                </button>
                <button type="submit" disabled={isSaving} className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md disabled:opacity-50 flex items-center gap-2">
                  {isSaving && <Loader2 size={16} className="animate-spin" />}
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
