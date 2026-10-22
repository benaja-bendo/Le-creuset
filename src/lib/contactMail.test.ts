import { describe, expect, it } from 'vitest';
import { buildContactMailto } from './contactMail';

function decode(mailto: string) {
  const url = new URL(mailto);
  return {
    to: url.pathname,
    subject: url.searchParams.get('subject'),
    body: url.searchParams.get('body'),
  };
}

describe('buildContactMailto', () => {
  it('addresses the workshop and puts every field in the body', () => {
    const { to, subject, body } = decode(
      buildContactMailto({
        name: 'Camille Martin',
        company: 'Atelier Martin',
        email: 'camille@atelier-martin.fr',
        message: 'Bonjour,\nune fonte en or 750 ?',
      }),
    );

    expect(to).toBe('contact@lagrenaille.fr');
    expect(subject).toBe('Demande de contact — Atelier Martin');
    expect(body).toBe(
      'Nom : Camille Martin\nSociété : Atelier Martin\nEmail : camille@atelier-martin.fr\n\nBonjour,\nune fonte en or 750 ?',
    );
  });

  it('falls back to the name, then to a generic subject', () => {
    const named = decode(buildContactMailto({ name: 'Camille', company: ' ', email: 'c@x.fr', message: 'm' }));
    const anonymous = decode(buildContactMailto({ name: '', company: '', email: 'c@x.fr', message: 'm' }));

    expect(named.subject).toBe('Demande de contact — Camille');
    expect(anonymous.subject).toBe('Demande de contact');
  });

  // Un « & » ou un « ? » non encodé tronquerait le message dans la messagerie.
  it('encodes characters that would break the mailto query string', () => {
    const mailto = buildContactMailto({ name: 'A & B', company: '', email: 'a@b.fr', message: 'Prix ? 50 % & délai' });

    expect(mailto).not.toMatch(/[&?]\s/);
    expect(decode(mailto).body).toContain('Prix ? 50 % & délai');
  });
});
