import { CONTACT } from './site';

export type ContactFields = {
  name: string;
  company: string;
  email: string;
  message: string;
};

/**
 * Lien `mailto:` pré-rempli avec la demande du formulaire de contact.
 * Solution de secours quand `POST /contact` échoue : le visiteur envoie le
 * message depuis sa messagerie sans avoir à le retaper.
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
