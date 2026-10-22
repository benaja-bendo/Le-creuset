/**
 * Devis automatique : règles de calcul fournies par le client (22/10/2026).
 *
 * Le prix se calcule à partir du volume de la pièce, en deux étapes, puis une
 * majoration est appliquée sur le total :
 *
 *   impression = volume × 50                                   (€ par cm³)
 *   fonte      = volume × densité × prix de fonte du métal     (€ par gramme)
 *   total      = (impression + fonte) × 1,10
 *
 * volume × densité donne la masse de la pièce en grammes. La résine n'a pas de
 * prix automatique : le client reçoit la mention « sur devis ».
 *
 * `swatch` reprend volontairement l'hexadécimal de `MATERIAL_CONFIG` dans
 * `STLViewer` (la pastille du sélecteur et l'aperçu 3D doivent montrer la même
 * teinte), et `density` doit rester égale à celle de `MATERIAL_CONFIG` pour que
 * la masse affichée dans l'aperçu 3D soit celle du devis — `quote.test.ts`
 * vérifie ce second point.
 */

/** Prix de l'impression, en euros par cm³. */
export const PRINT_PRICE_PER_CM3 = 50;

/** Majoration appliquée au total impression + fonte. */
export const QUOTE_MARKUP = 0.1;

export type QuoteMaterial = {
  id: string;
  label: string;
  swatch: string;
  /**
   * Densité (g/cm³) et prix de fonte (€/g). `null` : pas de prix automatique,
   * le client voit « sur devis ».
   */
  pricing: { density: number; castPricePerGram: number } | null;
};

/**
 * Catalogue proposé au devis : les 6 métaux et la résine commercialisés
 * (validé client, août 2026 ; prix et densités mis à jour le 22/10/2026).
 */
export const QUOTE_MATERIALS: readonly QuoteMaterial[] = [
  { id: 'OR_JAUNE_750', label: 'Or Jaune 750 (18k)', swatch: '#d4a72c', pricing: { density: 15.35, castPricePerGram: 2.2 } },
  { id: 'OR_JAUNE_375', label: 'Or Jaune 375 (9k)', swatch: '#c9a86a', pricing: { density: 12, castPricePerGram: 3.9 } },
  { id: 'OR_GRIS_750_PALLADIE_13', label: 'Or Gris 750 (Palladié 13%)', swatch: '#c8cacb', pricing: { density: 15.8, castPricePerGram: 3.6 } },
  { id: 'PLATINE_950', label: 'Platine 950', swatch: '#b8b4ac', pricing: { density: 20.3, castPricePerGram: 5.8 } },
  { id: 'ARGENT_925', label: 'Argent 925', swatch: '#cfd2d4', pricing: { density: 10.35, castPricePerGram: 1.7 } },
  { id: 'LAITON', label: 'Laiton', swatch: '#b5a642', pricing: { density: 8.4, castPricePerGram: 1.3 } },
  { id: 'IMPRESSION_CIRE', label: 'Prototype Résine', swatch: '#ff5733', pricing: null },
];

export type QuoteResult = {
  /** Masse d'une pièce, en grammes. */
  weight: number;
  /** Une pièce, en euros HT. */
  printing: number;
  casting: number;
  markup: number;
  unitTotal: number;
  /** Total pour la quantité demandée, en euros HT. */
  total: number;
};

const toCents = (euros: number) => Math.round(euros * 100) / 100;

/**
 * Devis d'une pièce de `volumeCm3` dans `material`, en `quantity` exemplaires.
 * `null` quand il n'y a pas de prix automatique (résine, volume inconnu).
 */
export function computeQuote(material: QuoteMaterial, volumeCm3: number, quantity = 1): QuoteResult | null {
  if (!material.pricing || !Number.isFinite(volumeCm3) || volumeCm3 <= 0) return null;

  const { density, castPricePerGram } = material.pricing;
  const weight = volumeCm3 * density;
  const printing = volumeCm3 * PRINT_PRICE_PER_CM3;
  const casting = weight * castPricePerGram;
  const markup = (printing + casting) * QUOTE_MARKUP;
  // Arrondi au centime par pièce : ce que le client multiplie ensuite est un prix réel.
  const unitTotal = toCents(printing + casting + markup);

  return {
    weight,
    printing: toCents(printing),
    casting: toCents(casting),
    markup: toCents(markup),
    unitTotal,
    total: toCents(unitTotal * quantity),
  };
}
