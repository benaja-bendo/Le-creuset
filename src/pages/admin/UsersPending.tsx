import { useEffect, useState } from 'react';
import { getJSON, patchJSON, resolveUrl } from '../../api/client';
import { Link } from 'react-router-dom';
import { CheckCircle2, XCircle, FileSignature, Users, UserPlus, UserCheck, Mail, Phone, Clock, Search, Shield, AlertTriangle, Loader2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../components/ui/tooltip';
import { useAuth } from '../../context/AuthContext';

type User = {
  id: string;
  email: string;
  name?: string;
  companyName?: string;
  phone?: string;
  address?: string;
  kbisFileUrl?: string;
  customsFileUrl?: string;
  status: 'PENDING' | 'ACTIVE' | 'REJECTED';
  role: 'CLIENT' | 'ADMIN';
  createdAt: string;
};

// Tab component
const Tab = ({ active, onClick, children, count }: { active: boolean; onClick: () => void; children: React.ReactNode; count?: number }) => (
  <button
    onClick={onClick}
    className={`px-5 py-3 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${
      active 
        ? 'text-primary-600 border-primary-600' 
        : 'text-secondary-500 border-transparent hover:text-secondary-700 hover:border-secondary-300'
    }`}
  >
    {children}
    {count !== undefined && (
      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
        active ? 'bg-primary-100 text-primary-700' : 'bg-secondary-100 text-secondary-600'
      }`}>
        {count}
      </span>
    )}
  </button>
);

export default function UsersManagement() {
  const [activeTab, setActiveTab] = useState<'active' | 'pending'>('active');
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Role change state
  const { user: currentUser } = useAuth();
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [targetUser, setTargetUser] = useState<User | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [all, pending] = await Promise.all([
          getJSON<User[]>('/users/all'),
          getJSON<User[]>('/users/pending'),
        ]);
        setAllUsers(all.filter(u => u.status === 'ACTIVE'));
        setPendingUsers(pending);
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
        ? window.confirm('Confirmer la validation de ce compte ?\nCela initialisera également les comptes poids.')
        : window.confirm('Confirmer le rejet et suppression de ce compte ?');
      if (!ok) return;
      
      await patchJSON(`/users/${id}/status`, { status });
      
      if (status === 'ACTIVE') {
        const user = pendingUsers.find(u => u.id === id);
        if (user) {
          setAllUsers(prev => [...prev, { ...user, status: 'ACTIVE' }]);
        }
      }
      setPendingUsers(prev => prev.filter(u => u.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur lors de la mise à jour');
    }
  };

  const filteredActiveUsers = allUsers.filter(u => 
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-8 bg-white rounded-xl border border-secondary-200 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-secondary-100 rounded w-1/3"></div>
          <div className="h-12 bg-secondary-100 rounded w-full"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 bg-secondary-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Gestion des Utilisateurs</h1>
        <p className="text-secondary-500">Gérez les comptes clients et les demandes d'inscription.</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2">
          <XCircle size={18} />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700">×</button>
        </div>
      )}

      {/* Tabs Card */}
      <div className="bg-white rounded-xl border border-secondary-200 shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-secondary-200 bg-secondary-50 px-6 flex gap-2">
          <Tab 
            active={activeTab === 'active'} 
            onClick={() => setActiveTab('active')}
            count={allUsers.length}
          >
            <UserCheck size={16} /> Utilisateurs actifs
          </Tab>
          <Tab 
            active={activeTab === 'pending'} 
            onClick={() => setActiveTab('pending')}
            count={pendingUsers.length}
          >
            <UserPlus size={16} /> En attente
          </Tab>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* PENDING TAB */}
          {activeTab === 'pending' && (
            <>
              {pendingUsers.length === 0 ? (
                <div className="py-12 text-center text-secondary-400">
                  <CheckCircle2 size={48} className="mx-auto mb-4 opacity-30" />
                  <p className="font-medium text-secondary-600">Aucune demande en attente</p>
                  <p className="text-sm mt-1">Toutes les inscriptions ont été traitées.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {pendingUsers.map((u) => (
                    <div key={u.id} className="bg-white rounded-xl border border-secondary-200 shadow-sm flex flex-col overflow-hidden">
                      <div className="p-5 space-y-4 flex-grow">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                              {(u.email || 'U').slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-lg font-semibold text-secondary-900">{u.companyName || 'Entreprise'}</p>
                              <p className="text-xs text-secondary-500 flex items-center gap-1">
                                <Clock size={12} />
                                {new Date(u.createdAt).toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs px-2.5 py-1 rounded-full bg-orange-100 text-orange-700 font-medium uppercase tracking-wide">
                            En attente
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-secondary-600">
                            <Mail size={14} className="text-secondary-400" />
                            <span className="truncate">{u.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-secondary-600">
                            <Phone size={14} className="text-secondary-400" />
                            <span>{u.phone || '-'}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 pt-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <a 
                                className="px-3 py-1.5 bg-primary-50 text-sm text-primary-700 rounded-lg hover:bg-primary-100 flex items-center gap-1.5 transition-colors" 
                                href={resolveUrl(u.kbisFileUrl)} 
                                target="_blank" 
                                rel="noreferrer"
                              >
                                <FileSignature size={14} /> KBIS
                              </a>
                            </TooltipTrigger>
                            <TooltipContent>Consulter l'extrait KBIS</TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <a 
                                className="px-3 py-1.5 bg-primary-50 text-sm text-primary-700 rounded-lg hover:bg-primary-100 flex items-center gap-1.5 transition-colors" 
                                href={resolveUrl(u.customsFileUrl)} 
                                target="_blank" 
                                rel="noreferrer"
                              >
                                <FileSignature size={14} /> Douanes
                              </a>
                            </TooltipTrigger>
                            <TooltipContent>Consulter l'attestation douane</TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                      
                      <div className="p-4 border-t border-secondary-100 flex justify-end gap-3 bg-secondary-50/50">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => updateStatus(u.id, 'REJECTED')}
                              className="px-4 py-2 text-red-600 font-medium hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
                            >
                              <XCircle size={16} /> Rejeter
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>Refuser et supprimer la demande</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => updateStatus(u.id, 'ACTIVE')}
                              className="px-5 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 shadow-sm transition-colors flex items-center gap-2"
                            >
                              <CheckCircle2 size={16} /> Valider
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>Accepter l'accès professionnel</TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ACTIVE USERS TAB */}
          {activeTab === 'active' && (
            <>
              {/* Search */}
              <div className="mb-6">
                <div className="relative">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-400" />
                  <input
                    type="text"
                    placeholder="Rechercher par nom, email ou entreprise..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-secondary-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-secondary-900"
                  />
                </div>
              </div>

              {filteredActiveUsers.length === 0 ? (
                <div className="py-12 text-center text-secondary-400">
                  <Users size={48} className="mx-auto mb-4 opacity-30" />
                  <p className="font-medium text-secondary-600">
                    {searchQuery ? 'Aucun utilisateur trouvé' : 'Aucun utilisateur actif'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-secondary-50 text-secondary-600 font-medium">
                      <tr>
                        <th className="px-4 py-3 rounded-l-lg">Utilisateur</th>
                        <th className="px-4 py-3">Contact</th>
                        <th className="px-4 py-3">Rôle</th>
                        <th className="px-4 py-3">Inscription</th>
                        <th className="px-4 py-3 rounded-r-lg">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-secondary-100">
                      {filteredActiveUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-secondary-50/50 transition-colors">
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-secondary-100 text-secondary-600 flex items-center justify-center font-bold text-sm">
                                {(user.email || 'U').slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-medium text-secondary-900">{user.companyName || user.name || '-'}</p>
                                <p className="text-xs text-secondary-500">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-secondary-600">{user.phone || '-'}</td>
                          <td className="px-4 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                              user.role === 'ADMIN' 
                                ? 'bg-amber-100 text-amber-700' 
                                : 'bg-blue-100 text-blue-700'
                            }`}>
                              {user.role === 'ADMIN' ? 'Admin' : 'Client'}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-secondary-500">
                            {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <Link 
                                to={`/client/admin/users/${user.id}`}
                                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                              >
                                Voir profil
                              </Link>
                              
                              {currentUser?.id !== user.id && (
                                <button
                                  onClick={() => {
                                    setTargetUser(user);
                                    setShowRoleModal(true);
                                  }}
                                  className="text-secondary-400 hover:text-amber-600 transition-colors"
                                  title="Changer le rôle"
                                >
                                  <Shield size={16} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Role Change Modal */}
      {showRoleModal && targetUser && (
        <ChangeRoleModal
          targetUser={targetUser}
          onClose={() => {
            setShowRoleModal(false);
            setTargetUser(null);
          }}
          onSuccess={(newRole) => {
            setAllUsers(prev => prev.map(u => u.id === targetUser.id ? { ...u, role: newRole } : u));
            setShowRoleModal(false);
            setTargetUser(null);
          }}
        />
      )}
    </div>
  );
}

// ============================================
// Change Role Modal Component
// ============================================
function ChangeRoleModal({ 
  targetUser, 
  onClose, 
  onSuccess 
}: { 
  targetUser: User; 
  onClose: () => void; 
  onSuccess: (newRole: 'ADMIN' | 'CLIENT') => void;
}) {
  const [adminPassword, setAdminPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const newRole = targetUser.role === 'ADMIN' ? 'CLIENT' : 'ADMIN';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPassword) return;

    setLoading(true);
    setError(null);

    try {
      await patchJSON(`/users/${targetUser.id}/role`, {
        role: newRole,
        adminPassword: adminPassword,
      });
      onSuccess(newRole);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du changement de rôle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-secondary-100 flex items-center justify-between bg-secondary-50/50">
          <h3 className="text-xl font-bold text-secondary-900 flex items-center gap-2">
            <Shield className="text-amber-500" size={24} />
            Changer le rôle
          </h3>
          <button onClick={onClose} className="text-secondary-400 hover:text-secondary-600 transition-colors">
            <XCircle size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
            <div className="flex gap-3">
              <AlertTriangle className="text-amber-600 shrink-0" size={20} />
              <div className="text-sm">
                <p className="font-bold text-amber-900">Action sensible</p>
                <p className="text-amber-800 mt-1">
                  Vous allez passer <strong>{targetUser.companyName || targetUser.email}</strong> au rang de <strong>{newRole === 'ADMIN' ? 'Administrateur' : 'Client'}</strong>.
                </p>
              </div>
            </div>
          </div>

          {!error && (
            <p className="text-sm text-secondary-600">
              Pour confirmer cette modification, veuillez saisir <strong>votre mot de passe administrateur</strong> actuel.
            </p>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-700 text-xs rounded-lg flex items-center gap-2">
              <AlertTriangle size={14} />
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-secondary-700 mb-2 uppercase tracking-wide">
              Votre mot de passe
            </label>
            <input
              type="password"
              value={adminPassword}
              onChange={e => setAdminPassword(e.target.value)}
              className="w-full px-4 py-3 border border-secondary-200 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all text-secondary-900"
              placeholder="••••••••"
              required
              autoFocus
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-secondary-200 text-secondary-700 rounded-xl font-bold hover:bg-secondary-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || !adminPassword}
              className="flex-1 px-4 py-3 bg-secondary-900 text-white rounded-xl font-bold hover:bg-secondary-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
              Confirmer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
