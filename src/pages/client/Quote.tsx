import { useState, useRef, useCallback, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Upload, X, AlertCircle, Loader2 } from 'lucide-react';
import { uploadFile, BASE_URL } from '../../api/client';
import STLViewer from '../../components/STLViewer';
import { formatAmount } from '../../lib/format';
import { QUOTE_MATERIALS, computeQuote } from '../../lib/quote';

// Composant bouton (client)
type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'success';
type ButtonProps = {
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string;
} & Pick<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick' | 'disabled' | 'type'>;

const Button = ({ children, variant = 'primary', onClick, className = '', disabled = false, type = 'button' }: ButtonProps) => {
  const baseStyle = "px-6 py-3 transition-all duration-300 font-medium tracking-wide text-sm uppercase flex items-center justify-center gap-2 rounded-sm";
  const variants: Record<ButtonVariant, string> = {
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

export default function Quote() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [step, setStep] = useState(1);
  const [fileData, setFileData] = useState<{name: string, url: string, storagePath: string} | null>(null);
  const [material, setMaterial] = useState('OR_JAUNE_750');
  const [quantity, setQuantity] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
        storagePath: response.storagePath
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

  const selected = QUOTE_MATERIALS.find((m) => m.id === material);
  const quote = selected && modelVolume ? computeQuote(selected, modelVolume, quantity) : null;
  // La résine n'a pas de prix automatique : une fois le fichier déposé, on l'annonce « sur devis ».
  const onRequest = step !== 1 && selected?.pricing === null;

  const handleRemoveFile = () => {
    setStep(1);
    setFileData(null);
    setModelVolume(null);
    setModelDimensions(null);
  };


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
                finishType="poli" // Backward comp
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

        <div className="w-full md:w-1/3 p-4 md:p-8 bg-white flex flex-col overflow-y-auto max-h-[800px]">
          <div className="mb-6">
            <h3 className="text-primary-600 text-xs font-bold tracking-widest uppercase mb-6 flex items-center gap-2">
              <div className="h-px w-4 bg-primary-600"></div>
              Configuration
            </h3>
            
            <div className="mb-6">
              <label className="block text-xs font-bold text-secondary-500 uppercase tracking-wider mb-3">Matériau / Service</label>
              <div className="grid grid-cols-1 gap-2">
                {QUOTE_MATERIALS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMaterial(m.id)}
                    className={`p-2 xl:p-3 rounded-md border text-left transition-all flex items-center gap-3 ${
                      material === m.id 
                      ? 'border-primary-600 bg-primary-50 text-secondary-900 ring-1 ring-primary-500/50' 
                      : 'border-secondary-200 text-secondary-600 hover:border-secondary-300 bg-white'
                    } ${step === 1 ? 'opacity-40 cursor-not-allowed' : ''}`}
                    disabled={step === 1}
                  >
                    <div className="w-3 h-3 rounded-full shadow-sm shrink-0 border border-black/10" style={{ backgroundColor: m.swatch }}></div>
                    <span className="text-[10px] xl:text-xs font-bold uppercase tracking-tight truncate">{m.label}</span>
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
                  {quote && (
                    <div className="flex justify-between">
                      <span className="text-secondary-500">Masse estimée:</span>
                      <span className="font-medium text-secondary-900">~{quote.weight.toFixed(1)}g</span>
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
            <div className="flex justify-between items-end mb-4">
              <div className="text-secondary-500 text-[10px] font-bold uppercase tracking-widest">Estimation HT</div>
              <div className="text-4xl font-serif text-secondary-900 flex items-baseline gap-1">
                {onRequest ? (
                  <span className="animate-in fade-in slide-in-from-bottom-1 whitespace-nowrap text-2xl font-bold">Sur devis</span>
                ) : (
                  <>
                    {quote ? (
                      <span className="animate-in fade-in slide-in-from-bottom-1 font-bold">{formatAmount(quote.total)}</span>
                    ) : (
                      <span className="text-secondary-200">--,--</span>
                    )}
                    <span className="text-sm font-sans font-medium text-secondary-400">€</span>
                  </>
                )}
              </div>
            </div>
            {onRequest && (
              <p className="text-[10px] text-secondary-400 italic mb-4 leading-snug">
                Le prototype en résine n’a pas de prix automatique : il est chiffré sur devis.
              </p>
            )}
            {quote && (
              <p className="text-[10px] text-secondary-400 italic mb-4 leading-snug">
                Les prix mentionnés sont purement informatifs et n’ont pas de valeur contractuelle.
              </p>
            )}
            <div className="p-4 bg-primary-50 border border-primary-200 rounded-lg">
              <p className="text-xs text-primary-800 text-center leading-relaxed">
                Pour toute commande, veuillez contacter l’adresse email{' '}
                <a href="mailto:contact@lagrenaille.fr" className="font-bold underline">contact@lagrenaille.fr</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
