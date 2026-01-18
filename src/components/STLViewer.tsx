import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { STLLoader } from 'three-stdlib';
import { OBJLoader } from 'three-stdlib';
import { OrbitControls } from 'three-stdlib';
import { Loader2, RotateCcw, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface STLViewerProps {
  fileUrl: string | null;
  fileName: string | null;
  materialType: string;
  finishType: string;
  onVolumeCalculated?: (volume: number, dimensions: { x: number; y: number; z: number }) => void;
}

const MATERIAL_CONFIG: Record<string, { color: number; metalness: number; density: number }> = {
  'or-jaune': { color: 0xFFD700, metalness: 1.0, density: 19.3 },
  'or-rose': { color: 0xE0BFB8, metalness: 1.0, density: 18.5 },
  'argent': { color: 0xC0C0C0, metalness: 1.0, density: 10.5 },
  'bronze': { color: 0xCD7F32, metalness: 1.0, density: 8.7 },
  'resine': { color: 0x3b82f6, metalness: 0.0, density: 1.2 },
};

/**
 * Calcule le volume d'une géométrie en cm³
 */
function calculateVolume(geometry: THREE.BufferGeometry): number {
  const position = geometry.getAttribute('position');
  if (!position) return 0;

  let volume = 0;
  const p1 = new THREE.Vector3();
  const p2 = new THREE.Vector3();
  const p3 = new THREE.Vector3();

  for (let i = 0; i < position.count; i += 3) {
    p1.fromBufferAttribute(position, i);
    p2.fromBufferAttribute(position, i + 1);
    p3.fromBufferAttribute(position, i + 2);

    volume += p1.dot(p2.cross(p3)) / 6;
  }

  // Convertir de mm³ à cm³ si le modèle est en mm
  return Math.abs(volume) / 1000;
}

/**
 * Calcule les dimensions du bounding box en mm
 */
function calculateDimensions(geometry: THREE.BufferGeometry): { x: number; y: number; z: number } {
  geometry.computeBoundingBox();
  const bb = geometry.boundingBox;
  if (!bb) return { x: 0, y: 0, z: 0 };

  return {
    x: Math.round((bb.max.x - bb.min.x) * 100) / 100,
    y: Math.round((bb.max.y - bb.min.y) * 100) / 100,
    z: Math.round((bb.max.z - bb.min.z) * 100) / 100,
  };
}

export default function STLViewer({ fileUrl, fileName, materialType, finishType, onVolumeCalculated }: STLViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const frameIdRef = useRef<number>(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modelInfo, setModelInfo] = useState<{ volume: number; dimensions: { x: number; y: number; z: number } } | null>(null);

  // Initialisation de la scène Three.js
  const initScene = useCallback(() => {
    if (!containerRef.current) return;

    // Scène
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f0f0f);
    sceneRef.current = scene;

    // Caméra
    const camera = new THREE.PerspectiveCamera(
      50,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      10000
    );
    camera.position.set(0, 0, 100);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Contrôles OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.enablePan = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.0;
    controlsRef.current = controls;

    // Lumières
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(50, 100, 80);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.6);
    fillLight.position.set(-50, 50, -30);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffaf7b, 0.5);
    rimLight.position.set(0, -50, -50);
    scene.add(rimLight);

    // Grille de fond
    const gridHelper = new THREE.GridHelper(200, 20, 0x2a2a2a, 0x1a1a1a);
    gridHelper.rotation.x = Math.PI / 2;
    gridHelper.position.z = -50;
    scene.add(gridHelper);

    // Animation loop
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Gestion du resize
    const handleResize = () => {
      if (!containerRef.current || !camera || !renderer) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Chargement du modèle 3D avec authentification
  const loadModel = useCallback(async () => {
    if (!fileUrl || !sceneRef.current) return;

    setLoading(true);
    setError(null);

    // Supprimer l'ancien mesh si présent
    if (meshRef.current) {
      sceneRef.current.remove(meshRef.current);
      meshRef.current.geometry.dispose();
      (meshRef.current.material as THREE.Material).dispose();
    }

    try {
      // Récupérer le token depuis localStorage
      const token = localStorage.getItem('lecreuset_token');
      
      // Fetch le fichier avec le token d'authentification
      const response = await fetch(fileUrl, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      
      const isSTL = fileName?.toLowerCase().endsWith('.stl') ?? true;
      let geometry: THREE.BufferGeometry;

      if (isSTL) {
        const loader = new STLLoader();
        geometry = loader.parse(arrayBuffer);
      } else {
        // Pour OBJ, on doit convertir en texte
        const text = new TextDecoder().decode(arrayBuffer);
        const loader = new OBJLoader();
        const obj = loader.parse(text);
        
        // Récupérer la première géométrie de l'OBJ
        let geo: THREE.BufferGeometry | null = null;
        obj.traverse((child) => {
          if (child instanceof THREE.Mesh && !geo) {
            geo = child.geometry;
          }
        });
        if (!geo) throw new Error('Aucune géométrie trouvée dans le fichier OBJ');
        geometry = geo;
      }

      // Centrer la géométrie
      geometry.center();
      geometry.computeVertexNormals();

      // Calculer volume et dimensions
      const volume = calculateVolume(geometry);
      const dimensions = calculateDimensions(geometry);
      setModelInfo({ volume, dimensions });
      onVolumeCalculated?.(volume, dimensions);

      // Créer le matériau
      const config = MATERIAL_CONFIG[materialType] || MATERIAL_CONFIG['or-jaune'];
      const material = new THREE.MeshStandardMaterial({
        color: config.color,
        metalness: config.metalness,
        roughness: finishType === 'poli' ? 0.1 : 0.4,
        envMapIntensity: 1.0,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      sceneRef.current.add(mesh);
      meshRef.current = mesh;

      // Ajuster la caméra selon la taille du modèle
      const box = new THREE.Box3().setFromObject(mesh);
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const fov = cameraRef.current?.fov || 50;
      const cameraDistance = maxDim / (2 * Math.tan((fov * Math.PI) / 360));
      
      if (cameraRef.current) {
        cameraRef.current.position.set(0, 0, cameraDistance * 2);
        cameraRef.current.lookAt(0, 0, 0);
      }
      
      if (controlsRef.current) {
        controlsRef.current.target.set(0, 0, 0);
        controlsRef.current.update();
      }

    } catch (err) {
      console.error('Error loading 3D model:', err);
      setError(err instanceof Error ? err.message : 'Impossible de charger le fichier 3D.');
    } finally {
      setLoading(false);
    }
  }, [fileUrl, fileName, materialType, finishType, onVolumeCalculated]);

  // Mise à jour du matériau quand le type change
  useEffect(() => {
    if (!meshRef.current) return;
    
    const config = MATERIAL_CONFIG[materialType] || MATERIAL_CONFIG['or-jaune'];
    const material = meshRef.current.material as THREE.MeshStandardMaterial;
    material.color.setHex(config.color);
    material.metalness = config.metalness;
    material.roughness = finishType === 'poli' ? 0.1 : 0.4;
  }, [materialType, finishType]);

  // Initialiser la scène
  useEffect(() => {
    const cleanup = initScene();
    return () => {
      cleanup?.();
      if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current);
      rendererRef.current?.dispose();
    };
  }, [initScene]);

  // Charger le modèle quand l'URL change
  useEffect(() => {
    loadModel();
  }, [loadModel]);

  // Contrôles du viewer
  const handleResetView = () => {
    if (controlsRef.current && cameraRef.current && meshRef.current) {
      const box = new THREE.Box3().setFromObject(meshRef.current);
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const fov = cameraRef.current.fov;
      const cameraDistance = maxDim / (2 * Math.tan((fov * Math.PI) / 360));
      
      cameraRef.current.position.set(0, 0, cameraDistance * 2);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  };

  const handleZoomIn = () => {
    if (cameraRef.current) {
      cameraRef.current.position.multiplyScalar(0.8);
    }
  };

  const handleZoomOut = () => {
    if (cameraRef.current) {
      cameraRef.current.position.multiplyScalar(1.2);
    }
  };

  const config = MATERIAL_CONFIG[materialType] || MATERIAL_CONFIG['or-jaune'];

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full bg-secondary-950 rounded-sm" />
      
      {/* Contrôles du viewer */}
      <div className="absolute bottom-4 right-4 flex gap-2">
        <button
          onClick={handleZoomIn}
          className="p-2 bg-secondary-800/80 hover:bg-secondary-700 text-secondary-300 hover:text-white rounded-lg backdrop-blur-md transition-colors"
          title="Zoom +"
        >
          <ZoomIn size={18} />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 bg-secondary-800/80 hover:bg-secondary-700 text-secondary-300 hover:text-white rounded-lg backdrop-blur-md transition-colors"
          title="Zoom -"
        >
          <ZoomOut size={18} />
        </button>
        <button
          onClick={handleResetView}
          className="p-2 bg-secondary-800/80 hover:bg-secondary-700 text-secondary-300 hover:text-white rounded-lg backdrop-blur-md transition-colors"
          title="Réinitialiser la vue"
        >
          <RotateCcw size={18} />
        </button>
        <button
          onClick={() => controlsRef.current && (controlsRef.current.autoRotate = !controlsRef.current.autoRotate)}
          className="p-2 bg-secondary-800/80 hover:bg-secondary-700 text-secondary-300 hover:text-white rounded-lg backdrop-blur-md transition-colors"
          title="Toggle rotation auto"
        >
          <Maximize2 size={18} />
        </button>
      </div>

      {/* Informations du modèle */}
      {modelInfo && fileName && (
        <div className="absolute top-4 left-4 bg-secondary-900/90 backdrop-blur-md p-4 rounded-lg border border-secondary-800 text-xs text-secondary-400 shadow-2xl max-w-[220px]">
          <div className="flex items-center gap-3 mb-3 pb-3 border-b border-secondary-800">
            <div 
              className="w-4 h-4 rounded-full shadow-sm shrink-0" 
              style={{ backgroundColor: `#${config.color.toString(16).padStart(6, '0')}` }}
            />
            <span className="font-bold text-white text-sm truncate">{fileName}</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-secondary-500">Volume:</span>
              <span className="text-white font-medium">{modelInfo.volume.toFixed(2)} cm³</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary-500">Masse estimée:</span>
              <span className="text-white font-medium">~{(modelInfo.volume * config.density).toFixed(1)}g</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary-500">Dimensions:</span>
              <span className="text-white font-medium text-[10px]">
                {modelInfo.dimensions.x} × {modelInfo.dimensions.y} × {modelInfo.dimensions.z} mm
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Loader */}
      {loading && (
        <div className="absolute inset-0 bg-secondary-950/80 flex items-center justify-center backdrop-blur-sm">
          <div className="text-center">
            <Loader2 className="animate-spin text-primary-500 mx-auto mb-3" size={48} />
            <p className="text-secondary-300 font-medium">Chargement du modèle 3D...</p>
          </div>
        </div>
      )}

      {/* Erreur */}
      {error && (
        <div className="absolute inset-0 bg-secondary-950/80 flex items-center justify-center backdrop-blur-sm">
          <div className="text-center p-6 max-w-sm">
            <p className="text-red-400 font-medium">{error}</p>
            <p className="text-secondary-500 text-sm mt-2">Vérifiez que le fichier est un modèle 3D valide.</p>
          </div>
        </div>
      )}
    </div>
  );
}
