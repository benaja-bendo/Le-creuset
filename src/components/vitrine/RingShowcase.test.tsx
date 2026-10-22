import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import RingShowcase from './RingShowcase';

// Sans contexte WebGL (vieux appareil, navigateur bridé), `WebGLRenderer`
// lève une exception. Elle doit rester confinée à la vignette 3D : c'est ce
// type d'erreur qui remplaçait autrefois toute une page par l'écran d'erreur.
vi.mock('three', async (importOriginal) => {
  const actual = await importOriginal<typeof import('three')>();
  return {
    ...actual,
    WebGLRenderer: class {
      constructor() {
        throw new Error('Error creating WebGL context.');
      }
    },
  };
});

describe('RingShowcase', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows a static fallback instead of crashing when WebGL is unavailable', async () => {
    render(<RingShowcase />);

    expect(await screen.findByText('Aperçu 3D indisponible sur cet appareil.')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Une même pièce, chaque étape de l’atelier' })).toBeInTheDocument();
  });

  it('switches the material and its description from the picker', async () => {
    render(<RingShowcase />);
    await screen.findByText('Aperçu 3D indisponible sur cet appareil.');

    const platine = screen.getByRole('button', { name: 'Platine 950' });
    expect(platine).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(platine);

    expect(platine).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Or jaune 750' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByText('Le plus dense des métaux travaillés à l’atelier.')).toBeInTheDocument();
  });
});
