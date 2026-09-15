import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import * as THREE from 'three';
import STLViewer, { resolveMaterial, resolveRoughness, calculateVolume, calculateDimensions } from './STLViewer';

/** Boîte fermée de `size` mm de côté, triangulée (12 facettes, 2 par face). */
function buildCubeGeometry(size: number): THREE.BufferGeometry {
  const h = size / 2;
  const c: [number, number, number][] = [
    [-h, -h, -h], [h, -h, -h], [h, h, -h], [-h, h, -h],
    [-h, -h, h], [h, -h, h], [h, h, h], [-h, h, h],
  ];
  const faces = [
    [0, 1, 2], [0, 2, 3], // arrière
    [4, 6, 5], [4, 7, 6], // avant
    [0, 4, 5], [0, 5, 1], // dessous
    [3, 2, 6], [3, 6, 7], // dessus
    [0, 3, 7], [0, 7, 4], // gauche
    [1, 5, 6], [1, 6, 2], // droite
  ];
  const positions = faces.flatMap(f => f.flatMap(i => c[i]));
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  return geometry;
}

describe('resolveMaterial', () => {
  it('returns the config for a known material id', () => {
    expect(resolveMaterial('ARGENT_925').density).toBeCloseTo(10.4);
  });

  it('maps the admin order nomenclature to the STLViewer vocabulary', () => {
    // Les commandes créées depuis l'admin utilisent `OR_750_JAUNE`, pas
    // `OR_JAUNE_750` — cf. MATERIAL_ALIASES. Sans ce mappage, la densité
    // retombe sur l'or jaune 18k par défaut et la masse affichée est fausse.
    expect(resolveMaterial('OR_750_JAUNE')).toEqual(resolveMaterial('OR_JAUNE_750'));
    expect(resolveMaterial('PROTOTYPE_RESINE')).toEqual(resolveMaterial('IMPRESSION_CIRE'));
  });

  it('falls back to OR_JAUNE_750 for an unknown material id', () => {
    expect(resolveMaterial('SOMETHING_UNKNOWN')).toEqual(resolveMaterial('OR_JAUNE_750'));
  });
});

describe('resolveRoughness', () => {
  const config = resolveMaterial('ARGENT_925');

  it('uses the material roughness when the finish is polished', () => {
    expect(resolveRoughness(config, 'poli')).toBe(config.roughness);
  });

  it('uses a flat roughness for a raw finish', () => {
    expect(resolveRoughness(config, 'brut')).toBe(0.4);
  });
});

describe('calculateVolume', () => {
  it('computes the enclosed volume of a closed mesh, in cm3', () => {
    const geometry = buildCubeGeometry(10); // 10mm cube = 1000mm3 = 1cm3
    expect(calculateVolume(geometry)).toBeCloseTo(1, 2);
  });

  it('returns 0 when the geometry has no position attribute', () => {
    expect(calculateVolume(new THREE.BufferGeometry())).toBe(0);
  });
});

describe('calculateDimensions', () => {
  it('computes the bounding box size in mm', () => {
    const geometry = buildCubeGeometry(10);
    expect(calculateDimensions(geometry)).toEqual({ x: 10, y: 10, z: 10 });
  });

});

describe('STLViewer error resilience', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  // jsdom ne fournit pas de vrai WebGL : ces rendus exercent donc, avec le
  // `three` réel (pas de mock), le même chemin d'échec de `initScene` que
  // `STLViewer.webgl-failure.test.tsx` teste explicitement. L'intérêt ici
  // est de vérifier qu'aucune combinaison de props ne fait fuiter
  // l'exception hors du composant, sans dépendre du message exact.
  it('renders without crashing when the file fetch fails', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('network disabled in test'))));

    expect(() =>
      render(
        <STLViewer
          fileUrl="https://example.com/model.stl"
          fileName="model.stl"
          materialType="OR_JAUNE_750"
          finishType="poli"
        />
      )
    ).not.toThrow();

    expect(await screen.findByText(/vérifiez que le fichier est un modèle 3d valide/i)).toBeInTheDocument();
  });

  it('renders without crashing when fileUrl is null', () => {
    expect(() =>
      render(
        <STLViewer fileUrl={null} fileName={null} materialType="OR_JAUNE_750" finishType="poli" />
      )
    ).not.toThrow();
  });
});
