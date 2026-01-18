import { useState, useEffect } from 'react';
import { 
  Activity, 
  Box, 
  Clock, 
  FileText, 
  TrendingUp, 
  Users, 
  ClipboardList, 
  AlertCircle, 
  Layers,
  Package,
  Scale,
  ArrowRight,
  UserCheck,
  UserPlus,
  ShoppingCart
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getJSON } from '../../api/client';

type MetalAccount = {
  id: string;
  metalType: string;
  balance: number;
};

type Order = {
  id: string;
  status: string;
  createdAt: string;
  stlFileUrl?: string;
  estimatedPrice?: number;
};

type User = {
  id: string;
  email: string;
  companyName?: string;
  status: string;
  createdAt: string;
};

// Composants réutilisables
const StatCard = ({ label, value, icon: Icon, color, bg }: { label: string; value: string; icon: any; color: string; bg: string }) => (
  <div className="bg-white p-6 rounded-xl border border-secondary-200 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bg} ${color}`}>
        <Icon size={24} />
      </div>
    </div>
    <p className="text-3xl font-bold text-secondary-900">{value}</p>
    <p className="text-sm text-secondary-500 mt-1">{label}</p>
  </div>
);

const QuickAction = ({ to, icon: Icon, title, subtitle, variant = 'default' }: { to: string; icon: any; title: string; subtitle: string; variant?: 'primary' | 'default' }) => (
  <Link 
    to={to} 
    className={`flex items-center gap-4 p-4 rounded-xl border transition-all group ${
      variant === 'primary' 
        ? 'bg-primary-50 border-primary-200 hover:bg-primary-100' 
        : 'bg-white border-secondary-200 hover:bg-secondary-50'
    }`}
  >
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
      variant === 'primary' ? 'bg-primary-600 text-white' : 'bg-secondary-100 text-secondary-600'
    }`}>
      <Icon size={20} />
    </div>
    <div className="flex-1">
      <p className={`font-medium ${variant === 'primary' ? 'text-primary-900' : 'text-secondary-900'}`}>{title}</p>
      <p className="text-xs text-secondary-500">{subtitle}</p>
    </div>
    <ArrowRight size={18} className="text-secondary-400 group-hover:translate-x-1 transition-transform" />
  </Link>
);

/**
 * Tableau de bord avec pages séparées selon le rôle (CLIENT/ADMIN)
 */
export default function Dashboard() {
  const { isAdmin } = useAuth();

  return isAdmin ? <AdminDashboard /> : <ClientDashboard />;
}

// ============================================
// DASHBOARD CLIENT
// ============================================
function ClientDashboard() {
  const [weights, setWeights] = useState<MetalAccount[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [wData, oData] = await Promise.all([
          getJSON<MetalAccount[]>('/weights/me'),
          getJSON<Order[]>('/orders/me')
        ]);
        setWeights(wData);
        setOrders(oData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur de chargement');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const stats = [
    { label: "Commandes en cours", value: orders.filter(o => o.status !== 'EXPEDIE').length.toString(), icon: Box, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Devis en attente", value: orders.filter(o => o.status === 'EN_ATTENTE').length.toString(), icon: FileText, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "En production", value: orders.filter(o => o.status === 'FONDU').length.toString(), icon: Activity, color: "text-green-600", bg: "bg-green-50" },
    { label: "Total expédiées", value: orders.filter(o => o.status === 'EXPEDIE').length.toString(), icon: Package, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'EN_ATTENTE': return 'bg-orange-100 text-orange-700';
      case 'TIRAGE_OK': return 'bg-blue-100 text-blue-700';
      case 'FONDU': return 'bg-purple-100 text-purple-700';
      case 'EXPEDIE': return 'bg-green-100 text-green-700';
      default: return 'bg-secondary-100 text-secondary-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'EN_ATTENTE': return 'En attente';
      case 'TIRAGE_OK': return 'Cires prêtes';
      case 'FONDU': return 'Fondu';
      case 'EXPEDIE': return 'Expédié';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-3">
        <AlertCircle size={20} />
        <p>Erreur : {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Tableau de Bord</h1>
        <p className="text-secondary-500">Bienvenue ! Voici un aperçu de votre activité.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <StatCard key={idx} {...stat} />
        ))}
      </div>

      {/* Metal Accounts */}
      {weights.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-secondary-900 mb-4">Comptes Métaux</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {weights.map((account) => (
              <div key={account.id} className="bg-gradient-to-br from-secondary-800 to-secondary-900 p-6 rounded-xl text-white shadow-lg overflow-hidden relative">
                <div className="relative z-10">
                  <p className="text-secondary-400 text-sm mb-1">{account.metalType}</p>
                  <p className="text-3xl font-bold">
                    {account.balance} <span className="text-sm font-normal text-secondary-300">g</span>
                  </p>
                </div>
                <div className="absolute -right-4 -bottom-4 opacity-10">
                  <TrendingUp size={100} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Orders Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-secondary-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-secondary-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-secondary-900">Dernières commandes</h2>
            <Link to="/client/orders" className="text-sm text-primary-600 font-medium hover:text-primary-700 flex items-center gap-1">
              Voir tout <ArrowRight size={14} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-secondary-50 text-secondary-500 font-medium">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">État</th>
                  <th className="px-6 py-4">Prix est.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-100">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-secondary-400">
                      <Package size={40} className="mx-auto mb-3 opacity-30" />
                      <p>Aucune commande en cours</p>
                    </td>
                  </tr>
                ) : orders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="hover:bg-secondary-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-secondary-500">#{order.id.slice(-6)}</td>
                    <td className="px-6 py-4 text-secondary-500 flex items-center gap-2">
                      <Clock size={14} /> {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-secondary-900">
                      {order.estimatedPrice ? `${order.estimatedPrice}€` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-secondary-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-secondary-900 mb-6">Actions Rapides</h2>
          <div className="space-y-3">
            <QuickAction to="/client/quote" icon={FileText} title="Nouveau Devis STL" subtitle="Uploadez votre modèle 3D" variant="primary" />
            <QuickAction to="/client/molds" icon={Layers} title="Ma Bibliothèque" subtitle="Gérez vos moules" />
            <QuickAction to="/client/orders" icon={ClipboardList} title="Historique" subtitle="Toutes vos commandes" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// DASHBOARD ADMIN
// ============================================
function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, pending: 0, orders: 0 });
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAdminData() {
      try {
        const [pending, allOrders] = await Promise.all([
          getJSON<User[]>('/users/pending'),
          getJSON<Order[]>('/orders'),
        ]);
        setPendingUsers(pending);
        setStats({
          users: 0, // TODO: endpoint /users/count
          pending: pending.length,
          orders: allOrders.length,
        });
      } catch (err) {
        console.error('Error loading admin data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAdminData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Administration</h1>
        <p className="text-secondary-500">Vue globale de l'activité et gestion des utilisateurs.</p>
      </div>

      {/* Admin Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Demandes en attente" value={stats.pending.toString()} icon={UserPlus} color="text-orange-600" bg="bg-orange-50" />
        <StatCard label="Commandes totales" value={stats.orders.toString()} icon={ShoppingCart} color="text-blue-600" bg="bg-blue-50" />
        <StatCard label="Utilisateurs actifs" value="-" icon={UserCheck} color="text-green-600" bg="bg-green-50" />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pending Users */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-secondary-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-secondary-100 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-secondary-900">Demandes d'inscription</h2>
              <p className="text-sm text-secondary-500">Utilisateurs en attente de validation</p>
            </div>
            <Link to="/client/admin/users" className="text-sm text-primary-600 font-medium hover:text-primary-700 flex items-center gap-1">
              Voir tout <ArrowRight size={14} />
            </Link>
          </div>
          
          {pendingUsers.length === 0 ? (
            <div className="p-12 text-center text-secondary-400">
              <UserCheck size={48} className="mx-auto mb-4 opacity-30" />
              <p className="font-medium">Aucune demande en attente</p>
              <p className="text-sm mt-1">Toutes les inscriptions ont été traitées.</p>
            </div>
          ) : (
            <div className="divide-y divide-secondary-100">
              {pendingUsers.slice(0, 5).map((user) => (
                <div key={user.id} className="p-4 flex items-center gap-4 hover:bg-secondary-50 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm">
                    {(user.email || 'U').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-secondary-900 truncate">{user.companyName || user.email}</p>
                    <p className="text-xs text-secondary-500">{new Date(user.createdAt).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <Link 
                    to="/client/admin/users" 
                    className="px-4 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  >
                    Examiner
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions Panel */}
        <div className="bg-white rounded-xl border border-secondary-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-secondary-900 mb-6">Gestion</h2>
          <div className="space-y-3">
            <QuickAction to="/client/admin/users" icon={Users} title="Utilisateurs" subtitle="Gérer les comptes" variant="primary" />
            <QuickAction to="/client/admin/weights" icon={Scale} title="Comptes Poids" subtitle="Soldes métaux" />
            <QuickAction to="/client/admin/orders" icon={Package} title="Commandes" subtitle="Suivi production" />
          </div>
        </div>
      </div>
    </div>
  );
}
