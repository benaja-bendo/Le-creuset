import { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { postJSON } from '../../api/client';
import Alert from '../../components/Alert';
import AuthShell from '../../components/vitrine/AuthShell';
import PasswordField from '../../components/vitrine/PasswordField';
import { fieldInput, fieldLabel, submitButton, textLink } from '../../components/vitrine/styles';

// Même minimum que l'inscription et la connexion côté back : un mot de passe
// plus court serait enregistré puis refusé au login.
const MIN_PASSWORD_LENGTH = 6;

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

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
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères.`);
      return;
    }
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

  const feedback = (
    <>
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
      {success && <Alert type="success" message={success} />}
    </>
  );

  return (
    <AuthShell
      title={token ? 'Nouveau mot de passe' : 'Mot de passe oublié'}
      lead={
        token
          ? 'Choisissez votre nouveau mot de passe.'
          : 'Saisissez votre adresse email pour recevoir un lien de réinitialisation.'
      }
    >
      {!token ? (
        <form onSubmit={handleForgotSubmit} className="flex flex-col gap-5">
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
          {feedback}
          <button type="submit" disabled={loading} className={submitButton}>
            {loading ? <Loader2 className="animate-spin" size={18} /> : 'Envoyer le lien'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleResetSubmit} className="flex flex-col gap-5">
          <PasswordField
            id="reset-password"
            label="Nouveau mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            describedBy="new-password-rule"
            hint={
              <p
                id="new-password-rule"
                className={clsx(
                  'font-sans text-xs transition-colors',
                  password.length >= MIN_PASSWORD_LENGTH ? 'text-green-700' : 'text-pierre',
                )}
              >
                Au moins {MIN_PASSWORD_LENGTH} caractères.
              </p>
            }
          />
          <PasswordField
            id="reset-password-confirm"
            label="Confirmer le mot de passe"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
          />
          {feedback}
          <button type="submit" disabled={loading} className={submitButton}>
            {loading ? <Loader2 className="animate-spin" size={18} /> : 'Mettre à jour'}
          </button>
        </form>
      )}

      <Link to="/login" className={`${textLink} self-center font-sans text-sm`}>
        Retour à la connexion
      </Link>
    </AuthShell>
  );
}
