import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { createBandGeometry, granuleCenters, RING } from './geometry';
import type { RingMaterial } from './materials';

type RingSceneProps = {
  material: RingMaterial;
  /** WebGL indisponible ou en échec : le parent affiche alors son visuel de repli. */
  onError: (error: unknown) => void;
};

const AUTO_SPIN = 0.22; // rad/s
const DRAG_SPEED = 0.009; // rad/px
const MATERIAL_EASING = 7;

function contactShadowTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, 'rgba(43, 41, 40, 0.42)');
    gradient.addColorStop(0.55, 'rgba(43, 41, 40, 0.12)');
    gradient.addColorStop(1, 'rgba(43, 41, 40, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }
  return new THREE.CanvasTexture(canvas);
}

export default function RingScene({ material, onError }: RingSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const targetRef = useRef(material);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    targetRef.current = material;
  }, [material]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch (error) {
      onErrorRef.current(error);
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = environment;

    const camera = new THREE.PerspectiveCamera(28, 4 / 3, 0.1, 50);
    camera.position.set(0, 1.25, 6.3);
    camera.lookAt(0, -0.08, 0);

    const initial = targetRef.current;
    const ringMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color().setRGB(...initial.color),
      metalness: initial.metalness,
      roughness: initial.roughness,
      clearcoat: 0.15,
      clearcoatRoughness: 0.3,
    });

    const ring = new THREE.Group();
    const bandGeometry = createBandGeometry();
    ring.add(new THREE.Mesh(bandGeometry, ringMaterial));

    const centers = granuleCenters();
    const granuleGeometry = new THREE.SphereGeometry(RING.granuleRadius, 24, 16);
    const granules = new THREE.InstancedMesh(granuleGeometry, ringMaterial, centers.length);
    const matrix = new THREE.Matrix4();
    centers.forEach((center, i) => granules.setMatrixAt(i, matrix.makeTranslation(center)));
    ring.add(granules);
    scene.add(ring);

    const shadowTexture = contactShadowTexture();
    const shadowMaterial = new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false });
    const shadowGeometry = new THREE.PlaneGeometry(3.6, 3.6);
    const shadow = new THREE.Mesh(shadowGeometry, shadowMaterial);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = -(RING.radius + RING.halfThickness + RING.granuleRadius * 2) - 0.02;
    shadow.scale.set(1, 0.55, 1);
    scene.add(shadow);

    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const targetColor = new THREE.Color();
    const clock = new THREE.Clock();
    let angle = 0.6;
    let velocity = 0;
    let dragX: number | null = null;
    let frame = 0;
    let onScreen = true;

    const resize = () => {
      const { clientWidth: width, clientHeight: height } = canvas;
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    const render = () => {
      frame = 0;
      const dt = Math.min(clock.getDelta(), 0.1);
      const target = targetRef.current;
      const ease = 1 - Math.exp(-dt * MATERIAL_EASING);
      targetColor.setRGB(...target.color);
      ringMaterial.color.lerp(targetColor, ease);
      ringMaterial.metalness += (target.metalness - ringMaterial.metalness) * ease;
      ringMaterial.roughness += (target.roughness - ringMaterial.roughness) * ease;

      if (dragX === null) {
        velocity *= Math.exp(-dt * 3);
        angle += velocity + (reducedMotion ? 0 : AUTO_SPIN * dt);
      }
      ring.rotation.y = angle;
      renderer.render(scene, camera);
      schedule();
    };

    const schedule = () => {
      if (!frame && onScreen && document.visibilityState === 'visible') {
        frame = requestAnimationFrame(render);
      }
    };

    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };

    const onPointerDown = (event: PointerEvent) => {
      dragX = event.clientX;
      velocity = 0;
      canvas.setPointerCapture(event.pointerId);
    };
    const onPointerMove = (event: PointerEvent) => {
      if (dragX === null) return;
      const delta = (event.clientX - dragX) * DRAG_SPEED;
      angle += delta;
      velocity = delta;
      dragX = event.clientX;
    };
    const onPointerUp = () => {
      dragX = null;
    };
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        clock.getDelta();
        schedule();
      } else {
        stop();
      }
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      if (onScreen) {
        clock.getDelta();
        schedule();
      } else {
        stop();
      }
    });
    visibilityObserver.observe(canvas);

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointercancel', onPointerUp);
    document.addEventListener('visibilitychange', onVisibility);

    resize();
    schedule();

    return () => {
      stop();
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerUp);
      document.removeEventListener('visibilitychange', onVisibility);
      bandGeometry.dispose();
      granuleGeometry.dispose();
      granules.dispose();
      ringMaterial.dispose();
      shadowGeometry.dispose();
      shadowMaterial.dispose();
      shadowTexture.dispose();
      environment.dispose();
      pmrem.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={`Bague granulée en 3D, en ${material.label.toLowerCase()}`}
      className="absolute inset-0 size-full cursor-grab touch-pan-y active:cursor-grabbing"
    />
  );
}
