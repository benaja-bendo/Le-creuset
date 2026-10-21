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

    expect(screen.getByText('Au moins 6 caractères.')).toBeInTheDocument();
  });

  // Le back refusait déjà ce mot de passe à la connexion : il ne doit pas
  // pouvoir être enregistré au reset.
  it('refuses a password shorter than 6 characters without calling the API', () => {
    submitNewPassword('12345');

    expect(
      screen.getByText('Le mot de passe doit contenir au moins 6 caractères.')
    ).toBeInTheDocument();
    expect(postJSON).not.toHaveBeenCalled();
  });

  it('sends a 6-character password to the API', () => {
    vi.mocked(postJSON).mockResolvedValue({ message: 'ok' });

    submitNewPassword('123456');

    expect(postJSON).toHaveBeenCalledWith('/auth/reset-password', {
      token: 'reset-token',
      newPassword: '123456',
    });
  });
});
