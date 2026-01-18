import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getJSON, patchJSON } from '../../api/client';
import { Box, AlertCircle, Loader2, Download, Package, Flame, Send, Eye, FilePlus } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../components/ui/tooltip';

type Order = {
  id: string;
  status: string;
  createdAt: string;
  stlFileUrl?: string;
  estimatedPrice?: number;
  notes?: string;
  user?: {
    companyName: string;
    email: string;
  };
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      const data = await getJSON<Order[]>('/orders/all');
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await patchJSON(`/orders/${orderId}/status`, { status: newStatus });
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'EN_ATTENTE': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'TIRAGE_OK': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'FONDU': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'EXPEDIE': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-secondary-100 text-secondary-700 border-secondary-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'EN_ATTENTE': return 'Attente';
      case 'TIRAGE_OK': return 'Cires OK';
      case 'FONDU': return 'Fondu';
      case 'EXPEDIE': return 'Expédié';
      default: return status;
    }
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
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 font-serif">Gestion des Commandes</h1>
          <p className="text-secondary-500">Suivi global de la production et mise à jour des statuts.</p>
        </div>
        <div className="text-xs font-bold text-secondary-400 bg-secondary-100 px-3 py-1 rounded-full uppercase tracking-widest">
          {orders.length} Commandes totales
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}

      <div className="bg-white rounded-xl border border-secondary-200 shadow-sm overflow-hidden text-secondary-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-secondary-50 border-b border-secondary-100">
                <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase tracking-widest">Client</th>
                <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase tracking-widest">Détails Pièce</th>
                <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase tracking-widest">Statut Actuel</th>
                <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-100">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-secondary-50/30 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-secondary-900">{order.user?.companyName || 'Inconnu'}</p>
                    <p className="text-xs text-secondary-500">{order.user?.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-secondary-100 rounded flex items-center justify-center text-secondary-400">
                         <Box size={20} />
                       </div>
                       <div>
                         <p className="text-xs font-mono text-secondary-400">#{order.id.slice(-6).toUpperCase()}</p>
                         <p className="text-xs text-secondary-600 italic truncate max-w-[200px]">{order.notes || 'Sans spécifications'}</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-tighter border ${getStatusStyle(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {updatingId === order.id ? (
                        <Loader2 className="animate-spin text-primary-500" size={20} />
                      ) : (
                        <>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Link 
                                to={`/client/admin/orders/${order.id}`}
                                className="p-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors"
                              >
                                <Eye size={18} />
                              </Link>
                            </TooltipTrigger>
                            <TooltipContent>Détails de la commande</TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Link 
                                to={`/client/admin/invoices?orderId=${order.id}`}
                                className="p-2 bg-secondary-100 text-secondary-600 rounded-lg hover:bg-secondary-200 transition-colors"
                              >
                                <FilePlus size={18} />
                              </Link>
                            </TooltipTrigger>
                            <TooltipContent>Ajouter une facture</TooltipContent>
                          </Tooltip>

                          <div className="h-6 w-px bg-secondary-200 mx-1"></div>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button 
                                onClick={() => handleUpdateStatus(order.id, 'TIRAGE_OK')}
                                className={`p-2 rounded-lg transition-all ${order.status === 'TIRAGE_OK' ? 'bg-blue-600 text-white shadow-lg' : 'bg-secondary-100 text-secondary-400 hover:bg-blue-50 hover:text-blue-600'}`}
                              >
                                <Package size={18} />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>Marquer comme Tiré (Cire OK)</TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button 
                                onClick={() => handleUpdateStatus(order.id, 'FONDU')}
                                className={`p-2 rounded-lg transition-all ${order.status === 'FONDU' ? 'bg-purple-600 text-white shadow-lg' : 'bg-secondary-100 text-secondary-400 hover:bg-purple-50 hover:text-purple-600'}`}
                              >
                                <Flame size={18} />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>Marquer comme Fondu</TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button 
                                onClick={() => handleUpdateStatus(order.id, 'EXPEDIE')}
                                className={`p-2 rounded-lg transition-all ${order.status === 'EXPEDIE' ? 'bg-green-600 text-white shadow-lg' : 'bg-secondary-100 text-secondary-400 hover:bg-green-50 hover:text-green-600'}`}
                              >
                                <Send size={18} />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>Clôturer (Expédier)</TooltipContent>
                          </Tooltip>
                          
                          {order.stlFileUrl && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <a 
                                  href={order.stlFileUrl} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  className="p-2 bg-secondary-900 text-white rounded-lg hover:bg-secondary-800 shadow-sm"
                                >
                                  <Download size={18} />
                                </a>
                              </TooltipTrigger>
                              <TooltipContent>Télécharger le fichier STL</TooltipContent>
                            </Tooltip>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {orders.length === 0 && (
          <div className="p-12 text-center text-secondary-400">
             <Box className="mx-auto mb-4 opacity-20" size={48} />
             <p>Aucune commande à gérer pour le moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}
