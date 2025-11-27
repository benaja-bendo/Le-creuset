import { useState, useEffect, useRef } from 'react';
import { Box, RefreshCw, Upload, X } from 'lucide-react';
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

// --- 3D Viewer Component ---

const ThreeViewer = ({ materialType, finishType }: { materialType: string, finishType: string }) => {
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

    // Basic Simulation of Materials
    switch(materialType) {
      case 'or-jaune':
        material.color.setHex(0xFFD700);
        material.metalness = 1.0;
        material.roughness = finishType === 'poli' ? 0.1 : 0.4;
        break;
      case 'or-rose':
        material.color.setHex(0xE0BFB8); // Rose gold-ish
        material.metalness = 1.0;
        material.roughness = finishType === 'poli' ? 0.1 : 0.4;
        break;
      case 'argent':
        material.color.setHex(0xC0C0C0);
        material.metalness = 1.0;
        material.roughness = finishType === 'poli' ? 0.15 : 0.5;
        break;
      case 'bronze':
        material.color.setHex(0xCD7F32);
        material.metalness = 1.0;
        material.roughness = finishType === 'poli' ? 0.3 : 0.6;
        break;
      case 'resine':
        material.color.setHex(0x3b82f6);
        material.metalness = 0.0;
        material.roughness = 0.5;
        break;
      default:
        break;
    }
  }, [materialType, finishType]);

  return <div ref={containerRef} className="w-full h-full bg-secondary-900 rounded-sm shadow-inner" />;
};

export default function Quote() {
  const [step, setStep] = useState(1); // 1: Upload, 2: Config
  const [file, setFile] = useState<{name: string, size: string} | null>(null);
  const [material, setMaterial] = useState('or-jaune');
  const [finish, setFinish] = useState('poli');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

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
    let basePrice = 50; // Frais fixes
    // Simulate volume based price
    switch(material) {
      case 'or-jaune': basePrice += 450; break;
      case 'or-rose': basePrice += 460; break;
      case 'argent': basePrice += 80; break;
      case 'bronze': basePrice += 60; break;
      case 'resine': basePrice += 30; break;
    }
    if (finish === 'poli') basePrice += 40;
    return basePrice;
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
                className="text-center p-10 border-2 border-dashed border-secondary-700 hover:border-primary-600 rounded-lg transition-colors cursor-pointer group w-full max-w-md mx-auto"
                onClick={handleUpload}
              >
                {isAnalyzing ? (
                  <div className="flex flex-col items-center animate-pulse">
                    <RefreshCw className="animate-spin text-primary-500 mb-4" size={48} />
                    <p className="text-secondary-400">Analyse de la géométrie...</p>
                    <p className="text-secondary-600 text-xs mt-2">Calcul du volume et des surfaces</p>
                  </div>
                ) : (
                  <>
                    <div className="w-20 h-20 bg-secondary-800 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                      <Upload className="text-secondary-400 group-hover:text-primary-500" size={32} />
                    </div>
                    <h3 className="text-xl text-white font-medium mb-2">Déposez votre fichier 3D</h3>
                    <p className="text-secondary-500 mb-6">Format .STL ou .OBJ supporté</p>
                    <Button variant="outline" className="mx-auto">Sélectionner un fichier</Button>
                  </>
                )}
              </div>
            ) : (
              <div className="w-full h-full relative">
                <ThreeViewer materialType={material} finishType={finish} />
                <div className="absolute top-4 left-4 bg-secondary-900/80 backdrop-blur p-3 rounded border border-secondary-800 text-xs text-secondary-300">
                  <div className="flex items-center gap-2 mb-1">
                    <Box className="text-primary-500" size={12} />
                    <span className="font-bold text-white">{file?.name}</span>
                  </div>
                  <p>Volume: 1.45 cm³</p>
                  <p>Dimensions: 22 x 18 x 6 mm</p>
                </div>
                <button 
                  onClick={() => setStep(1)} 
                  className="absolute top-4 right-4 text-secondary-500 hover:text-white bg-secondary-900/50 p-2 rounded"
                >
                  <X size={20} />
                </button>
              </div>
            )}
          </div>

          {/* Right: Configuration Panel */}
          <div className="w-full md:w-1/3 p-8 bg-secondary-900 flex flex-col">
            <div className="mb-8">
              <h3 className="text-primary-500 text-xs font-bold tracking-widest uppercase mb-4">Configuration</h3>
              
              {/* Material Selector */}
              <div className="mb-6">
                <label className="block text-sm text-secondary-300 mb-3">Matériau</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'or-jaune', label: 'Or Jaune 18k', color: 'bg-yellow-500' },
                    { id: 'or-rose', label: 'Or Rose 18k', color: 'bg-pink-400' },
                    { id: 'argent', label: 'Argent 925', color: 'bg-gray-300' },
                    { id: 'bronze', label: 'Bronze', color: 'bg-orange-700' },
                    { id: 'resine', label: 'Proto Résine', color: 'bg-blue-500' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setMaterial(m.id)}
                      className={`p-3 rounded border text-left transition-all flex items-center gap-3 ${
                        material === m.id 
                        ? 'border-primary-500 bg-secondary-800 text-white ring-1 ring-primary-500/50' 
                        : 'border-secondary-700 text-secondary-400 hover:border-secondary-600 bg-secondary-950/50'
                      } ${step === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={step === 1}
                    >
                      <div className={`w-4 h-4 rounded-full ${m.color} shadow-sm`}></div>
                      <span className="text-xs font-medium">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Finish Selector */}
              <div className="mb-6">
                <label className="block text-sm text-secondary-300 mb-3">Finition</label>
                <div className="flex gap-3">
                  {[
                    { id: 'brut', label: 'Brut de fonte' },
                    { id: 'poli', label: 'Poli miroir' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setFinish(f.id)}
                      className={`flex-1 py-2 px-4 rounded border text-xs font-medium transition-all ${
                        finish === f.id 
                        ? 'border-primary-500 bg-secondary-800 text-white' 
                        : 'border-secondary-700 text-secondary-400 hover:border-secondary-600 bg-secondary-950/50'
                      } ${step === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={step === 1}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Pricing Footer */}
            <div className="mt-auto border-t border-secondary-800 pt-6">
              <div className="flex justify-between items-end mb-6">
                <div className="text-secondary-400 text-sm">Estimation HT</div>
                <div className="text-3xl font-serif text-white flex items-center">
                  {step === 1 ? (
                    <span className="text-secondary-600">--,-- €</span>
                  ) : (
                    <span className="animate-in fade-in">{calculatePrice()},00 €</span>
                  )}
                </div>
              </div>
              
              <Button 
                variant="primary" 
                className="w-full" 
                disabled={step === 1}
              >
                Commander cette pièce
              </Button>
              <p className="text-xs text-secondary-600 text-center mt-4">
                Délai estimé : 5 à 7 jours ouvrés.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
