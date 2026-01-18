import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getJSON, BASE_URL } from '../../api/client';
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
  Scale 
} from 'lucide-react';
import WeightGauges from '../../components/WeightGauges';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../components/ui/tooltip';

export default function AdminUserProfile() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<{
    user: any;
    accounts: any[];
    invoices: any[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!id) return;
      try {
        const [user, accounts, invoices] = await Promise.all([
          getJSON<any>(`/users/${id}`),
          getJSON<any[]>(`/weights/user/${id}`),
          getJSON<any[]>(`/invoices/user/${id}`),
        ]);
        setData({ user, accounts, invoices });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur de chargement');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const resolveUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${BASE_URL}${url}`;
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
            <h3 className="font-bold text-secondary-900 flex items-center gap-2">
              <Building2 size={18} className="text-primary-500" />
              Détails Entreprise
            </h3>
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
                          {inv.amount && <span className="ml-2 font-bold text-secondary-600">• {inv.amount.toLocaleString()} €</span>}
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
    </div>
  );
}
