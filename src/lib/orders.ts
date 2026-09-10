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

/**
 * Classes Tailwind du badge de statut. Partagées pour que admin/Orders.tsx et
 * client/Orders.tsx cessent de redéfinir chacun leur version (déjà
 * identiques en couleur, seuls les libellés divergeaient).
 */
export const ORDER_STATUS_STYLES: Record<string, string> = {
  EN_ATTENTE: 'bg-orange-100 text-orange-700 border-orange-200',
  TIRAGE_OK: 'bg-blue-100 text-blue-700 border-blue-200',
  FONDU: 'bg-purple-100 text-purple-700 border-purple-200',
  EXPEDIE: 'bg-green-100 text-green-700 border-green-200',
};

export function orderStatusStyle(status: string): string {
  return ORDER_STATUS_STYLES[status] ?? 'bg-secondary-100 text-secondary-700 border-secondary-200';
}

/**
 * Libellés de l'alliage/service d'une commande (`Order.materialType`).
 *
 * Reprend le vocabulaire réellement écrit en base par admin/Orders.tsx (seul
 * écran qui crée/édite `materialType`) — c'est celui qui a une chance de
 * matcher la valeur stockée. `client/OrderDetail.tsx` avait sa propre table
 * locale ('or-jaune', 'or-rose'…) qui ne correspondait à aucune valeur
 * réellement en base et retombait donc toujours sur le code brut.
 */
export const MATERIAL_TYPE_LABELS: Record<string, string> = {
  OR_750_JAUNE: 'Or Jaune 750',
  OR_375_JAUNE: 'Or Jaune 375',
  OR_750_ROSE: 'Or Rose 750',
  OR_375_ROSE: 'Or Rose 375',
  OR_750_GRIS: 'Or Gris 750',
  OR_375_GRIS: 'Or Gris 375',
  OR_750_PALLADIE_13: 'Or Gris 750 Palladié 13%',
  OR_750_ROUGE: 'Or Rouge 750',
  ARGENT_925: 'Argent 925',
  PLATINE_950: 'Platine 950',
  LAITON: 'Laiton',
  PROTOTYPE_RESINE: 'Prototype Résine',
};

export function materialTypeLabel(materialType?: string | null): string {
  if (!materialType) return 'Non spécifié';
  return MATERIAL_TYPE_LABELS[materialType] ?? materialType;
}
