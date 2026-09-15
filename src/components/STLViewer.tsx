import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { STLLoader } from 'three-stdlib';
import { OBJLoader } from 'three-stdlib';
import { OrbitControls } from 'three-stdlib';
import { Loader2, RotateCcw, ZoomIn, ZoomOut, Maximize2, Shrink, Play, AlertTriangle } from 'lucide-react';
import ErrorBoundary from './ErrorBoundary';

interface STLViewerProps {
  fileUrl: string | null;
  fileName: string | null;
  materialType: string;
  finishType: string;
  onVolumeCalculated?: (volume: number, dimensions: { x: number; y: number; z: number }) => void;
}

type MaterialConfig = {
  color: number;
  metalness: number;
  roughness: number;
  density: number;
  isService?: boolean;
};

/**
 * Budget lumineux du viewer.
 *
 * La refonte d'août avait assombri les albédos (`MATERIAL_CONFIG` ci-dessous)
 * mais délibérément laissé le pipeline d'éclairage intact pour ne pas changer
 * l'apparence des 5 écrans qui utilisent le viewer. Insuffisant : à ce niveau
 * d'exposition (2.5) cumulé à l'intensité d'environnement (1.5),
 * l'`envMapIntensity` du matériau (2.0) et ~7.5 d'intensité directionnelle
 * cumulée, les métaux clairs (argent, platine, or gris) saturaient quand même
 * en blanc — un albédo plus sombre ne change rien si la lumière qui le porte
 * est elle-même saturante.
 *
 * Un premier passage s'est contenté de baisser ces multiplicateurs (~moitié
 * sur les 4 à la fois). Insuffisant dans l'autre sens : à `metalness: 0.9`
 * un métal reflète presque exclusivement l'environnement — la baisse
 * uniforme assombrissait tout au lieu de faire ressortir la couleur, et
 * `RoomEnvironment` (three-stdlib) baigne l'objet d'une lumière blanche
 * plate et peu contrastée (panneaux 17 à 100 de la même teinte, un point
 * light à 900) : bien pour du mobilier, pas pour un bijou qui doit accrocher
 * la lumière sous plusieurs angles distincts.
 *
 * D'où `createJewelryStudioEnvironment()` ci-dessous, qui remplace
 * `RoomEnvironment` : quelques panneaux à fort contraste, positionnés comme
 * un studio bijouterie (deux clés à ~45°, un fill zénithal doux, un rim
 * arrière) plutôt qu'un éclairage plat isotrope — cf. les conventions du
 * secteur (rendu bijouterie : contraste fort avec lumière neutre, jamais un
 * flat light). Avec un environnement qui porte déjà le contraste,
 * l'exposition globale peut remonter sans re-saturer les métaux clairs.
 *
 * Le laiton (`LAITON`), seule référence validée par le client, sert de
 * repère : il doit rester reconnaissable, même s'il n'est plus garanti
 * identique au pixel — l'ancien réglage ne peut pas survivre tel quel à la
 * fois pour lui et pour les métaux clairs.
 */
const TONE_MAPPING_EXPOSURE = 1.8;
const ENVIRONMENT_INTENSITY = 1.3;
const MATERIAL_ENV_MAP_INTENSITY = 1.5;
const AMBIENT_LIGHT_INTENSITY = 0.5;
const KEY_LIGHT_INTENSITY = 1.6;
const FILL_LIGHT_INTENSITY = 0.9;
const BACK_LIGHT_INTENSITY = 1.1;
const RIM_LIGHT_INTENSITY = 0.7;

/**
 * Environnement de studio dédié, en remplacement de `RoomEnvironment`
 * (three-stdlib). Même technique — une scène de panneaux émissifs baked en
 * PMREM via `PMREMGenerator.fromScene()`, cf. la source de `RoomEnvironment`
 * — mais disposition et contraste pensés pour un petit objet réfléchissant
 * (bijou) plutôt que pour du mobilier : deux lumières clés à 45° d'intensité
 * inégale (asymétrie clé/remplissage classique en photo produit) pour que la
 * courbure de la pièce accroche la lumière à plusieurs endroits distincts au
 * lieu d'un unique point chaud, un fill zénithal doux, un rim arrière pour
 * détacher la silhouette, et un léger rebond au sol pour ne pas laisser le
 * dessous du bijou totalement noir.
 */
function createJewelryStudioEnvironment(): THREE.Scene {
  const scene = new THREE.Scene();

  const geometry = new THREE.BoxGeometry();
  geometry.deleteAttribute('uv');

  const createPanel = (intensity: number, color = 0xffffff) =>
    new THREE.MeshLambertMaterial({ color: 0x000000, emissive: color, emissiveIntensity: intensity });

  // Enceinte englobante : sert surtout à donner à l'environnement un
  // "extérieur" cohérent (murs sombres neutres) pour que les zones hors
  // panneaux ne soient pas un vide, comme dans RoomEnvironment.
  const room = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: 0x1a1a1a, side: THREE.BackSide }));
  room.scale.set(40, 40, 40);
  scene.add(room);

  // Clé principale à 45°, avant-gauche-haut — la plus intense, warm-neutre.
  const key = new THREE.Mesh(geometry, createPanel(90, 0xfff2df));
  key.position.set(-11, 10, 9);
  key.scale.set(6, 8, 0.2);
  key.lookAt(0, 0, 0);
  scene.add(key);

  // Clé secondaire à 45°, avant-droit-haut — plus faible que la clé
  // principale (asymétrie clé/remplissage), légèrement plus froide.
  const fillKey = new THREE.Mesh(geometry, createPanel(55, 0xf3f6ff));
  fillKey.position.set(11, 8, 9);
  fillKey.scale.set(6, 7, 0.2);
  fillKey.lookAt(0, 0, 0);
  scene.add(fillKey);

  // Fill zénithal doux : adoucit les ombres, évite que le dessus reste noir
  // entre les deux clés.
  const topFill = new THREE.Mesh(geometry, createPanel(35, 0xffffff));
  topFill.position.set(0, 18, 0);
  topFill.scale.set(14, 0.2, 14);
  scene.add(topFill);

  // Rim arrière : détache la silhouette de l'objet de l'arrière-plan, un
  // classique de la photo produit.
  const rim = new THREE.Mesh(geometry, createPanel(60, 0xf0f4ff));
  rim.position.set(0, 9, -13);
  rim.scale.set(10, 8, 0.2);
  scene.add(rim);

  // Léger rebond au sol, chaud et faible : évite un dessous totalement noir
  // sans recréer un flat light.
  const bounce = new THREE.Mesh(geometry, createPanel(12, 0xfff0dd));
  bounce.position.set(0, -10, 4);
  bounce.scale.set(10, 0.2, 8);
  scene.add(bounce);

  return scene;
}

/**
 * Palette de rendu 3D.
 *
 * À `metalness: 1.0` un MeshPhysicalMaterial n'a plus aucune composante
 * diffuse : sa teinte ne vient que du reflet d'environnement, qui sature en
 * blanc dès que la couleur de base est claire. C'est pourquoi les métaux
 * blancs (argent, platine, or gris) apparaissaient délavés alors que le
 * laiton — seul matériau à 0.9 avec une couleur de base sombre et saturée —
 * rendait correctement.
 *
 * Tous les métaux sont donc alignés sur le traitement du laiton : `metalness`
 * à 0.9 pour conserver un reste de diffus qui porte la teinte, et albédos
 * ramenés à des valeurs de réflectance plausibles (plus sombres et plus
 * saturées).
 *
 * `roughness` devient explicite par matériau au lieu d'être déduit d'un seuil
 * sur `metalness` — mais les valeurs reproduisent exactement celles que
 * l'ancienne formule produisait (0.15 pour les métaux, 0.05 pour les services).
 */
const MATERIAL_CONFIG: Record<string, MaterialConfig> = {
  'OR_JAUNE_375': { color: 0xc9a86a, metalness: 0.9, roughness: 0.15, density: 11.0 },
  'OR_JAUNE_750': { color: 0xd4a72c, metalness: 0.9, roughness: 0.15, density: 15.0 },
  'OR_ROSE_375': { color: 0xc99177, metalness: 0.9, roughness: 0.15, density: 11.0 },
  'OR_ROSE_750': { color: 0xc48a72, metalness: 0.9, roughness: 0.15, density: 15.0 },
  'OR_GRIS_375': { color: 0xb3b5b8, metalness: 0.9, roughness: 0.15, density: 11.0 },
  'OR_GRIS_750': { color: 0xc2c4c6, metalness: 0.9, roughness: 0.15, density: 15.0 },
  'OR_GRIS_750_PALLADIE_13': { color: 0xc8cacb, metalness: 0.9, roughness: 0.15, density: 15.5 },
  'OR_ROUGE_750': { color: 0xb06a52, metalness: 0.9, roughness: 0.15, density: 15.0 },
  'PLATINE_950': { color: 0xb8b4ac, metalness: 0.9, roughness: 0.15, density: 21.0 },
  'PALLADIUM': { color: 0xa8adb2, metalness: 0.9, roughness: 0.15, density: 12.0 },
  'ARGENT_925': { color: 0xcfd2d4, metalness: 0.9, roughness: 0.15, density: 10.4 },
  // Référence validée par le client : ces trois valeurs rendent exactement
  // comme avant la refonte. Ne pas les modifier sans nouvelle validation.
  'LAITON': { color: 0xb5a642, metalness: 0.9, roughness: 0.15, density: 8.5 },
  'PROTO_VISUEL': { color: 0x3b82f6, metalness: 0.0, roughness: 0.05, density: 1.2, isService: true },
  'IMPRESSION_CIRE': { color: 0xff5733, metalness: 0.0, roughness: 0.05, density: 1.0, isService: true },
};

/**
 * Les commandes créées depuis l'admin utilisent une nomenclature différente
 * (`OR_750_JAUNE` au lieu de `OR_JAUNE_750`) et ces valeurs sont déjà en base.
 * Sans ce mappage elles retombent toutes sur l'or jaune 18k par défaut.
 */
const MATERIAL_ALIASES: Record<string, string> = {
  'OR_750_JAUNE': 'OR_JAUNE_750',
  'OR_375_JAUNE': 'OR_JAUNE_375',
  'OR_750_ROSE': 'OR_ROSE_750',
  'OR_375_ROSE': 'OR_ROSE_375',
  'OR_750_GRIS': 'OR_GRIS_750',
  'OR_375_GRIS': 'OR_GRIS_375',
  'OR_750_PALLADIE_13': 'OR_GRIS_750_PALLADIE_13',
  'OR_750_ROUGE': 'OR_ROUGE_750',
  'PROTOTYPE_RESINE': 'IMPRESSION_CIRE',
};

export function resolveMaterial(materialType: string): MaterialConfig {
  const key = MATERIAL_ALIASES[materialType] ?? materialType;
  return MATERIAL_CONFIG[key] || MATERIAL_CONFIG['OR_JAUNE_750'];
}

/** La rugosité par matériau ne s'applique qu'au fini poli ; le fini brut reste uniforme. */
export function resolveRoughness(config: MaterialConfig, finishType: string): number {
  return finishType === 'poli' ? config.roughness : 0.4;
}

/**
 * Calcule le volume d'une géométrie en cm³
 */
export function calculateVolume(geometry: THREE.BufferGeometry): number {
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
export function calculateDimensions(geometry: THREE.BufferGeometry): { x: number; y: number; z: number } {
  geometry.computeBoundingBox();
  const bb = geometry.boundingBox;
  if (!bb) return { x: 0, y: 0, z: 0 };

  return {
    x: Math.round((bb.max.x - bb.min.x) * 100) / 100,
    y: Math.round((bb.max.y - bb.min.y) * 100) / 100,
    z: Math.round((bb.max.z - bb.min.z) * 100) / 100,
  };
}

function STLViewerCanvas({ fileUrl, fileName, materialType, finishType, onVolumeCalculated }: STLViewerProps) {
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
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Lu par loadModel() pour le matériau initial, sans figurer dans ses
  // dépendances : le changement de matériau est déjà géré à chaud par le
  // useEffect plus bas (mutation du mesh existant), et ne doit jamais
  // redéclencher un rechargement complet du fichier. Les refs se mettent à
  // jour à chaque rendu, pas besoin d'effet dédié.
  const materialTypeRef = useRef(materialType);
  const finishTypeRef = useRef(finishType);
  materialTypeRef.current = materialType;
  finishTypeRef.current = finishType;

  // Pour bloquer le défilement du body quand en plein écran
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isFullscreen]);

  // Initialisation de la scène Three.js
  //
  // Tout ce bloc tourne dans un useEffect, hors du try/catch de loadModel :
  // sans son propre try/catch, une erreur ici (WebGL indisponible, contexte
  // refusé par le pilote graphique...) remonterait telle quelle jusqu'au
  // routeur et remplacerait toute la page par l'écran d'erreur générique. Le
  // ErrorBoundary autour de STLViewer rattrape aussi ce cas, mais afficher
  // le message d'erreur existant du composant est plus informatif.
  const initScene = useCallback(() => {
    if (!containerRef.current) return;

    try {
    // Scène
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xfafafa);

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
    renderer.toneMappingExposure = TONE_MAPPING_EXPOSURE;
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // N'assigner sceneRef qu'une fois le renderer WebGL obtenu avec succès :
    // `loadModel` teste `!sceneRef.current` pour savoir si la scène est
    // utilisable. Si `WebGLRenderer` avait jeté et que sceneRef pointait déjà
    // vers cette scène orpheline, loadModel continuerait quand même —
    // parsant le fichier et calculant volume/dimensions avec succès dans un
    // panneau d'infos sans aucun rendu visible, en écrasant au passage le
    // message d'erreur ci-dessous via son propre `setError(null)`.
    sceneRef.current = scene;

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    
    // Environnement pour les reflets métalliques
    scene.environment = pmremGenerator.fromScene(createJewelryStudioEnvironment(), 0.04).texture;
    scene.environmentIntensity = ENVIRONMENT_INTENSITY;

    // Contrôles OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.enablePan = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.5;
    controlsRef.current = controls;

    // Lumières - setup studio
    const ambientLight = new THREE.AmbientLight(0xffffff, AMBIENT_LIGHT_INTENSITY);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, KEY_LIGHT_INTENSITY);
    keyLight.position.set(50, 100, 80);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.bias = -0.0001;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xfff0dd, FILL_LIGHT_INTENSITY);
    fillLight.position.set(-50, 50, -30);
    scene.add(fillLight);

    const backLight = new THREE.DirectionalLight(0xffffff, BACK_LIGHT_INTENSITY);
    backLight.position.set(0, 50, -100);
    scene.add(backLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, RIM_LIGHT_INTENSITY);
    rimLight.position.set(0, -50, 50);
    scene.add(rimLight);

    // Grille de fond subtile
    const gridHelper = new THREE.GridHelper(200, 20, 0xd4d4d4, 0xe5e5e5);
    gridHelper.rotation.x = Math.PI / 2;
    gridHelper.position.z = -50;
    gridHelper.material.opacity = 0.5;
    gridHelper.material.transparent = true;
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
    } catch (err) {
      // Le message brut (souvent minifié en prod, ex. "e is not a
      // function" pour un échec de création de contexte WebGL) n'est pas
      // exploitable par l'utilisateur — seule la console le garde, pour le
      // diagnostic.
      console.error('Error initializing 3D scene:', err);
      setError("Impossible d'initialiser le rendu 3D sur cet appareil ou ce navigateur.");
      return undefined;
    }
  }, []);

  // Chargement du modèle 3D avec authentification
  const loadModel = useCallback(async () => {
    if (!fileUrl || !sceneRef.current) return;

    setLoading(true);
    setError(null);

    try {
      // Supprimer l'ancien mesh si présent — à l'intérieur du try : une
      // exception ici (ex. matériau déjà disposé par un chargement
      // concurrent) doit finir en message d'erreur affiché, pas en
      // rejet de promesse non intercepté qui abat toute la page.
      if (meshRef.current) {
        sceneRef.current.remove(meshRef.current);
        meshRef.current.geometry.dispose();
        (meshRef.current.material as THREE.Material).dispose();
        meshRef.current = null;
      }

      // Récupérer le token depuis localStorage
      const token = localStorage.getItem('lagrenaille_token');
      
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

      // Créer le matériau (valeur courante via ref, cf. commentaire plus haut)
      const config = resolveMaterial(materialTypeRef.current);
      const material = new THREE.MeshPhysicalMaterial({
        color: config.color,
        metalness: config.metalness,
        roughness: resolveRoughness(config, finishTypeRef.current),
        clearcoat: 0.0,
        envMapIntensity: MATERIAL_ENV_MAP_INTENSITY,
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
  }, [fileUrl, fileName, onVolumeCalculated]);

  // Mise à jour du matériau quand le type change
  useEffect(() => {
    if (!meshRef.current) return;
    
    const config = resolveMaterial(materialType);
    const material = meshRef.current.material as THREE.MeshPhysicalMaterial;
    material.color.setHex(config.color);
    material.metalness = config.metalness;
    material.roughness = resolveRoughness(config, finishType);
    material.clearcoat = 0.0;
  }, [materialType, finishType]);

  // Resize renderer when container size changes (e.g. fullscreen toggle)
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      rendererRef.current.setSize(width, height);
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
    };

    window.addEventListener('resize', handleResize);
    // Also trigger immediately to handle state change
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, [isFullscreen]);

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

  // Passer par resolveMaterial et pas par MATERIAL_CONFIG directement : sans
  // les alias, une commande créée depuis l'admin (`PROTOTYPE_RESINE`,
  // `OR_750_JAUNE`…) retomberait sur la densité de l'or jaune et le panneau
  // d'infos annoncerait une masse estimée fausse.
  const config = resolveMaterial(materialType);

  return (
    <div className={`relative w-full h-full ${isFullscreen ? 'fixed inset-0 z-[100] bg-white' : ''}`}>
      <div ref={containerRef} className="w-full h-full bg-slate-50 rounded-sm" style={{ touchAction: 'none' }} />
      
      {/* Contrôles du viewer */}
      <div className="absolute bottom-4 right-4 flex gap-2">
        <button
          onClick={handleZoomIn}
          className="p-2 bg-white/80 hover:bg-white text-secondary-500 hover:text-primary-600 rounded-lg backdrop-blur-md transition-colors shadow-sm"
          title="Zoom +"
        >
          <ZoomIn size={18} />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 bg-white/80 hover:bg-white text-secondary-500 hover:text-primary-600 rounded-lg backdrop-blur-md transition-colors shadow-sm"
          title="Zoom -"
        >
          <ZoomOut size={18} />
        </button>
        <button
          onClick={handleResetView}
          className="p-2 bg-white/80 hover:bg-white text-secondary-500 hover:text-primary-600 rounded-lg backdrop-blur-md transition-colors shadow-sm"
          title="Réinitialiser la vue"
        >
          <RotateCcw size={18} />
        </button>
        <button
          onClick={() => controlsRef.current && (controlsRef.current.autoRotate = !controlsRef.current.autoRotate)}
          className="p-2 bg-white/80 hover:bg-white text-secondary-500 hover:text-primary-600 rounded-lg backdrop-blur-md transition-colors shadow-sm"
          title="Toggle rotation auto"
        >
          <Play size={18} />
        </button>
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-2 bg-white/80 hover:bg-white text-secondary-500 hover:text-primary-600 rounded-lg backdrop-blur-md transition-colors shadow-sm"
          title={isFullscreen ? "Quitter le plein écran" : "Plein écran"}
        >
          {isFullscreen ? <Shrink size={18} /> : <Maximize2 size={18} />}
        </button>
      </div>

      {/* Informations du modèle */}
      {modelInfo && fileName && (
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md p-4 rounded-lg border border-secondary-200 text-xs text-secondary-500 shadow-xl max-w-[220px]">
          <div className="flex items-center gap-3 mb-3 pb-3 border-b border-secondary-100">
            <div 
              className="w-4 h-4 rounded-full shadow-sm shrink-0" 
              style={{ backgroundColor: `#${config.color.toString(16).padStart(6, '0')}` }}
            />
            <span className="font-bold text-secondary-900 text-sm truncate">{fileName}</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-secondary-500">Volume:</span>
              <span className="text-secondary-900 font-medium">{modelInfo.volume.toFixed(2)} cm³</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary-500">Masse estimée:</span>
              <span className="text-secondary-900 font-medium">~{(modelInfo.volume * config.density).toFixed(1)}g</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary-500">Dimensions:</span>
              <span className="text-secondary-900 font-medium text-[10px]">
                {modelInfo.dimensions.x} × {modelInfo.dimensions.y} × {modelInfo.dimensions.z} mm
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Loader */}
      {loading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center backdrop-blur-sm">
          <div className="text-center">
            <Loader2 className="animate-spin text-primary-500 mx-auto mb-3" size={48} />
            <p className="text-secondary-600 font-medium">Chargement du modèle 3D...</p>
          </div>
        </div>
      )}

      {/* Erreur */}
      {error && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center backdrop-blur-sm">
          <div className="text-center p-6 max-w-sm">
            <p className="text-red-500 font-medium">{error}</p>
            <p className="text-secondary-500 text-sm mt-2">Vérifiez que le fichier est un modèle 3D valide.</p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Le rendu 3D (three.js/WebGL) reste plus fragile que le reste de l'app —
 * pilote graphique, fichier corrompu, dépendance instable. Sans ce
 * ErrorBoundary, une exception y échappant à `STLViewerCanvas` (ex. dans la
 * boucle `requestAnimationFrame`, hors du try/catch de `loadModel`) remonte
 * jusqu'au routeur et remplace toute la page par l'écran d'erreur générique,
 * au lieu de rester confinée à la vignette de l'aperçu 3D. `key={fileUrl}`
 * force un remontage propre — état d'erreur inclus — quand l'utilisateur
 * dépose un nouveau fichier après un échec.
 */
export default function STLViewer(props: STLViewerProps) {
  return (
    <ErrorBoundary
      key={props.fileUrl ?? 'no-file'}
      fallback={
        <div className="relative w-full h-full bg-slate-50 rounded-sm flex items-center justify-center">
          <div className="text-center p-6 max-w-sm">
            <AlertTriangle className="text-red-500 mx-auto mb-3" size={40} />
            <p className="text-red-500 font-medium">Impossible d'afficher l'aperçu 3D.</p>
            <p className="text-secondary-500 text-sm mt-2">Vérifiez que le fichier est un modèle 3D valide, ou réessayez.</p>
          </div>
        </div>
      }
    >
      <STLViewerCanvas {...props} />
    </ErrorBoundary>
  );
}
