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
