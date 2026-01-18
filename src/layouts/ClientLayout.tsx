import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Settings, 
  LogOut, 
  Bell, 
  User, 
  Menu,
  X,
  ChevronRight,
  Package,
  Users,
  Scale,
  ShoppingCart,
  Layers,
  Building2
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { clsx } from 'clsx';
import { useAuth } from '../context/AuthContext';

/**
 * Mise en page principale de l'espace client avec menu latéral,
 * en-tête et rendu conditionnel selon le statut/role utilisateur.
 */
export default function ClientLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, isActive, logout } = useAuth();

  const isPathActive = (path: string) => location.pathname === path || 
    (path !== '/client' && location.pathname.startsWith(path));
  
  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  // Menu items selon le rôle
  const clientMenuItems = [
    { name: 'Tableau de bord', path: '/client', icon: LayoutDashboard },
    { name: 'Devis STL', path: '/client/quote', icon: FileText },
    { name: 'Mes Commandes', path: '/client/orders', icon: ShoppingCart },
    { name: 'Mes Factures', path: '/client/invoices', icon: FileText },
    { name: 'Ma Bibliothèque', path: '/client/molds', icon: Layers },
  ];

  const adminMenuItems = [
    { name: 'Vue globale', path: '/client', icon: LayoutDashboard },
    { name: 'Utilisateurs', path: '/client/admin/users', icon: Users },
    { name: 'Comptes Poids', path: '/client/admin/weights', icon: Scale },
    { name: 'Commandes', path: '/client/admin/orders', icon: Package },
    { name: 'Factures', path: '/client/admin/invoices', icon: FileText },
  ];

  const menuItems = isAdmin ? adminMenuItems : clientMenuItems;

  return (
    <div className="min-h-screen bg-secondary-50 flex font-sans">
      {/* Sidebar */}
      <aside 
        className={clsx(
          "fixed inset-y-0 left-0 z-40 w-72 bg-gradient-to-b from-secondary-900 via-secondary-900 to-secondary-950 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto shadow-2xl",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo / Branding */}
          <div className="p-6 border-b border-secondary-800/50">
            <Link to="/" className="block">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center shadow-lg shadow-primary-900/30">
                  <Building2 size={22} className="text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold tracking-wide text-white">
                    LE CREUSET
                  </h1>
                  <p className="text-[10px] tracking-widest uppercase text-primary-400 font-medium">
                    espace pro
                  </p>
                </div>
              </div>
            </Link>
            <button onClick={() => setIsSidebarOpen(false)} className="absolute top-6 right-4 lg:hidden text-secondary-400 hover:text-white">
              <X size={20} />
            </button>
          </div>

          {/* User Info Card */}
          <div className="p-4">
            <div className="flex items-center gap-3 p-4 bg-secondary-800/40 rounded-xl border border-secondary-700/30 mb-4">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                {(user?.email || 'U').slice(0,2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{user?.companyName || 'Compte Pro'}</p>
                <p className="text-xs text-secondary-400 flex items-center gap-1.5">
                  <span className={clsx(
                    "w-1.5 h-1.5 rounded-full",
                    isAdmin ? "bg-amber-400" : "bg-emerald-400"
                  )}></span>
                  {isAdmin ? 'Administrateur' : 'Client Professionnel'}
                </p>
              </div>
            </div>

            {/* Section Label */}
            <div className="px-3 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-secondary-500">
                {isAdmin ? 'Administration' : 'Navigation'}
              </span>
            </div>

            {/* Navigation */}
            <nav className="space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={clsx(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                    isPathActive(item.path) 
                      ? "bg-primary-600 text-white shadow-lg shadow-primary-900/30" 
                      : "text-secondary-400 hover:bg-secondary-800/50 hover:text-white"
                  )}
                >
                  <item.icon size={18} />
                  <span className="flex-1">{item.name}</span>
                  {isPathActive(item.path) && <ChevronRight size={14} className="opacity-70" />}
                </Link>
              ))}
            </nav>

            {/* Settings Link */}
            <div className="mt-6 pt-4 border-t border-secondary-800/50">
              <Link
                to="/client/settings"
                className={clsx(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                  isPathActive('/client/settings') 
                    ? "bg-secondary-800 text-white" 
                    : "text-secondary-400 hover:bg-secondary-800/50 hover:text-white"
                )}
              >
                <Settings size={18} />
                <span>Mon Compte</span>
              </Link>
            </div>
          </div>

          {/* Footer with logout */}
          <div className="mt-auto p-4 border-t border-secondary-800/50">
            <button 
              onClick={() => { 
                fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
                logout();
                navigate('/login');
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-secondary-400 hover:bg-red-900/30 hover:text-red-400 transition-all duration-200"
            >
              <LogOut size={18} />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-white border-b border-secondary-200 h-16 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 text-secondary-600 hover:bg-secondary-100 rounded-lg"
            >
              <Menu size={20} />
            </button>
            
            {/* Breadcrumb ou titre de page */}
            <div className="hidden sm:block">
              <h2 className="text-sm font-medium text-secondary-900">
                {isAdmin ? 'Administration' : 'Espace Client'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user && (
              <>
                <button className="p-2.5 text-secondary-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-colors relative" aria-label="Notifications">
                  <Bell size={20} />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full"></span>
                </button>
                <div className="h-8 w-px bg-secondary-200 mx-1" aria-hidden="true"></div>
                <Link 
                  to="/client/settings" 
                  className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-secondary-700 hover:text-secondary-900 hover:bg-secondary-50 rounded-xl transition-colors"
                >
                  <div className="w-8 h-8 bg-secondary-100 rounded-lg flex items-center justify-center">
                    <User size={16} className="text-secondary-600" />
                  </div>
                  <span className="hidden md:inline">{user?.companyName || 'Mon Compte'}</span>
                </Link>
              </>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto bg-secondary-50">
          <div className="max-w-7xl mx-auto">
            {!user ? (
              <div className="p-8 bg-white border border-secondary-200 rounded-xl text-secondary-900 shadow-sm">
                <h2 className="text-xl font-bold mb-2">Connexion requise</h2>
                <p className="text-sm text-secondary-600">
                  Veuillez <Link to="/login" className="text-primary-600 font-medium hover:underline">vous connecter</Link> pour accéder à votre espace professionnel.
                </p>
              </div>
            ) : user.status === 'REJECTED' ? (
              <div className="p-8 bg-red-50 border border-red-200 rounded-xl text-red-900">
                <h2 className="text-xl font-bold mb-2">Compte refusé</h2>
                <p className="text-sm">
                  Votre demande a été refusée. Pour toute question, contactez le support.
                </p>
              </div>
            ) : !isActive ? (
              <div className="p-8 bg-amber-50 border border-amber-200 rounded-xl text-amber-900">
                <h2 className="text-xl font-bold mb-2">Compte en vérification</h2>
                <p className="text-sm">
                  Votre compte est en cours de validation par nos équipes. Vous serez notifié par email dès qu'il sera activé.
                </p>
              </div>
            ) : (
              <Outlet />
            )}
          </div>
        </main>
      </div>
      
      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
