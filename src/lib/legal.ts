/**
 * Date affichée en bas des pages légales. À mettre à jour à la main quand le
 * texte d'une page change : elle ne doit pas être calculée, sinon elle
 * afficherait la date du jour à chaque visite.
 */
export const LEGAL_LAST_UPDATED = '11 novembre 2026';

/**
 * Identité légale de la société, communiquée par le client une fois
 * l'immatriculation faite (novembre 2026). Utilisée par `MentionsLegales.tsx`
 * et `PrivacyPolicy.tsx`.
 *
 * Le client a transmis un « numéro de SIRET » à 9 chiffres suivi de « RCS
 * Bordeaux » — c'est en réalité le numéro SIREN (le SIRET en compte 14,
 * SIREN + 5 chiffres d'établissement). Il correspond bien au numéro de TVA
 * fourni (FR13 132501677 = FR + clé + SIREN), donc affiché ici sous son nom
 * correct (RCS) plutôt que mal étiqueté « SIRET ».
 */
export const LEGAL_ENTITY = {
  legalName: 'La Grenaille SARL',
  legalForm: 'SARL',
  capital: '1 000 €',
  rcs: 'RCS Bordeaux 132 501 677',
  vat: 'FR13 132 501 677',
  address: '11 rue du Port, 33800 Bordeaux',
  directors: ['Axel Ponzio', 'Hugo Schmidt'],
} as const;
