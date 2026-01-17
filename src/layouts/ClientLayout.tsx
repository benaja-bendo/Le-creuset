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
  ChevronRight
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { clsx } from 'clsx';
import { useAuth } from '../context/AuthContext';

/**
 * Mise en page principale de l’espace client avec menu latéral,
 * en-tête et rendu conditionnel selon le statut/role utilisateur.
 */
export default function ClientLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, isClient, isActive } = useAuth();

  const isPathActive = (path: string) => location.pathname === path;
  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  const menuItems = [
    { name: 'Tableau de bord', path: '/client', icon: LayoutDashboard },
    ...(isClient ? [{ name: 'Devis STL', path: '/client/quote', icon: FileText }] : []),
    { name: 'Mes Commandes', path: '/client/orders', icon: FileText },
    { name: 'Paramètres', path: '/client/settings', icon: Settings },
    ...(isAdmin ? [
      { name: 'Utilisateurs', path: '/client/admin/users', icon: User },
      { name: 'Comptes Poids', path: '/client/admin/weights', icon: FileText },
    ] : []),
  ];

  return (
    <div className="min-h-screen bg-secondary-50 flex font-sans">
      {/* Sidebar */}
      <aside 
        className={clsx(
          "fixed inset-y-0 left-0 z-40 w-64 bg-secondary-900 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-secondary-800 flex items-center justify-between">
            <Link to="/" className="text-xl font-bold tracking-tight">
              FONDERIE<span className="text-primary-500">IND</span>
            </Link>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-secondary-400 hover:text-white">
              <X size={20} />
            </button>
          </div>

          <div className="p-4">
            <div className="flex items-center gap-3 p-3 bg-secondary-800/50 rounded-lg mb-6">
              <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold">
                {(user?.email || 'U').slice(0,2).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium">{user?.companyName || 'Compte Pro'}</p>
                <p className="text-xs text-secondary-400">{isAdmin ? 'Administrateur' : 'Client'}</p>
              </div>
            </div>

            <nav className="space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={clsx(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isPathActive(item.path) 
                      ? "bg-primary-600 text-white shadow-md" 
                      : "text-secondary-400 hover:bg-secondary-800 hover:text-white"
                  )}
                >
                  <item.icon size={18} />
                  {item.name}
                  {isPathActive(item.path) && <ChevronRight size={14} className="ml-auto" />}
                </Link>
              ))}
            </nav>
          </div>

          <div className="mt-auto p-4 border-t border-secondary-800">
            <Link 
              to="/" 
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-secondary-400 hover:bg-red-900/20 hover:text-red-400 transition-colors"
            >
              <LogOut size={18} />
              Déconnexion
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-white border-b border-secondary-200 h-16 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden p-2 text-secondary-600 hover:bg-secondary-100 rounded-lg"
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-4 ml-auto">
            <button className="p-2 text-secondary-400 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-px bg-secondary-200 mx-2"></div>
            <button className="flex items-center gap-2 text-sm font-medium text-secondary-700 hover:text-secondary-900">
              <User size={18} />
              <span className="hidden sm:inline">Mon Compte</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {!user ? (
              <div className="p-8 bg-secondary-50 border border-secondary-200 rounded-lg text-secondary-900">
                <h2 className="text-xl font-bold mb-2">Connexion requise</h2>
                <p className="text-sm">
                  Veuillez <Link to="/login" className="text-primary-600 underline">vous connecter</Link> pour accéder à votre espace client.
                </p>
              </div>
            ) : !isActive ? (
              <div className="p-8 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-900">
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
