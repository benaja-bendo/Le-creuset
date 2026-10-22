import * as THREE from 'three';

/** Bague « grenaille » : un jonc à profil arrondi, bordé de deux rangs de grains décalés. */
export const RING = {
  radius: 1,
  halfThickness: 0.07,
  halfWidth: 0.17,
  /** Exposant de la superellipse du profil : 1 = ellipse, plus petit = bords plus droits. */
  profileExponent: 0.45,
  granuleRadius: 0.058,
  granulesPerRow: 40,
  rowOffset: 0.078,
} as const;

function signedPow(x: number, p: number) {
  return Math.sign(x) * Math.pow(Math.abs(x), p);
}

function profile(v: number): [number, number] {
  return [
    RING.halfThickness * signedPow(Math.cos(v), RING.profileExponent),
    RING.halfWidth * signedPow(Math.sin(v), RING.profileExponent),
  ];
}

/** Jonc debout dans le plan XY (axe Z), faces orientées vers l'extérieur. */
export function createBandGeometry(segments = 160, profileSegments = 36): THREE.BufferGeometry {
  const positions: number[] = [];
  const normals: number[] = [];
  const indices: number[] = [];
  const eps = 1e-3;

  for (let i = 0; i < segments; i++) {
    const u = (i / segments) * Math.PI * 2;
    const cu = Math.cos(u);
    const su = Math.sin(u);
    for (let j = 0; j < profileSegments; j++) {
      const v = (j / profileSegments) * Math.PI * 2;
      const [r, z] = profile(v);
      const [r1, z1] = profile(v - eps);
      const [r2, z2] = profile(v + eps);
      // Normale du profil 2D : tangente tournée d'un quart de tour vers l'extérieur.
      const tr = r2 - r1;
      const tz = z2 - z1;
      const len = Math.hypot(tr, tz) || 1;
      const nr = tz / len;
      const nz = -tr / len;
      positions.push((RING.radius + r) * cu, (RING.radius + r) * su, z);
      normals.push(nr * cu, nr * su, nz);
    }
  }

  for (let i = 0; i < segments; i++) {
    const i2 = (i + 1) % segments;
    for (let j = 0; j < profileSegments; j++) {
      const j2 = (j + 1) % profileSegments;
      const a = i * profileSegments + j;
      const b = i2 * profileSegments + j;
      const c = i2 * profileSegments + j2;
      const d = i * profileSegments + j2;
      indices.push(a, b, c, a, c, d);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geometry.setIndex(indices);
  return geometry;
}

/** Centres des grains, à demi enchâssés dans la face extérieure du jonc. */
export function granuleCenters(): THREE.Vector3[] {
  const centers: THREE.Vector3[] = [];
  const distance = RING.radius + RING.halfThickness + RING.granuleRadius * 0.45;
  for (const [row, z] of [-RING.rowOffset, RING.rowOffset].entries()) {
    for (let k = 0; k < RING.granulesPerRow; k++) {
      const u = ((k + row * 0.5) / RING.granulesPerRow) * Math.PI * 2;
      centers.push(new THREE.Vector3(distance * Math.cos(u), distance * Math.sin(u), z));
    }
  }
  return centers;
}
