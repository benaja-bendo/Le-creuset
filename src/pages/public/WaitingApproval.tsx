import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useEffect } from 'react';

export default function WaitingApproval() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.status === 'ACTIVE') {
      navigate('/client');
    }
  }, [user, navigate]);

  return (
    <div className="pt-24 pb-24 min-h-[60vh] flex items-center">
      <div className="container mx-auto px-6 text-center">
        <div className="max-w-2xl mx-auto bg-secondary-900 border border-secondary-800 rounded-lg p-12">
          <div className="w-20 h-20 bg-primary-900/30 text-primary-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-serif text-white mb-4">Dossier en cours d'examen</h1>
          <p className="text-secondary-300 mb-8 text-lg">
            Votre inscription a bien été reçue. Un administrateur de la fonderie vérifie actuellement vos documents (KBIS et Douanes).
          </p>
          <div className="bg-secondary-950 border border-secondary-800 rounded-md p-6 mb-8 text-sm text-secondary-400">
            <p>Vous recevrez un email de confirmation dès que votre compte sera activé. Cela prend généralement moins de 24h ouvrées.</p>
          </div>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="px-6 py-2 border border-secondary-700 text-secondary-300 rounded-md hover:bg-secondary-800 transition-colors"
          >
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  );
}
