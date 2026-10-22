import { CONTACT } from './site';

export type ContactFields = {
  name: string;
  company: string;
  email: string;
  message: string;
};

/**
 * Lien `mailto:` pré-rempli avec la demande du formulaire de contact.
 * Le site n'a pas encore de route d'envoi côté API : c'est la messagerie du
 * visiteur qui envoie le message à l'atelier.
 */
export function buildContactMailto({ name, company, email, message }: ContactFields): string {
  const from = company.trim() || name.trim();
  const subject = from ? `Demande de contact — ${from}` : 'Demande de contact';
  const body = [
    `Nom : ${name.trim()}`,
    `Société : ${company.trim()}`,
    `Email : ${email.trim()}`,
    '',
    message.trim(),
  ].join('\n');
  return `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
