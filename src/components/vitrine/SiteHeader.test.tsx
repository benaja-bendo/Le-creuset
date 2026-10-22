import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SiteHeader from './SiteHeader';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <SiteHeader />
    </MemoryRouter>,
  );
}

describe('SiteHeader', () => {
  it('marks « Nos services » as current on a service detail page', () => {
    renderAt('/fonte');

    const nav = screen.getByRole('navigation', { name: 'Navigation principale' });
    const current = nav.querySelector('[aria-current="page"]');
    expect(current).toHaveTextContent('Nos services');
  });

  it('opens the mobile menu, locks the page scroll, and closes on Escape', () => {
    renderAt('/');
    const toggle = screen.getByRole('button', { name: 'Ouvrir le menu' });
    const menu = document.getElementById('menu-mobile');

    expect(menu).not.toBeVisible();

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(menu).toBeVisible();
    expect(document.body.style.overflow).toBe('hidden');

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(menu).not.toBeVisible();
    expect(document.body.style.overflow).toBe('');
  });

  it('closes the mobile menu when a link is followed', () => {
    renderAt('/');
    fireEvent.click(screen.getByRole('button', { name: 'Ouvrir le menu' }));

    const mobileNav = screen.getByRole('navigation', { name: 'Navigation mobile' });
    fireEvent.click(mobileNav.querySelector('a[href="/services"]')!);

    expect(document.getElementById('menu-mobile')).not.toBeVisible();
  });
});
