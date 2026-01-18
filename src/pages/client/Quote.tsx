import { useState, useRef, useCallback } from 'react';
import { RefreshCw, Upload, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { uploadFile, postJSON, BASE_URL } from '../../api/client';
import { useNavigate } from 'react-router-dom';
import STLViewer from '../../components/STLViewer';

// Composant bouton (client)
const Button = ({ children, variant = 'primary', onClick, className = '', disabled = false, type = 'button' }: any) => {
  const baseStyle = "px-6 py-3 transition-all duration-300 font-medium tracking-wide text-sm uppercase flex items-center justify-center gap-2 rounded-sm";
  const variants: any = {
    primary: "bg-primary-600 text-white hover:bg-primary-700 hover:shadow-lg hover:shadow-primary-900/20 disabled:bg-secondary-700 disabled:text-secondary-500",
    outline: "border border-secondary-400 text-secondary-300 hover:border-primary-500 hover:text-primary-500",
    ghost: "text-secondary-400 hover:text-primary-500",
    success: "bg-emerald-600 text-white hover:bg-emerald-700"
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

const SectionTitle = ({ title, subtitle }: { title: string, subtitle: string }) => (
  <div className="mb-6">
    <span className="text-primary-600 text-xs font-bold tracking-widest uppercase mb-1 block">
      {subtitle}
    </span>
    <h2 className="text-2xl md:text-3xl font-serif text-secondary-900">
      {title}
    </h2>
  </div>
);

// Configuration des matériaux avec densité pour le calcul du poids
const MATERIALS = [
  { id: 'or-jaune', label: 'Or Jaune 18k', color: 'bg-yellow-500', pricePerGram: 60, density: 19.3 },
  { id: 'or-rose', label: 'Or Rose 18k', color: 'bg-pink-400', pricePerGram: 60, density: 18.5 },
  { id: 'argent', label: 'Argent 925', color: 'bg-gray-300', pricePerGram: 1.5, density: 10.5 },
  { id: 'bronze', label: 'Bronze', color: 'bg-orange-700', pricePerGram: 0.3, density: 8.7 },
  { id: 'resine', label: 'Proto Résine', color: 'bg-blue-500', pricePerGram: 0.2, density: 1.2 },
];

export default function Quote() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [step, setStep] = useState(1);
  const [fileData, setFileData] = useState<{name: string, url: string, objectName: string} | null>(null);
  const [material, setMaterial] = useState('or-jaune');
  const [finish, setFinish] = useState('poli');
  const [quantity, setQuantity] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [modelVolume, setModelVolume] = useState<number | null>(null);
  const [modelDimensions, setModelDimensions] = useState<{ x: number; y: number; z: number } | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.stl') && !file.name.toLowerCase().endsWith('.obj')) {
      setError('Format de fichier non supporté. Veuillez utiliser .stl ou .obj');
      return;
    }

    setIsUploading(true);
    setError(null);
    try {
      const response = await uploadFile(file);
      setFileData({ 
        name: file.name, 
        url: `${BASE_URL}${response.url}`,
        objectName: response.objectName 
      });
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload échoué');
    } finally {
      setIsUploading(false);
    }
  };

  const handleVolumeCalculated = useCallback((volume: number, dimensions: { x: number; y: number; z: number }) => {
    setModelVolume(volume);
    setModelDimensions(dimensions);
  }, []);

  const calculatePrice = () => {
    const mat = MATERIALS.find(m => m.id === material);
    if (!mat || !modelVolume) return null;

    const weight = modelVolume * mat.density; // grammes
    const materialCost = weight * mat.pricePerGram;
    const laborCost = 50; // Forfait main d'œuvre
    const finishCost = finish === 'poli' ? 40 : 0;
    
    return Math.round((materialCost + laborCost + finishCost) * quantity);
  };

  const getEstimatedWeight = () => {
    const mat = MATERIALS.find(m => m.id === material);
    if (!mat || !modelVolume) return null;
    return (modelVolume * mat.density).toFixed(1);
  };

  const handleSubmitOrder = async () => {
    if (!fileData) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const price = calculatePrice();
      await postJSON('/orders', {
        stlFileUrl: fileData.url,
        estimatedPrice: price,
        notes: `Matière: ${material}, Finition: ${finish}, Quantité: ${quantity}, Volume: ${modelVolume?.toFixed(2)}cm³`
      });
      setSuccess(true);
      setTimeout(() => navigate('/client'), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la commande');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveFile = () => {
    setStep(1);
    setFileData(null);
    setModelVolume(null);
    setModelDimensions(null);
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] bg-white rounded-xl border border-secondary-200 shadow-sm p-12 text-center">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
          <CheckCircle size={40} />
        </div>
        <h2 className="text-3xl font-serif text-secondary-900 mb-4">Commande Confirmée</h2>
        <p className="text-secondary-600 max-w-md mx-auto">
          Votre demande de production a bien été enregistrée. Elle est désormais visible dans votre tableau de bord sous le statut "EN ATTENTE".
        </p>
        <p className="text-secondary-400 text-sm mt-8 animate-pulse text-balance">Redirection vers le tableau de bord...</p>
      </div>
    );
  }

  const price = calculatePrice();
  const weight = getEstimatedWeight();

  return (
    <div className="space-y-6">
      <SectionTitle title="Devis Instantané" subtitle="Outils & Commandes" />
      
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2 mb-4">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}

      <div className="bg-white border border-secondary-200 rounded-sm overflow-hidden flex flex-col md:flex-row min-h-[560px] shadow-sm">
        <div className="w-full md:w-2/3 bg-secondary-950 relative flex items-center justify-center border-b md:border-b-0 md:border-r border-secondary-200 group">
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept=".stl,.obj" 
            onChange={handleFileChange} 
          />
          
          {step === 1 ? (
            <div 
              className="text-center p-10 border-2 border-dashed border-secondary-700 hover:border-primary-500 rounded-lg transition-all cursor-pointer group w-full max-w-md mx-auto"
              onClick={() => fileInputRef.current?.click()}
            >
              {isUploading ? (
                <div className="flex flex-col items-center">
                  <Loader2 className="animate-spin text-primary-500 mb-4" size={48} />
                  <p className="text-secondary-300 font-medium tracking-wide">Upload en cours...</p>
                  <p className="text-secondary-500 text-xs mt-2 uppercase">Préparation de l'aperçu 3D</p>
                </div>
              ) : (
                <>
                  <div className="w-20 h-20 bg-secondary-900 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary-900/20 group-hover:scale-110 transition-all border border-secondary-800">
                    <Upload className="text-secondary-400 group-hover:text-primary-500" size={32} />
                  </div>
                  <h3 className="text-xl text-white font-medium mb-2">Déposez votre fichier 3D</h3>
                  <p className="text-secondary-500 mb-6">Format .STL ou .OBJ supporté</p>
                  <Button variant="outline" className="mx-auto border-secondary-700 text-secondary-400 group-hover:border-primary-500 group-hover:text-primary-500">
                    Sélectionner un fichier
                  </Button>
                </>
              )}
            </div>
          ) : (
            <div className="w-full h-full relative min-h-[400px]">
              <STLViewer 
                fileUrl={fileData?.url || null}
                fileName={fileData?.name || null}
                materialType={material}
                finishType={finish}
                onVolumeCalculated={handleVolumeCalculated}
              />
              <button 
                onClick={handleRemoveFile} 
                className="absolute top-4 right-4 text-secondary-500 hover:text-white bg-secondary-900/50 hover:bg-secondary-800 p-2 rounded-full transition-colors z-10"
                title="Supprimer le fichier"
              >
                <X size={20} />
              </button>
            </div>
          )}
        </div>

        <div className="w-full md:w-1/3 p-8 bg-white flex flex-col">
          <div className="mb-8">
            <h3 className="text-primary-600 text-xs font-bold tracking-widest uppercase mb-6 flex items-center gap-2">
              <div className="h-px w-4 bg-primary-600"></div>
              Configuration
            </h3>
            
            <div className="mb-6">
              <label className="block text-xs font-bold text-secondary-500 uppercase tracking-wider mb-3">Matériau de fonte</label>
              <div className="grid grid-cols-2 gap-3">
                {MATERIALS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMaterial(m.id)}
                    className={`p-3 rounded-md border text-left transition-all flex items-center gap-3 ${
                      material === m.id 
                      ? 'border-primary-600 bg-primary-50 text-secondary-900 ring-1 ring-primary-500/50' 
                      : 'border-secondary-200 text-secondary-600 hover:border-secondary-300 bg-white'
                    } ${step === 1 ? 'opacity-40 cursor-not-allowed' : ''}`}
                    disabled={step === 1}
                  >
                    <div className={`w-3 h-3 rounded-full ${m.color} shadow-sm shrink-0`}></div>
                    <span className="text-[10px] font-bold uppercase tracking-tight truncate">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-bold text-secondary-500 uppercase tracking-wider mb-3">Finition</label>
              <div className="flex gap-2">
                {[
                  { id: 'brut', label: 'Brut de fonte' },
                  { id: 'poli', label: 'Poli miroir' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFinish(f.id)}
                    className={`flex-1 py-3 px-2 rounded-md border text-[10px] font-bold uppercase tracking-wider transition-all ${
                      finish === f.id 
                      ? 'border-primary-600 bg-primary-50 text-secondary-900' 
                      : 'border-secondary-200 text-secondary-600 hover:border-secondary-300 bg-white'
                    } ${step === 1 ? 'opacity-40 cursor-not-allowed' : ''}`}
                    disabled={step === 1}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-bold text-secondary-500 uppercase tracking-wider mb-3">Quantité</label>
              <div className="flex items-center gap-4 bg-secondary-50 p-2 rounded-md border border-secondary-200">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center text-secondary-500 hover:text-primary-600 hover:bg-white rounded transition-all"
                  disabled={step === 1}
                > - </button>
                <span className="flex-grow text-center font-bold text-secondary-900">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center text-secondary-500 hover:text-primary-600 hover:bg-white rounded transition-all"
                  disabled={step === 1}
                > + </button>
              </div>
            </div>

            {/* Informations calculées */}
            {modelVolume && (
              <div className="p-4 bg-secondary-50 rounded-lg border border-secondary-200 mb-6">
                <h4 className="text-xs font-bold text-secondary-500 uppercase tracking-wider mb-3">Analyse du modèle</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-secondary-500">Volume:</span>
                    <span className="font-medium text-secondary-900">{modelVolume.toFixed(2)} cm³</span>
                  </div>
                  {weight && (
                    <div className="flex justify-between">
                      <span className="text-secondary-500">Poids estimé:</span>
                      <span className="font-medium text-secondary-900">~{weight}g</span>
                    </div>
                  )}
                  {modelDimensions && (
                    <div className="flex justify-between">
                      <span className="text-secondary-500">Dimensions:</span>
                      <span className="font-medium text-secondary-900 text-xs">
                        {modelDimensions.x} × {modelDimensions.y} × {modelDimensions.z} mm
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="mt-auto border-t border-secondary-100 pt-6">
            <div className="flex justify-between items-end mb-6">
              <div className="text-secondary-500 text-[10px] font-bold uppercase tracking-widest">Estimation HT</div>
              <div className="text-4xl font-serif text-secondary-900 flex items-baseline gap-1">
                {step === 1 || price === null ? (
                  <span className="text-secondary-200">--,--</span>
                ) : (
                  <span className="animate-in fade-in slide-in-from-bottom-1 font-bold">{price},00</span>
                )}
                <span className="text-sm font-sans font-medium text-secondary-400">€</span>
              </div>
            </div>
            <Button 
              variant="primary" 
              className="w-full py-4 shadow-xl shadow-primary-900/10" 
              disabled={step === 1 || isSubmitting || price === null}
              onClick={handleSubmitOrder}
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Commander cette pièce'}
            </Button>
            <div className="flex items-center justify-center gap-2 mt-4 text-[10px] text-secondary-400 uppercase font-bold tracking-tighter">
              <RefreshCw size={12} className="text-primary-500" />
              Délai de fabrication : 5 à 7 jours
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
