import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import ContactSection from './ContactSection';
import { postJSON } from '../../api/client';

vi.mock('../../api/client', () => ({
  postJSON: vi.fn(),
}));

function fillAndSubmit() {
  render(<ContactSection />);
  fireEvent.change(screen.getByLabelText('Nom'), { target: { value: 'Camille Martin' } });
  fireEvent.change(screen.getByLabelText('Société'), { target: { value: 'Atelier Martin' } });
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'camille@atelier-martin.fr' } });
  fireEvent.change(screen.getByLabelText('Message'), { target: { value: 'Une fonte en or 750 ?' } });
  fireEvent.click(screen.getByRole('button', { name: 'Envoyer le message' }));
}

describe('ContactSection', () => {
  beforeAll(() => {
    // jsdom n'implémente pas le défilement.
    Element.prototype.scrollIntoView = vi.fn();
  });

  beforeEach(() => {
    vi.mocked(postJSON).mockReset();
  });

  it('posts the form to /contact with an empty honeypot, then confirms', async () => {
    vi.mocked(postJSON).mockResolvedValue({ ok: true });

    fillAndSubmit();

    expect(postJSON).toHaveBeenCalledWith('/contact', {
      name: 'Camille Martin',
      company: 'Atelier Martin',
      email: 'camille@atelier-martin.fr',
      message: 'Une fonte en or 750 ?',
      website: '',
    });
    const heading = await screen.findByRole('heading', { name: 'Message envoyé' });
    expect(heading).toHaveFocus();
    expect(screen.getByText('camille@atelier-martin.fr')).toBeInTheDocument();
  });

  it('locks the form while the message is being sent', () => {
    vi.mocked(postJSON).mockReturnValue(new Promise(() => {}));

    fillAndSubmit();

    expect(screen.getByRole('button', { name: 'Envoi en cours…' })).toBeDisabled();
    expect(screen.getByLabelText('Message')).toBeDisabled();
  });

  it('keeps the message and offers a pre-filled email when sending fails', async () => {
    vi.mocked(postJSON).mockRejectedValue(new Error('Service Unavailable'));

    fillAndSubmit();

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Votre message n’a pas pu partir');
    const fallback = screen.getByRole('link', { name: 'envoyez-le depuis votre messagerie' });
    expect(fallback.getAttribute('href')).toMatch(/^mailto:contact@lagrenaille\.fr\?/);
    expect(decodeURIComponent(fallback.getAttribute('href') ?? '')).toContain('Une fonte en or 750 ?');
    expect(screen.getByLabelText('Message')).toHaveValue('Une fonte en or 750 ?');
    const submit = screen.getByRole('button', { name: 'Envoyer le message' });
    expect(submit).toBeEnabled();
    expect(submit).toHaveFocus();
  });

  it('returns to an empty form after a successful sending', async () => {
    vi.mocked(postJSON).mockResolvedValue({ ok: true });

    fillAndSubmit();
    fireEvent.click(await screen.findByRole('button', { name: 'Écrire un autre message' }));

    expect(screen.getByLabelText('Nom')).toHaveValue('');
    expect(screen.getByLabelText('Nom')).toHaveFocus();
    expect(screen.getByLabelText('Message')).toHaveValue('');
  });

  // Un humain ne doit ni voir ni atteindre le pot de miel au clavier.
  it('hides the honeypot from people and assistive technologies', () => {
    const { container } = render(<ContactSection />);
    const honeypot = container.querySelector<HTMLInputElement>('input[name="website"]');

    expect(honeypot).not.toBeNull();
    expect(honeypot).toHaveAttribute('tabindex', '-1');
    expect(honeypot?.closest('[aria-hidden="true"]')).not.toBeNull();
  });
});
