/**
 * Helpers d'affichage des commandes.
 *
 * Une commande porte deux identifiants : `id` (cuid technique, utilisé dans les
 * URL et les appels API) et `orderNumber` (le numéro métier, celui que le
 * client et l'atelier connaissent). Seul `orderNumber` doit être montré à un
 * utilisateur — afficher la queue du cuid produit des références qui ne
 * correspondent à aucune commande, ce que le client a signalé sur les factures.
 *
 * Ces helpers sont partagés pour que toutes les pages affichent la même
 * référence pour la même commande.
 */

export type OrderIdentity = {
  id: string;
  orderNumber?: string | null;
};

/**
 * Référence lisible d'une commande.
 *
 * `orderNumber` est nullable en base : les commandes antérieures à la migration
 * `20260606110139_add_order_number` n'en ont pas. Dans ce cas on annonce
 * explicitement l'absence de numéro plutôt que de présenter un fragment
 * d'identifiant technique comme s'il en était un.
 */
export function orderRef(order: OrderIdentity): string {
  return order.orderNumber || `Sans n° (${order.id.slice(-6).toUpperCase()})`;
}

/** Libellés français des statuts de commande (enum `OrderStatus` côté back). */
export const ORDER_STATUS_LABELS: Record<string, string> = {
  EN_ATTENTE: 'En attente',
  TIRAGE_OK: 'Cires prêtes',
  FONDU: 'Fondu',
  EXPEDIE: 'Expédié',
};

export function orderStatusLabel(status: string): string {
  return ORDER_STATUS_LABELS[status] ?? status;
}
