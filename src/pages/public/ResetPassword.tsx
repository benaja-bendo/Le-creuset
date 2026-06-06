import { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { postJSON } from '../../api/client';
import Alert from '../../components/Alert';
import { Loader2, Eye, EyeOff } from 'lucide-react';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const res = await postJSON<{ message?: string }>('/auth/forgot-password', { email });
      setSuccess(res.message || 'Un email vous a été envoyé si le compte existe.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const res = await postJSON<{ message?: string }>('/auth/reset-password', { token, newPassword: password });
      setSuccess(res.message || 'Mot de passe mis à jour.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lien expiré ou invalide.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 pb-24">
      <div className="container mx-auto px-6 max-w-md">
        <div className="bg-secondary-900 border border-secondary-800 rounded-lg p-8">
          <h1 className="text-2xl font-serif text-white mb-2">
            {token ? 'Nouveau mot de passe' : 'Mot de passe oublié'}
          </h1>
          <p className="text-sm text-secondary-300 mb-6">
            {token 
              ? 'Veuillez saisir votre nouveau mot de passe.'
              : 'Saisissez votre adresse email pour recevoir un lien de réinitialisation.'}
          </p>

          {!token ? (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
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
              {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
              {success && <Alert type="success" message={success} />}
              
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-all font-medium disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : 'Envoyer le lien'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-secondary-300 mb-2">Nouveau mot de passe</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-md bg-secondary-950 border border-secondary-800 text-white focus:outline-none focus:ring-2 focus:ring-primary-600 pr-10"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-secondary-400 hover:text-secondary-300"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm text-secondary-300 mb-2">Confirmer le mot de passe</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-md bg-secondary-950 border border-secondary-800 text-white focus:outline-none focus:ring-2 focus:ring-primary-600 pr-10"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-secondary-400 hover:text-secondary-300"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
              {success && <Alert type="success" message={success} />}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-all font-medium disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : 'Mettre à jour'}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-primary-500 hover:underline">
              Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}