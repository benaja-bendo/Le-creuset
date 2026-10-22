import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Alert from '../../components/Alert';
import AuthShell, { ProAside } from '../../components/vitrine/AuthShell';
import PasswordField from '../../components/vitrine/PasswordField';
import { fieldInput, fieldLabel, submitButton, textLink } from '../../components/vitrine/styles';

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
    <AuthShell
      title="Connexion"
      lead="Accédez à vos commandes, à votre compte-poids et à vos documents."
      aside={<ProAside />}
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        <label className={fieldLabel}>
          Email professionnel
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={fieldInput}
            placeholder="prenom.nom@entreprise.fr"
            autoComplete="email"
            required
          />
        </label>
        <PasswordField
          id="login-password"
          label="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
        <Link to="/reset" className={`${textLink} -mt-1 self-end font-sans text-sm`}>
          Mot de passe oublié ?
        </Link>
        {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
        <button type="submit" disabled={loading} className={submitButton}>
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              <span>Connexion…</span>
            </>
          ) : (
            'Se connecter'
          )}
        </button>
        <p className="text-center font-sans text-sm text-pierre">
          Pas encore de compte ?{' '}
          <Link to="/register" className={textLink}>
            Demander un accès
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
