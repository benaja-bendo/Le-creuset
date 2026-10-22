import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Tooltip, TooltipContent, TooltipTrigger } from '../components/ui/tooltip';
import ClientLayout from './ClientLayout';

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { email: 'admin@example.test', role: 'ADMIN', status: 'ACTIVE', companyName: 'Atelier test' },
    isAdmin: true,
    isActive: true,
    logout: vi.fn(),
  }),
}));

function PageWithTooltip() {
  return (
    <Tooltip>
      <TooltipTrigger>Aperçu</TooltipTrigger>
      <TooltipContent>Aperçu rapide</TooltipContent>
    </Tooltip>
  );
}

describe('ClientLayout', () => {
  // Le TooltipProvider n'est pas à la racine de l'app, pour garder Radix hors du
  // chunk de la vitrine : sans lui, Radix lève une erreur dès qu'une page admin
  // affiche une infobulle.
  it('provides the tooltip context to its pages', () => {
    render(
      <MemoryRouter initialEntries={['/client/admin/orders']}>
        <Routes>
          <Route path="/client" element={<ClientLayout />}>
            <Route path="admin/orders" element={<PageWithTooltip />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Aperçu')).toBeInTheDocument();
  });
});
