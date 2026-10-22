/**
 * Date affichée en bas des pages légales. À mettre à jour à la main quand le
 * texte d'une page change : elle ne doit pas être calculée, sinon elle
 * afficherait la date du jour à chaque visite.
 */
export const LEGAL_LAST_UPDATED = '22 octobre 2026';

/**
 * La société est en cours d'immatriculation (octobre 2026) : pas encore de
 * forme juridique, de SIRET ni d'adresse de siège. En attendant, les pages
 * légales affichent ces mentions transitoires plutôt que des champs vides.
 *
 * Quand le client transmet les informations : les remplacer dans
 * `MentionsLegales.tsx` (éditeur, directeur de la publication) et
 * `PrivacyPolicy.tsx` (responsable, contact), puis supprimer cet objet.
 */
export const LEGAL_PENDING = {
  status:
    'Société en cours d’immatriculation. La forme juridique, le capital social, le numéro SIRET et le numéro de TVA intracommunautaire seront publiés ici dès son enregistrement.',
  address: 'Atelier à Bordeaux. L’adresse postale du siège sera publiée ici dès l’immatriculation de la société.',
  director: 'Le nom du directeur de la publication sera communiqué dès l’immatriculation de la société.',
} as const;
