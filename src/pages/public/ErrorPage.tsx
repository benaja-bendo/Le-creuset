import { useRouteError, Link } from 'react-router-dom';
import { AlertTriangle, Home, RotateCcw } from 'lucide-react';

export default function ErrorPage() {
  const error = useRouteError() as any;
  console.error(error);

  return (
    <div className="min-h-screen bg-secondary-950 flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full">
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20">
            <AlertTriangle className="text-red-500" size={40} />
          </div>
        </div>
        
        <h1 className="text-4xl font-serif text-white mb-4">Oups !</h1>
        <p className="text-secondary-400 mb-8">
          Une erreur inattendue est survenue dans l'application. Nos équipes ont été informées.
        </p>
        
        <div className="bg-secondary-900 border border-secondary-800 rounded-lg p-4 mb-8 text-left">
          <p className="text-xs font-mono text-red-400 break-words">
            {error?.statusText || error?.message || "Erreur système inconnue"}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/" 
            className="flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all font-medium"
          >
            <Home size={18} />
            <span>Retour à l'accueil</span>
          </Link>
          <button 
            onClick={() => window.location.reload()}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-secondary-800 text-white rounded-lg hover:bg-secondary-700 transition-all font-medium border border-secondary-700"
          >
            <RotateCcw size={18} />
            <span>Réessayer</span>
          </button>
        </div>
      </div>
    </div>
  );
}
