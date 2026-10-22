import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import CGV from './CGV';
import MentionsLegales from './MentionsLegales';
import PrivacyPolicy from './PrivacyPolicy';
import { CONTACT } from '../../lib/site';

const PAGES = { CGV, MentionsLegales, PrivacyPolicy };

describe('pages légales', () => {
  it.each(Object.entries(PAGES))('%s : aucun champ « [À REMPLIR] » visible', (_name, Page) => {
    const { container } = render(<Page />);
    expect(container.textContent).not.toMatch(/\[[A-ZÉÈ' /]{3,}[^\]]*\]/);
  });

  it('CGV : plus d’acompte, réclamation sous 3 jours', () => {
    const { container } = render(<CGV />);
    const text = container.textContent ?? '';
    expect(text).not.toMatch(/acompte\s*:|solde|chutes/i);
    expect(text).toContain('dans les 3 jours suivant la réception');
  });

  it('mentions légales : téléphone et email réels', () => {
    const { container } = render(<MentionsLegales />);
    expect(container.querySelector(`a[href="mailto:${CONTACT.email}"]`)).not.toBeNull();
    expect(container.querySelector(`a[href="${CONTACT.phoneHref}"]`)).not.toBeNull();
  });
});
