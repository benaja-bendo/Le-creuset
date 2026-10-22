/**
 * Règle des nouveaux mots de passe, identique à celle du back
 * (`src/auth/password-policy.ts`) : 8 caractères, sans exigence de majuscule
 * ni de chiffre. La connexion ne contrôle pas la longueur, pour que les
 * comptes créés sous une ancienne règle restent utilisables.
 */
export const MIN_PASSWORD_LENGTH = 8;

export const PASSWORD_RULE_HINT = `Au moins ${MIN_PASSWORD_LENGTH} caractères.`;

export const PASSWORD_TOO_SHORT_MESSAGE = `Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères.`;

export function isPasswordLongEnough(password: string): boolean {
  return password.length >= MIN_PASSWORD_LENGTH;
}
