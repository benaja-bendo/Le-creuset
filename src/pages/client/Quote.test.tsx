import { useEffect } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import Quote from './Quote';

vi.mock('../../api/client', () => ({
  BASE_URL: 'http://api.test',
  uploadFile: vi.fn().mockResolvedValue({ url: '/files/bague.stl', storagePath: 'bague.stl' }),
}));

// Le visualiseur WebGL n'existe pas sous jsdom : on le remplace par un faux qui
// annonce, comme le vrai, un volume de 2 cm³ une fois le fichier chargé.
vi.mock('../../components/STLViewer', () => {
  type Props = { onVolumeCalculated?: (volume: number, dimensions: { x: number; y: number; z: number }) => void };
  function FakeViewer({ onVolumeCalculated }: Props) {
    useEffect(() => onVolumeCalculated?.(2, { x: 10, y: 10, z: 10 }), [onVolumeCalculated]);
    return <div data-testid="viewer" />;
  }
  return { default: FakeViewer };
});

async function renderWithFile() {
  const { container } = render(<Quote />);
  const input = container.querySelector('input[type="file"]') as HTMLInputElement;
  fireEvent.change(input, { target: { files: [new File(['solid'], 'bague.stl')] } });
  await screen.findByTestId('viewer');
}

const estimation = () => screen.getByText('Estimation HT').nextElementSibling as HTMLElement;

describe('Devis instantané', () => {
  it('n’affiche aucun prix avant le dépôt du fichier', () => {
    render(<Quote />);
    expect(estimation()).toHaveTextContent('--,--');
  });

  it('calcule impression + fonte + 10 % pour l’or jaune 750 (2 cm³ → 184,29 €)', async () => {
    await renderWithFile();
    await waitFor(() => expect(estimation()).toHaveTextContent('184,29'));
    expect(screen.getByText('~30.7g')).toBeInTheDocument();
  });

  it('multiplie le prix d’une pièce par la quantité', async () => {
    await renderWithFile();
    await waitFor(() => expect(estimation()).toHaveTextContent('184,29'));
    fireEvent.click(screen.getByRole('button', { name: '+' }));
    fireEvent.click(screen.getByRole('button', { name: '+' }));
    expect(estimation()).toHaveTextContent('552,87');
  });

  it('suit le métal choisi', async () => {
    await renderWithFile();
    fireEvent.click(screen.getByRole('button', { name: /platine 950/i }));
    // (2×50 + 2×20,3×5,8) × 1,10 = 369,03
    await waitFor(() => expect(estimation()).toHaveTextContent('369,03'));
  });

  it('annonce « Sur devis » pour la résine, sans prix ni masse', async () => {
    await renderWithFile();
    fireEvent.click(screen.getByRole('button', { name: /prototype résine/i }));
    await waitFor(() => expect(estimation()).toHaveTextContent('Sur devis'));
    expect(estimation()).not.toHaveTextContent('€');
    expect(screen.queryByText(/Masse estimée/)).not.toBeInTheDocument();
  });
});
