import { useState, useEffect, useRef } from 'react';
import { Box, Upload, X, AlertCircle } from 'lucide-react';
import * as THREE from 'three';

// --- Components ---

const Button = ({ children, variant = 'primary', onClick, className = '', disabled = false }: any) => {
  const baseStyle = "px-6 py-3 transition-all duration-300 font-medium tracking-wide text-sm uppercase flex items-center justify-center gap-2 rounded-sm";
  const variants: any = {
    primary: "bg-primary-600 text-white hover:bg-primary-700 hover:shadow-lg hover:shadow-primary-900/20 disabled:bg-secondary-700 disabled:text-secondary-500",
    outline: "border border-secondary-400 text-secondary-300 hover:border-primary-500 hover:text-primary-500",
    ghost: "text-secondary-400 hover:text-primary-500",
    success: "bg-emerald-600 text-white hover:bg-emerald-700"
  };
  return (
    <button onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

const SectionTitle = ({ title, subtitle }: { title: string, subtitle: string }) => (
  <div className="mb-12 text-center">
    <span className="text-primary-500 text-xs font-bold tracking-widest uppercase mb-2 block">
      {subtitle}
    </span>
    <h2 className="text-3xl md:text-4xl font-serif text-white">
      {title}
    </h2>
    <div className="w-16 h-0.5 bg-primary-600 mx-auto mt-6"></div>
  </div>
);

// Configuration des matériaux avec densité pour l'estimation publique
const MATERIALS = [
  { id: 'OR_JAUNE_375', label: 'Or Jaune 375 (9k)', color: 'bg-yellow-200', pricePerGram: 25, density: 11.0, isService: false },
  { id: 'OR_JAUNE_750', label: 'Or Jaune 750 (18k)', color: 'bg-yellow-500', pricePerGram: 60, density: 15.0, isService: false },
  { id: 'OR_ROSE_375', label: 'Or Rose 375 (9k)', color: 'bg-pink-300', pricePerGram: 25, density: 11.0, isService: false },
  { id: 'OR_ROSE_750', label: 'Or Rose 750 (18k)', color: 'bg-pink-400', pricePerGram: 60, density: 15.0, isService: false },
  { id: 'OR_GRIS_375', label: 'Or Gris 375 (9k)', color: 'bg-gray-300', pricePerGram: 25, density: 11.0, isService: false },
  { id: 'OR_GRIS_750', label: 'Or Gris 750 (18k)', color: 'bg-gray-400', pricePerGram: 60, density: 15.0, isService: false },
  { id: 'OR_GRIS_750_PALLADIE_13', label: 'Or Gris 750 (Palladié)', color: 'bg-gray-200', pricePerGram: 70, density: 15.5, isService: false },
  { id: 'OR_ROUGE_750', label: 'Or Rouge 750 (18k)', color: 'bg-red-400', pricePerGram: 60, density: 15.0, isService: false },
  { id: 'PLATINE_950', label: 'Platine 950', color: 'bg-slate-300', pricePerGram: 45, density: 21.0, isService: false },
  { id: 'ARGENT_925', label: 'Argent 925', color: 'bg-gray-100', pricePerGram: 1.5, density: 10.4, isService: false },
  { id: 'PROTO_VISUEL', label: 'Prototype Visuel', color: 'bg-blue-300', pricePerGram: 0, density: 1.2, isService: true },
  { id: 'IMPRESSION_CIRE', label: 'Impression Cire', color: 'bg-orange-300', pricePerGram: 0, density: 1.0, isService: true },
];

const MATERIAL_CONFIG: Record<string, { color: number; metalness: number; roughness: number }> = {
  'OR_JAUNE_375': { color: 0xF7E2A3, metalness: 1.0, roughness: 0.1 },
  'OR_JAUNE_750': { color: 0xFFD700, metalness: 1.0, roughness: 0.1 },
  'OR_ROSE_375': { color: 0xEDB8A8, metalness: 1.0, roughness: 0.1 },
  'OR_ROSE_750': { color: 0xE0BFB8, metalness: 1.0, roughness: 0.1 },
  'OR_GRIS_375': { color: 0xCccccc, metalness: 1.0, roughness: 0.1 },
  'OR_GRIS_750': { color: 0xDCDCDC, metalness: 1.0, roughness: 0.1 },
  'OR_GRIS_750_PALLADIE_13': { color: 0xE0E0E0, metalness: 1.0, roughness: 0.1 },
  'OR_ROUGE_750': { color: 0xD4A373, metalness: 1.0, roughness: 0.1 },
  'PLATINE_950': { color: 0xE5E4E2, metalness: 1.0, roughness: 0.1 },
  'PALLADIUM': { color: 0xCED0DD, metalness: 1.0, roughness: 0.1 },
  'ARGENT_925': { color: 0xC0C0C0, metalness: 1.0, roughness: 0.15 },
  'PROTO_VISUEL': { color: 0x3b82f6, metalness: 0.1, roughness: 0.5 },
  'IMPRESSION_CIRE': { color: 0xFF5733, metalness: 0.0, roughness: 0.5 },
};

// --- 3D Viewer Component ---

const ThreeViewer = ({ materialType }: { materialType: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const rendererRef = useRef<THREE.WebGLRenderer>(null);
  const sceneRef = useRef<THREE.Scene>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const frameIdRef = useRef<number>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1c1917); // secondary-900

    const camera = new THREE.PerspectiveCamera(50, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);

    // Geometry (Placeholder for uploaded STL - TorusKnot looks like jewelry)
    const geometry = new THREE.TorusKnotGeometry(1.2, 0.4, 100, 16);
    const material = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 1, roughness: 0.2 });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    meshRef.current = mesh;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0xffffff, 1);
    pointLight1.position.set(5, 5, 5);
    scene.add(pointLight1);
    
    const pointLight2 = new THREE.PointLight(0xffaf7b, 0.8); // Warm light
    pointLight2.position.set(-5, -5, 5);
    scene.add(pointLight2);

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;

    // Animation Loop
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);
      if (mesh) {
        mesh.rotation.x += 0.005;
        mesh.rotation.y += 0.01;
      }
      renderer.render(scene, camera);
    };
    animate();

    // Handle Resize
    const handleResize = () => {
      if (!containerRef.current || !camera || !renderer) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current);
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      // Dispose geometries and materials to avoid memory leaks
      geometry.dispose();
      material.dispose();
    };
  }, []);

  // Update Material when props change
  useEffect(() => {
    if (!meshRef.current) return;
    const material = meshRef.current.material as THREE.MeshStandardMaterial;

    const config = MATERIAL_CONFIG[materialType] || MATERIAL_CONFIG['OR_JAUNE_750'];
    material.color.setHex(config.color);
    material.metalness = config.metalness;
    material.roughness = config.roughness;
  }, [materialType]);

  return <div ref={containerRef} className="w-full h-full bg-secondary-900 rounded-sm shadow-inner" />;
};

export default function Quote() {
  const [step, setStep] = useState(1); // 1: Upload, 2: Config
  const [file, setFile] = useState<{name: string, size: string} | null>(null);
  const [material, setMaterial] = useState('OR_JAUNE_750');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Mocking file upload from the previous version
  const handleUpload = () => {
    setIsAnalyzing(true);
    // Simulate upload and analysis delay
    setTimeout(() => {
      setFile({ name: "mon-bijou-creation.stl", size: "12 MB" });
      setIsAnalyzing(false);
      setStep(2);
    }, 1500);
  };

  const calculatePrice = () => {
    const mat = MATERIALS.find(m => m.id === material);
    if (!mat) return null;

    // Mock volume of 1.45 cm³ for demonstration in public view
    const mockVolume = 1.45;
    const quantity = 1;

    if (mat.isService) {
        const serviceBasePrice = mat.id === 'PROTO_VISUEL' ? 30 : 40;
        return Math.round(serviceBasePrice * quantity + (mockVolume * 2));
    }

    const weight = mockVolume * mat.density; // grammes
    const materialCost = weight * mat.pricePerGram;
    const laborCost = 50; // Forfait main d'œuvre
    
    return Math.round((materialCost + laborCost) * quantity);
  };

  return (
    <div className="pt-32 pb-16 min-h-screen bg-secondary-950">
      <div className="container mx-auto px-4 h-full">
        <SectionTitle title="Devis Instantané" subtitle="Votre projet en quelques clics" />

        <div className="max-w-6xl mx-auto bg-secondary-900 border border-secondary-800 shadow-2xl overflow-hidden rounded-sm flex flex-col md:flex-row min-h-[600px]">
          
          {/* Left: Viewer Area */}
          <div className="w-full md:w-2/3 bg-black relative flex items-center justify-center border-b md:border-b-0 md:border-r border-secondary-800">
            {step === 1 ? (
              <div 
                className="text-center p-10 border-2 border-dashed border-secondary-700 hover:border-primary-600 rounded-lg transition-colors cursor-pointer group w-full max-w-md mx-auto relative overflow-hidden"
                onClick={handleUpload}
              >
                {/* Visual feedback for mock action */}
                <div className="absolute top-0 right-0 bg-primary-600 text-white text-[10px] px-2 py-1 uppercase font-bold tracking-widest rounded-bl-lg">Démo</div>

                {isAnalyzing ? (
                   <div className="flex flex-col items-center">
                   <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mb-4"></div>
                   <p className="text-secondary-300 font-medium tracking-wide">Analyse du modèle...</p>
                   <p className="text-secondary-500 text-xs mt-2 uppercase">Calcul des dimensions</p>
                 </div>
                ) : (
                  <>
                    <div className="w-20 h-20 bg-secondary-800 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary-900/40 group-hover:scale-110 transition-all border border-secondary-700">
                      <Upload className="text-secondary-400 group-hover:text-primary-500" size={32} />
                    </div>
                    <h3 className="text-xl text-white font-medium mb-2">Déposez votre fichier 3D</h3>
                    <p className="text-secondary-500 mb-6">Testez l'estimation avec un fichier de démonstration</p>
                    <Button variant="outline" className="mx-auto text-secondary-300 hover:text-primary-500 border-secondary-600">Essayer la démo</Button>
                  </>
                )}
              </div>
            ) : (
              <div className="w-full h-full relative">
                <ThreeViewer materialType={material} />
                <div className="absolute top-4 left-4 bg-secondary-900/80 backdrop-blur p-3 rounded border border-secondary-800 text-xs text-secondary-300">
                  <div className="flex items-center gap-2 mb-1">
                    <Box className="text-primary-500" size={12} />
                    <span className="font-bold text-white">{file?.name}</span>
                  </div>
                  <p>Volume: 1.45 cm³</p>
                  <p>Dimensions: 22 x 18 x 6 mm</p>
                  <p className="text-primary-500 mt-1 uppercase tracking-widest text-[9px]">Aperçu Démo</p>
                </div>
                <button 
                  onClick={() => setStep(1)} 
                  className="absolute top-4 right-4 text-secondary-500 hover:text-white bg-secondary-900/50 hover:bg-secondary-800 p-2 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            )}
          </div>

          {/* Right: Configuration Panel */}
          <div className="w-full md:w-1/3 p-4 md:p-8 bg-secondary-900 flex flex-col overflow-y-auto max-h-[800px]">
            <div className="mb-8">
              <h3 className="text-primary-500 text-xs font-bold tracking-widest uppercase mb-4 flex items-center gap-2">
                <div className="w-4 h-px bg-primary-500"></div>
                Configuration
              </h3>
              
              {/* Material Selector */}
              <div className="mb-6">
                <label className="block text-sm text-secondary-400 mb-3">Matériau / Service</label>
                <div className="grid grid-cols-1 gap-2">
                  {MATERIALS.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setMaterial(m.id)}
                      className={`p-2 xl:p-3 rounded border text-left transition-all flex items-center gap-3 ${
                        material === m.id 
                        ? 'border-primary-500 bg-secondary-800 text-white ring-1 ring-primary-500/50' 
                        : 'border-secondary-700 text-secondary-400 hover:border-secondary-600 bg-secondary-950/50'
                      } ${step === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={step === 1}
                    >
                      <div className={`w-3 h-3 rounded-full ${m.color} shadow-sm border border-secondary-800/50 shrink-0`}></div>
                      <span className="text-[10px] xl:text-xs font-medium uppercase tracking-tight truncate">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Pricing Footer */}
            <div className="mt-auto border-t border-secondary-800 pt-6">
              <div className="flex justify-between items-end mb-6">
                <div className="text-secondary-400 text-[10px] font-bold tracking-widest uppercase">Estimation HT</div>
                <div className="text-3xl font-serif text-white flex items-center">
                  {step === 1 ? (
                    <span className="text-secondary-700">--,-- €</span>
                  ) : (
                    <span className="animate-in fade-in">{calculatePrice()},00 €</span>
                  )}
                </div>
              </div>
              
              {/* Le bouton d'action principal redirige vers le processus de contact/compte */}
              <a href="/login" className="block w-full">
                <Button 
                  variant="primary" 
                  className="w-full" 
                  disabled={step === 1}
                >
                  Envoyer ma demande
                </Button>
              </a>
              <div className="flex flex-col items-center justify-center gap-1 mt-4 text-[10px] text-secondary-500 uppercase font-bold tracking-tighter text-center leading-tight">
                <div className="flex items-center gap-1 text-primary-500">
                    <AlertCircle size={12} className="shrink-0" />
                    Estimation indicative
                </div>
                 <span>Nécessite la création d'un compte professionnel pour confirmer la commande.</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
