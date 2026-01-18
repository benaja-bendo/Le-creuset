import { useState } from 'react';
import { postJSON, uploadFile } from '../../api/client';
import { Link, useNavigate } from 'react-router-dom';
import Alert from '../../components/Alert';
import { Loader2 } from 'lucide-react';

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
      if (!files.kbis || !files.customs) {
        throw new Error('Veuillez fournir tous les documents obligatoires (KBIS et Douanes)');
      }

      // 1. Upload des fichiers
      const [kbisRes, customsRes] = await Promise.all([
        uploadFile(files.kbis),
        uploadFile(files.customs)
      ]);

      // 2. Inscription avec les URLs retournées
      await postJSON('/auth/register', {
        ...form,
        kbisFileUrl: kbisRes.url,
        customsFileUrl: customsRes.url,
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
    <div className="pt-24 pb-24">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <div className="bg-secondary-900 border border-secondary-800 rounded-lg p-8">
            <h1 className="text-3xl font-serif text-white mb-2">Demande d’accès professionnel</h1>
            <p className="text-secondary-300 mb-6">
              Renseignez les informations de votre entreprise pour activer votre espace. Un administrateur validera votre dossier.
            </p>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-secondary-300 mb-2">Email professionnel</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={onChange}
                    className="w-full px-3 py-2 rounded-md bg-secondary-950 border border-secondary-800 text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                    placeholder="prenom.nom@entreprise.fr"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-secondary-300 mb-2">Mot de passe</label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={onChange}
                    className="w-full px-3 py-2 rounded-md bg-secondary-950 border border-secondary-800 text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-secondary-300 mb-2">Entreprise</label>
                  <input
                    type="text"
                    name="companyName"
                    value={form.companyName}
                    onChange={onChange}
                    className="w-full px-3 py-2 rounded-md bg-secondary-950 border border-secondary-800 text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                    placeholder="Raison sociale"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-secondary-300 mb-2">Téléphone</label>
                  <input
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={onChange}
                    className="w-full px-3 py-2 rounded-md bg-secondary-950 border border-secondary-800 text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                    placeholder="+33 X XX XX XX XX"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-secondary-300 mb-2">Adresse</label>
                  <input
                    type="text"
                    name="address"
                    value={form.address}
                    onChange={onChange}
                    className="w-full px-3 py-2 rounded-md bg-secondary-950 border border-secondary-800 text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                    placeholder="Adresse complète"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-secondary-300 mb-2">Nom du contact</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={onChange}
                    className="w-full px-3 py-2 rounded-md bg-secondary-950 border border-secondary-800 text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                    placeholder="Nom et prénom"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-secondary-300 mb-2">Extrait KBIS (PDF)</label>
                  <input
                    type="file"
                    name="kbis"
                    onChange={onFileChange}
                    accept="application/pdf"
                    className="w-full px-3 py-1.5 rounded-md bg-secondary-950 border border-secondary-800 text-sm text-secondary-400 file:mr-4 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary-900 file:text-primary-300 hover:file:bg-primary-800 cursor-pointer"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-secondary-300 mb-2">Déclaration Douanes (PDF)</label>
                  <input
                    type="file"
                    name="customs"
                    onChange={onFileChange}
                    accept="application/pdf"
                    className="w-full px-3 py-1.5 rounded-md bg-secondary-950 border border-secondary-800 text-sm text-secondary-400 file:mr-4 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary-900 file:text-primary-300 hover:file:bg-primary-800 cursor-pointer"
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
                {success && <Alert type="success" message={success} />}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-all font-medium disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    <span>Traitement en cours…</span>
                  </>
                ) : (
                  'Soumettre le dossier'
                )}
              </button>
              <p className="text-sm text-secondary-400 text-center">
                Vous avez déjà un compte ? <Link to="/login" className="text-primary-500 hover:underline">Se connecter</Link>
              </p>
            </form>
          </div>
          <div className="hidden lg:block">
            <div className="rounded-lg overflow-hidden border border-secondary-800">
              <img src="/hero-register.jpg" alt="Accès pro" className="w-full h-80 object-cover" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
