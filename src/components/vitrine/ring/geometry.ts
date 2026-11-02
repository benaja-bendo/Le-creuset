import * as THREE from 'three';
import { STLLoader } from 'three-stdlib';
import bagueStlUrl from './bague.stl?url';

/** Rayon cible après mise à l'échelle : calibre la caméra et l'ombre dans RingScene. */
export const RING_RADIUS = 1;

/**
 * Charge le STL fourni par le client, le recentre et le met à l'échelle de
 * `RING_RADIUS` quelles que soient ses unités d'origine.
 *
 * Le fichier (export Rhino) pose la bague à plat, trou vertical (axe Y) ;
 * la scène attend le trou face à la caméra (axe Z, comme l'ancien jonc
 * généré par code), d'où la rotation de 90° avant la mise à l'échelle.
 */
export async function loadRingGeometry(): Promise<THREE.BufferGeometry> {
  const response = await fetch(bagueStlUrl);
  if (!response.ok) {
    throw new Error(`Impossible de charger le modèle 3D (HTTP ${response.status}).`);
  }
  const buffer = await response.arrayBuffer();
  const geometry = new STLLoader().parse(buffer);

  geometry.center();
  geometry.rotateX(-Math.PI / 2);
  geometry.computeBoundingBox();

  const size = new THREE.Vector3();
  geometry.boundingBox!.getSize(size);
  const scale = (2 * RING_RADIUS) / Math.max(size.x, size.y);
  geometry.scale(scale, scale, scale);

  geometry.center();
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  return geometry;
}
