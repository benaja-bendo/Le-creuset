import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import Alert from '../../components/Alert';
import { Loader2 } from 'lucide-react';

/**
 * Page de connexion simple (email/mot de passe)
 */
export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate('/client');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 pb-24">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div className="bg-secondary-900 border border-secondary-800 rounded-lg p-8">
            <h1 className="text-3xl font-serif text-white mb-2">Espace Professionnel</h1>
            <p className="text-secondary-300 mb-6">
              Accédez à vos devis, commandes et documents. Authentification sécurisée et simple.
            </p>
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-secondary-300 mb-2">Email professionnel</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-secondary-950 border border-secondary-800 text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                  placeholder="prenom.nom@entreprise.fr"
                  required
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm text-secondary-300">Mot de passe</label>
                  <Link to="/reset" className="text-xs text-primary-500 hover:underline">Mot de passe oublié ?</Link>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-secondary-950 border border-secondary-800 text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                  placeholder="••••••••"
                  required
                />
              </div>
              {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
              
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-all font-medium disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    <span>Connexion…</span>
                  </>
                ) : (
                  'Se connecter'
                )}
              </button>
              <p className="text-sm text-secondary-400 text-center">
                Pas encore de compte ? <Link to="/register" className="text-primary-500 hover:underline">Demander un accès</Link>
              </p>
            </form>
          </div>
          <div className="hidden lg:block">
            <div className="rounded-lg overflow-hidden border border-secondary-800">
              <img src="/hero-pro.png" alt="Espace pro" className="w-full h-80 object-cover" />
            </div>
            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="p-4 bg-secondary-900 border border-secondary-800 rounded-lg">
                <p className="text-sm text-secondary-300">Suivi des commandes</p>
              </div>
              <div className="p-4 bg-secondary-900 border border-secondary-800 rounded-lg">
                <p className="text-sm text-secondary-300">Devis STL instantanés</p>
              </div>
              <div className="p-4 bg-secondary-900 border border-secondary-800 rounded-lg">
                <p className="text-sm text-secondary-300">Documents centralisés</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
