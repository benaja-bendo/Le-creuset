import { describe, it, expect } from 'vitest';
import { resolveMaterial } from '../components/STLViewer';
import { PRINT_PRICE_PER_CM3, QUOTE_MARKUP, QUOTE_MATERIALS, computeQuote, type QuoteMaterial } from './quote';

const material = (id: string): QuoteMaterial => {
  const found = QUOTE_MATERIALS.find((m) => m.id === id);
  if (!found) throw new Error(`Matériau inconnu : ${id}`);
  return found;
};

describe('règles du client', () => {
  it('garde les constantes données par le client', () => {
    expect(PRINT_PRICE_PER_CM3).toBe(50);
    expect(QUOTE_MARKUP).toBe(0.1);
  });

  it('garde le tableau densité / prix de fonte du client', () => {
    const table = Object.fromEntries(
      QUOTE_MATERIALS.map((m) => [m.id, m.pricing && [m.pricing.density, m.pricing.castPricePerGram]]),
    );
    expect(table).toEqual({
      OR_JAUNE_750: [15.35, 2.2],
      OR_JAUNE_375: [12, 3.9],
      OR_GRIS_750_PALLADIE_13: [15.8, 3.6],
      PLATINE_950: [20.3, 5.8],
      ARGENT_925: [10.35, 1.7],
      LAITON: [8.4, 1.3],
      IMPRESSION_CIRE: null,
    });
  });
});

describe('computeQuote', () => {
  it('additionne impression et fonte puis applique la majoration de 10 %', () => {
    // Or 750, 2 cm³ : impression 2×50 = 100 ; masse 2×15,35 = 30,7 g ;
    // fonte 30,7×2,2 = 67,54 ; (100+67,54)×1,10 = 184,294.
    const quote = computeQuote(material('OR_JAUNE_750'), 2);
    expect(quote).not.toBeNull();
    expect(quote!.weight).toBeCloseTo(30.7, 6);
    expect(quote!.printing).toBe(100);
    expect(quote!.casting).toBe(67.54);
    expect(quote!.markup).toBe(16.75);
    expect(quote!.unitTotal).toBe(184.29);
    expect(quote!.total).toBe(184.29);
  });

  it.each([
    // Pour 1 cm³ : (50 + densité × prix de fonte) × 1,10, calculé à la main.
    ['OR_JAUNE_375', 106.48], //             (50 + 12 × 3,9) × 1,1
    ['OR_GRIS_750_PALLADIE_13', 117.57], //  (50 + 15,8 × 3,6) × 1,1 = 117,568
    ['PLATINE_950', 184.51], //              (50 + 20,3 × 5,8) × 1,1 = 184,514
    ['ARGENT_925', 74.35], //                (50 + 10,35 × 1,7) × 1,1 = 74,3545
    ['LAITON', 67.01], //                    (50 + 8,4 × 1,3) × 1,1 = 67,012
  ] as const)('%s, 1 cm³ → %s €', (id, expected) => {
    expect(computeQuote(material(id), 1)!.unitTotal).toBe(expected);
  });

  it('multiplie par la quantité le prix d’une pièce arrondi au centime', () => {
    const quote = computeQuote(material('OR_JAUNE_750'), 2, 3)!;
    expect(quote.unitTotal).toBe(184.29);
    expect(quote.total).toBe(552.87);
  });

  it('ne donne aucun prix automatique pour la résine', () => {
    expect(computeQuote(material('IMPRESSION_CIRE'), 2)).toBeNull();
  });

  it.each([0, -1, NaN, Infinity])('ne donne aucun prix pour un volume de %s', (volume) => {
    expect(computeQuote(material('OR_JAUNE_750'), volume)).toBeNull();
  });
});

describe('cohérence avec l’aperçu 3D', () => {
  it.each(QUOTE_MATERIALS.filter((m) => m.pricing))('$id : même densité que MATERIAL_CONFIG', (m) => {
    expect(resolveMaterial(m.id).density).toBe(m.pricing!.density);
  });
});
