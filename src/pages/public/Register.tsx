import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { postJSON, uploadFile } from '../../api/client';
import Alert from '../../components/Alert';
import AuthShell, { ProAside } from '../../components/vitrine/AuthShell';
import PasswordField from '../../components/vitrine/PasswordField';
import { fieldInput, fieldLabel, submitButton, textLink } from '../../components/vitrine/styles';
import { isPasswordLongEnough, PASSWORD_RULE_HINT, PASSWORD_TOO_SHORT_MESSAGE } from '../../lib/password';

const fileInput = `${fieldInput} py-2.5 text-sm text-pierre file:mr-4 file:cursor-pointer file:border-0 file:bg-lin file:px-3 file:py-1.5 file:font-sans file:text-xs file:font-semibold file:text-charbon hover:file:bg-sable`;

function Optional() {
  return <span className="font-normal normal-case tracking-normal text-gris-carte">(optionnel)</span>;
}

/**
 * Page d’inscription (soumission de dossier) avec statut PENDING
 */
export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    password: '',
    companyName: '',
    phone: '',
    address: '',
    kbisFileUrl: '',
    customsFileUrl: '',
    name: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [files, setFiles] = useState<{ kbis?: File; customs?: File }>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFiles({ ...files, [e.target.name]: e.target.files[0] });
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!isPasswordLongEnough(form.password)) {
        throw new Error(PASSWORD_TOO_SHORT_MESSAGE);
      }
      if (form.password !== confirmPassword) {
        throw new Error('Les mots de passe ne correspondent pas');
      }

      // 1. Upload des fichiers
      const [kbisRes, customsRes] = await Promise.all([
        files.kbis ? uploadFile(files.kbis) : Promise.resolve(null),
        files.customs ? uploadFile(files.customs) : Promise.resolve(null)
      ]);

      // 2. Inscription avec les URLs retournées
      await postJSON('/auth/register', {
        ...form,
        kbisFileUrl: kbisRes ? kbisRes.url : '',
        customsFileUrl: customsRes ? customsRes.url : '',
      });

      setSuccess('Votre dossier a été soumis avec succès et est en attente de validation.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l’inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Demande d’accès professionnel"
      lead="Renseignez les informations de votre entreprise pour activer votre espace. Nous validons chaque dossier."
      aside={<ProAside />}
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        <label className={fieldLabel}>
          Email professionnel
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={onChange}
            className={fieldInput}
            placeholder="prenom.nom@entreprise.fr"
            autoComplete="email"
            required
          />
        </label>

        <div className="grid gap-5 md:grid-cols-2">
          <PasswordField
            id="register-password"
            name="password"
            label="Mot de passe"
            value={form.password}
            onChange={onChange}
            autoComplete="new-password"
            describedBy="register-password-rule"
            hint={
              <p id="register-password-rule" className="font-sans text-xs text-pierre">
                {PASSWORD_RULE_HINT}
              </p>
            }
          />
          <PasswordField
            id="register-password-confirm"
            name="confirmPassword"
            label="Confirmer le mot de passe"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
          />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <label className={fieldLabel}>
            Entreprise
            <input
              type="text"
              name="companyName"
              value={form.companyName}
              onChange={onChange}
              className={fieldInput}
              placeholder="Raison sociale"
              autoComplete="organization"
              required
            />
          </label>
          <label className={fieldLabel}>
            Téléphone
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={onChange}
              className={fieldInput}
              placeholder="+33 X XX XX XX XX"
              autoComplete="tel"
              required
            />
          </label>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <label className={fieldLabel}>
            Adresse
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={onChange}
              className={fieldInput}
              placeholder="Adresse complète"
              autoComplete="street-address"
              required
            />
          </label>
          <label className={fieldLabel}>
            Nom du contact
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={onChange}
              className={fieldInput}
              placeholder="Nom et prénom"
              autoComplete="name"
            />
          </label>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <label className={fieldLabel}>
            <span>
              Extrait KBIS (PDF) <Optional />
            </span>
            <input type="file" name="kbis" onChange={onFileChange} accept="application/pdf" className={fileInput} />
          </label>
          <label className={fieldLabel}>
            <span>
              Déclaration douanes (PDF) <Optional />
            </span>
            <input type="file" name="customs" onChange={onFileChange} accept="application/pdf" className={fileInput} />
          </label>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
        {success && <Alert type="success" message={success} />}

        <button type="submit" disabled={loading} className={submitButton}>
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              <span>Traitement en cours…</span>
            </>
          ) : (
            'Soumettre le dossier'
          )}
        </button>
        <p className="text-center font-sans text-sm text-pierre">
          Vous avez déjà un compte ?{' '}
          <Link to="/login" className={textLink}>
            Se connecter
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
