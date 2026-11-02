/**
 * Formatage des valeurs numériques venant de l'API.
 *
 * ⚠️ PIÈGE : tous les champs `Decimal` du schéma Prisma (`MetalAccount.balance`,
 * `Transaction.amount`, `Order.estimatedPrice`, `Invoice.amount`,
 * `InvoiceGroup.amount`, `Quote.totalPrice`) arrivent **sérialisés en chaîne**
 * dans le JSON — `Decimal.prototype.toJSON()` renvoie une `string`.
 *
 * Deux conséquences, toutes deux constatées en production :
 *
 *   "12.5".toLocaleString('fr-FR', { minimumFractionDigits: 2 })  →  "12.5"
 *        String hérite de Object.prototype.toLocaleString, qui IGNORE les
 *        options : ni séparateur français, ni décimales imposées.
 *
 *   0 + "120.5"  →  "0120.5"
 *        Le `+` concatène au lieu d'additionner.
 *
 * Ces helpers coercent explicitement. Les utiliser plutôt que d'appeler
 * `.toLocaleString()` directement sur une valeur venue de l'API.
 */

type Numeric = number | string | null | undefined;

/** Coercition sûre d'une valeur d'API vers un nombre. */
export function toNumber(value: Numeric): number {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
}

/** Masse en grammes, format français — ex. `12,500`. */
export function formatGrams(value: Numeric, fractionDigits = 2): string {
  return toNumber(value).toLocaleString('fr-FR', {
    minimumFractionDigits: fractionDigits,
  });
}

/** Montant en euros, format français — ex. `1 250,00`. */
export function formatAmount(value: Numeric): string {
  return toNumber(value).toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Libellé d'un métal de compte poids (`BaseMetalType`). Remplace le
 * `type.replace(/_/g, ' ')` dupliqué dans Weights.tsx et WeightGauges.tsx,
 * qui rendait "OR FIN" plutôt qu'un vrai libellé français.
 */
const BASE_METAL_LABELS: Record<string, string> = {
  OR_FIN: 'Or fin',
  ARGENT_FIN: 'Argent fin',
  PLATINE: 'Platine',
  PALLADIUM: 'Palladium',
};

export function baseMetalLabel(type: string): string {
  return BASE_METAL_LABELS[type] ?? type.replace(/_/g, ' ');
}

/**
 * Classes Tailwind du dégradé d'une carte de compte poids, par métal.
 * Remplace le dégradé gris fixe dupliqué dans `Dashboard.tsx`, qui rendait
 * tous les comptes identiques (hors solde négatif) alors que `WeightGauges.tsx`
 * les distinguait déjà par métal.
 */
export function metalAccountColor(type: string, isNegative: boolean): string {
  if (isNegative) return 'bg-gradient-to-br from-red-800 to-red-900 border-red-700';

  if (type.includes('OR')) return 'bg-gradient-to-br from-amber-600 to-amber-700 border-amber-600';
  if (type.includes('ARGENT')) return 'bg-gradient-to-br from-slate-400 to-slate-500 border-slate-400';
  if (type.includes('PLATINE') || type.includes('PALLADIUM')) return 'bg-gradient-to-br from-zinc-600 to-zinc-700 border-zinc-500';

  return 'bg-gradient-to-br from-secondary-800 to-secondary-900 border-secondary-800';
}
