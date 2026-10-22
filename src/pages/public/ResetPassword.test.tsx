import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ResetPassword from './ResetPassword';
import { postJSON } from '../../api/client';

vi.mock('../../api/client', () => ({
  postJSON: vi.fn(),
}));

function submitNewPassword(password: string) {
  render(
    <MemoryRouter initialEntries={['/reset?token=reset-token']}>
      <ResetPassword />
    </MemoryRouter>
  );
  const [newPassword, confirmPassword] = screen.getAllByPlaceholderText('••••••••');
  fireEvent.change(newPassword, { target: { value: password } });
  fireEvent.change(confirmPassword, { target: { value: password } });
  fireEvent.click(screen.getByRole('button', { name: 'Mettre à jour' }));
}

describe('ResetPassword', () => {
  beforeEach(() => {
    vi.mocked(postJSON).mockReset();
  });

  it('shows the minimum length rule under the new password field', () => {
    render(
      <MemoryRouter initialEntries={['/reset?token=reset-token']}>
        <ResetPassword />
      </MemoryRouter>
    );

    expect(screen.getByText('Au moins 8 caractères.')).toBeInTheDocument();
  });

  // Le back refusait déjà ce mot de passe à la connexion : il ne doit pas
  // pouvoir être enregistré au reset.
  it('refuses a password shorter than 8 characters without calling the API', () => {
    submitNewPassword('1234567');

    expect(
      screen.getByText('Le mot de passe doit contenir au moins 8 caractères.')
    ).toBeInTheDocument();
    expect(postJSON).not.toHaveBeenCalled();
  });

  it('sends an 8-character password to the API, with no uppercase letter or digit required', () => {
    vi.mocked(postJSON).mockResolvedValue({ message: 'ok' });

    submitNewPassword('abcdefgh');

    expect(postJSON).toHaveBeenCalledWith('/auth/reset-password', {
      token: 'reset-token',
      newPassword: 'abcdefgh',
    });
  });
});
