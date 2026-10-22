import { GRAINS } from '../grains';

export type RingMaterial = {
  id: string;
  label: string;
  description: string;
  grain: string;
  /** Couleur en sRGB linéaire. Pour un métal c'est sa réflectance F0, d'où des valeurs très claires. */
  color: readonly [number, number, number];
  metalness: number;
  roughness: number;
};

// Volontairement sans import de `three` : ce module est chargé avec la page,
// la scène 3D l'est à la demande.
export const RING_MATERIALS: readonly RingMaterial[] = [
  {
    id: 'resine',
    label: 'Résine',
    description: 'Prototype de validation, pour montrer le volume à votre client.',
    grain: GRAINS.resine,
    color: [0.479, 0.445, 0.397],
    metalness: 0,
    roughness: 0.55,
  },
  {
    id: 'cire',
    label: 'Cire',
    description: 'Impression 3D Systems, calcinable, prête pour la fonte.',
    grain: GRAINS.cire,
    color: [0.09, 0.055, 0.42],
    metalness: 0,
    roughness: 0.32,
  },
  {
    id: 'or-jaune',
    label: 'Or jaune 750',
    description: 'Or 18 carats, la teinte classique de la joaillerie.',
    grain: GRAINS.orJaune,
    color: [1, 0.65, 0.23],
    metalness: 1,
    roughness: 0.16,
  },
  {
    id: 'or-rose',
    label: 'Or rose 750',
    description: 'Or 18 carats, plus riche en cuivre.',
    grain: GRAINS.orRose,
    color: [0.96, 0.62, 0.5],
    metalness: 1,
    roughness: 0.16,
  },
  {
    id: 'or-blanc',
    label: 'Or blanc palladié',
    description: 'Or 18 carats allié au palladium (13 %).',
    grain: GRAINS.orBlanc,
    color: [0.78, 0.76, 0.72],
    metalness: 1,
    roughness: 0.17,
  },
  {
    id: 'or-375',
    label: 'Or 375',
    description: 'Or 9 carats, dans toutes ses nuances.',
    grain: GRAINS.or375,
    color: [0.93, 0.74, 0.45],
    metalness: 1,
    roughness: 0.17,
  },
  {
    id: 'argent',
    label: 'Argent 925',
    description: 'Argent massif, titre sterling.',
    grain: GRAINS.argent,
    color: [0.97, 0.96, 0.92],
    metalness: 1,
    roughness: 0.14,
  },
  {
    id: 'platine',
    label: 'Platine 950',
    description: 'Le plus dense des métaux travaillés à l’atelier.',
    grain: GRAINS.platine,
    color: [0.67, 0.64, 0.6],
    metalness: 1,
    roughness: 0.2,
  },
];

export const DEFAULT_RING_MATERIAL = RING_MATERIALS[2];
