import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Register from './Register';
import { postJSON } from '../../api/client';

vi.mock('../../api/client', () => ({
  postJSON: vi.fn(),
  uploadFile: vi.fn(),
}));

function fillAndSubmit(password: string) {
  render(
    <MemoryRouter>
      <Register />
    </MemoryRouter>
  );
  fireEvent.change(screen.getByPlaceholderText('prenom.nom@entreprise.fr'), { target: { value: 'a@b.fr' } });
  const [pwd, confirm] = screen.getAllByPlaceholderText('••••••••');
  fireEvent.change(pwd, { target: { value: password } });
  fireEvent.change(confirm, { target: { value: password } });
  fireEvent.change(screen.getByPlaceholderText('Raison sociale'), { target: { value: 'Atelier' } });
  fireEvent.change(screen.getByPlaceholderText('+33 X XX XX XX XX'), { target: { value: '0600000000' } });
  fireEvent.change(screen.getByPlaceholderText('Adresse complète'), { target: { value: '1 rue du Test' } });
  fireEvent.click(screen.getByRole('button', { name: 'Soumettre le dossier' }));
}

describe('Register', () => {
  beforeEach(() => {
    vi.mocked(postJSON).mockReset();
  });

  it('shows the password rule under the field', () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    expect(screen.getByText('Au moins 8 caractères.')).toBeInTheDocument();
  });

  it('refuses a password shorter than 8 characters before calling the API', async () => {
    fillAndSubmit('1234567');

    expect(await screen.findByText('Le mot de passe doit contenir au moins 8 caractères.')).toBeInTheDocument();
    expect(postJSON).not.toHaveBeenCalled();
  });

  it('sends the registration for an 8-character password', async () => {
    vi.mocked(postJSON).mockResolvedValue({});

    fillAndSubmit('abcdefgh');

    await vi.waitFor(() =>
      expect(postJSON).toHaveBeenCalledWith('/auth/register', expect.objectContaining({ password: 'abcdefgh' })),
    );
  });
});
