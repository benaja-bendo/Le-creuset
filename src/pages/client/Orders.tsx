import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getJSON } from '../../api/client';
import { Box, Clock, ChevronRight, AlertCircle, Loader2, FileText, Eye } from 'lucide-react';

type Invoice = {
  id: string;
  invoiceNumber: string;
};

type Order = {
  id: string;
  status: string;
  createdAt: string;
  stlFileUrl?: string;
  estimatedPrice?: number;
  notes?: string;
  invoices?: Invoice[];
};

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const data = await getJSON<Order[]>('/orders/me');
        setOrders(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur de chargement');
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

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
      case 'EN_ATTENTE': return 'En attente';
      case 'TIRAGE_OK': return 'Cires prêtes';
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
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Mes Commandes</h1>
        <p className="text-secondary-500">Suivez l'état d'avancement de vos tirages et fontes.</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="p-12 bg-white rounded-xl border border-secondary-200 text-center">
          <Box className="mx-auto text-secondary-200 mb-4" size={48} />
          <h3 className="text-lg font-medium text-secondary-900">Aucune commande</h3>
          <p className="text-secondary-500">Vous n'avez pas encore passé de commande.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {orders.map((order) => {
            const hasInvoice = order.invoices && order.invoices.length > 0;
            
            return (
              <div key={order.id} className="bg-white rounded-xl border border-secondary-200 shadow-sm overflow-hidden hover:border-primary-300 transition-colors">
                <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${
                      order.status === 'EXPEDIE' ? 'bg-green-50 text-green-500' : 'bg-secondary-50 text-secondary-400'
                    }`}>
                      <Box size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-mono text-sm font-bold text-secondary-900">#{order.id.slice(-6).toUpperCase()}</span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border ${getStatusStyle(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                        {hasInvoice && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-primary-100 text-primary-700 border border-primary-200 flex items-center gap-1">
                            <FileText size={10} /> Facture
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-secondary-500">
                        <span className="flex items-center gap-1">
                          <Clock size={12} /> 
                          {new Date(order.createdAt).toLocaleDateString('fr-FR', { 
                            day: 'numeric', month: 'short', year: 'numeric' 
                          })}
                        </span>
                        {order.estimatedPrice && (
                          <span className="font-semibold text-secondary-700">{order.estimatedPrice}€</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {hasInvoice && (
                      <Link
                        to="/client/invoices"
                        className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
                      >
                        <Eye size={16} />
                        <span className="hidden sm:inline">Facture</span>
                      </Link>
                    )}
                    <Link 
                      to={`/client/orders/${order.id}`}
                      className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50 rounded-lg transition-colors"
                    >
                      Détails <ChevronRight size={16} />
                    </Link>
                  </div>
                </div>
                
                {order.notes && (
                  <div className="px-5 py-3 bg-secondary-50 border-t border-secondary-100">
                    <p className="text-xs text-secondary-600 italic">"{order.notes}"</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
