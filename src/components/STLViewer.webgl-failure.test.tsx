import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';

// `THREE.WebGLRenderer` throws when it cannot get a WebGL context — this is
// the failure mode reported in production ("e is not a function" taking
// over the whole page after loading an .stl). Mocking it here, in a
// dedicated file, forces that exact path deterministically instead of
// relying on incidental WebGL (un)availability in jsdom — other test files
// keep the real `three` module for their geometry math.
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

/** STL binaire minimal (1 facette) — juste assez pour que STLLoader.parse() réussisse. */
function minimalBinarySTL(): ArrayBuffer {
  const buf = new ArrayBuffer(80 + 4 + 50);
  const view = new DataView(buf);
  view.setUint32(80, 1, true); // 1 facette
  return buf;
}

describe('STLViewer / initScene failure', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('does not crash the page when the 3D scene cannot be initialized', async () => {
    // Avant le correctif, `initScene` n'avait pas de try/catch : cette
    // exception, levée dans un useEffect, remontait jusqu'au `errorElement`
    // du routeur et remplaçait toute la page par l'écran générique "Oups !"
    // au lieu de rester confinée à la vignette de l'aperçu 3D.
    const { default: STLViewer } = await import('./STLViewer');

    expect(() =>
      render(
        <STLViewer fileUrl={null} fileName={null} materialType="OR_JAUNE_750" finishType="poli" />
      )
    ).not.toThrow();

    expect(
      screen.getByText(/impossible d'initialiser le rendu 3d sur cet appareil/i)
    ).toBeInTheDocument();
  });

  it('keeps showing the scene-init error even once the file finishes parsing', async () => {
    // `loadModel` réussit à parser le fichier (ça ne dépend pas de WebGL) et
    // calcule volume/dimensions avec succès. Sans le correctif d'ordre
    // d'assignation de `sceneRef.current`, son `setError(null)` de départ
    // écrasait silencieusement le message ci-dessus : l'utilisateur se
    // retrouvait avec un aperçu 3D vide et aucune indication qu'autre chose
    // avait échoué.
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(new Response(minimalBinarySTL(), { status: 200 })))
    );

    const { default: STLViewer } = await import('./STLViewer');

    render(
      <STLViewer
        fileUrl="https://example.com/model.stl"
        fileName="model.stl"
        materialType="OR_JAUNE_750"
        finishType="poli"
      />
    );

    expect(
      await screen.findByText(/impossible d'initialiser le rendu 3d sur cet appareil/i)
    ).toBeInTheDocument();
  });
});
