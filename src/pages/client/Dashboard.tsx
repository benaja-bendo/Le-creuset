import { Activity, Box, Clock, DollarSign, FileText, TrendingUp, Users, ClipboardList } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/**
 * Tableau de bord avec rendu conditionnel (CLIENT/ADMIN)
 */
export default function Dashboard() {
  const { isAdmin, isClient } = useAuth();
  const stats = [
    { label: "Commandes en cours", value: "12", icon: Box, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Devis en attente", value: "3", icon: FileText, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Production", value: "85%", icon: Activity, color: "text-green-600", bg: "bg-green-50" },
    { label: "Total Facturé", value: "45k€", icon: DollarSign, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  const orders = [
    { id: "CMD-2023-001", project: "Carter Moteur V8", status: "En production", date: "20/11/2023", progress: 75 },
    { id: "CMD-2023-002", project: "Support Hydraulique", status: "Expédié", date: "18/11/2023", progress: 100 },
    { id: "CMD-2023-003", project: "Boîtier Électrique", status: "En attente", date: "22/11/2023", progress: 10 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Tableau de Bord</h1>
        <p className="text-secondary-500">
          {isClient ? "Bienvenue, voici un aperçu de vos projets en cours." : "Vue administrateur : état global et actions rapides."}
        </p>
      </div>

      {isClient && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white p-6 rounded-xl border border-secondary-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.bg} ${stat.color}`}>
                  <stat.icon size={24} />
                </div>
                <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full flex items-center gap-1">
                  <TrendingUp size={12} /> +12%
                </span>
              </div>
              <p className="text-3xl font-bold text-secondary-900">{stat.value}</p>
              <p className="text-sm text-secondary-500">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {isClient && (
          <div className="lg:col-span-2 bg-white rounded-xl border border-secondary-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-secondary-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-secondary-900">Commandes Récentes</h2>
              <button className="text-sm text-primary-600 font-medium hover:text-primary-700">Voir tout</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-secondary-50 text-secondary-500 font-medium">
                  <tr>
                    <th className="px-6 py-4">Référence</th>
                    <th className="px-6 py-4">Projet</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">État</th>
                    <th className="px-6 py-4">Progression</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-100">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-secondary-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-secondary-900">{order.id}</td>
                      <td className="px-6 py-4 text-secondary-600">{order.project}</td>
                      <td className="px-6 py-4 text-secondary-500 flex items-center gap-2">
                        <Clock size={14} /> {order.date}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium
                          ${order.status === 'En production' ? 'bg-blue-100 text-blue-700' : 
                            order.status === 'Expédié' ? 'bg-green-100 text-green-700' : 
                            'bg-orange-100 text-orange-700'}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="w-24 h-2 bg-secondary-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary-500 rounded-full" 
                            style={{ width: `${order.progress}%` }}
                          ></div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl border border-secondary-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-secondary-900 mb-6">
            {isClient ? 'Notifications' : 'Vue Globale'}
          </h2>
          {isClient ? (
            <>
              <div className="space-y-6">
                {[
                  { title: "Nouveau devis disponible", time: "Il y a 2h", type: "info" },
                  { title: "Production terminée #CMD-002", time: "Il y a 5h", type: "success" },
                  { title: "Validation requise", time: "Hier", type: "warning" },
                ].map((notif, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className={`w-2 h-2 mt-2 rounded-full shrink-0 
                      ${notif.type === 'info' ? 'bg-blue-500' : 
                        notif.type === 'success' ? 'bg-green-500' : 'bg-orange-500'}`}
                    ></div>
                    <div>
                      <p className="text-sm font-medium text-secondary-900">{notif.title}</p>
                      <p className="text-xs text-secondary-500">{notif.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-6 border-t border-secondary-100">
                <button className="w-full py-3 bg-secondary-900 text-white rounded-lg font-medium hover:bg-secondary-800 transition-colors">
                  Nouvelle Demande
                </button>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center gap-3 p-4 bg-secondary-50 border border-secondary-200 rounded-lg">
                <Users size={18} className="text-secondary-700" />
                <div>
                  <p className="text-sm font-medium text-secondary-900">Utilisateurs en attente de validation</p>
                  <p className="text-xs text-secondary-500">3 comptes à vérifier</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-secondary-50 border border-secondary-200 rounded-lg">
                <ClipboardList size={18} className="text-secondary-700" />
                <div>
                  <p className="text-sm font-medium text-secondary-900">Comptes poids négatifs</p>
                  <p className="text-xs text-secondary-500">2 alertes à traiter</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
