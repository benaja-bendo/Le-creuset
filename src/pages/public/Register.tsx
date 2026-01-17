import { useState } from 'react';
import { postJSON } from '../../api/client';
import { Link, useNavigate } from 'react-router-dom';

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
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await postJSON('/auth/register', form);
      setSuccess('Votre compte est créé et en attente de validation.');
      setTimeout(() => navigate('/login'), 1200);
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
                  <p className="text-xs text-secondary-500 mt-1">8 caractères minimum.</p>
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
                  <label className="block text-sm text-secondary-300 mb-2">Lien KBIS (PDF)</label>
                  <input
                    type="url"
                    name="kbisFileUrl"
                    value={form.kbisFileUrl}
                    onChange={onChange}
                    className="w-full px-3 py-2 rounded-md bg-secondary-950 border border-secondary-800 text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                    placeholder="https://…"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-secondary-300 mb-2">Lien document Douanes (PDF)</label>
                  <input
                    type="url"
                    name="customsFileUrl"
                    value={form.customsFileUrl}
                    onChange={onChange}
                    className="w-full px-3 py-2 rounded-md bg-secondary-950 border border-secondary-800 text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                    placeholder="https://…"
                    required
                  />
                </div>
              </div>

              {error && <div className="text-sm text-red-400">{error}</div>}
              {success && <div className="text-sm text-green-400">{success}</div>}
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                {loading ? 'Envoi…' : 'Soumettre le dossier'}
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
            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="p-4 bg-secondary-900 border border-secondary-800 rounded-lg">
                <p className="text-sm text-secondary-300">Validation rapide</p>
              </div>
              <div className="p-4 bg-secondary-900 border border-secondary-800 rounded-lg">
                <p className="text-sm text-secondary-300">Interface dédiée</p>
              </div>
              <div className="p-4 bg-secondary-900 border border-secondary-800 rounded-lg">
                <p className="text-sm text-secondary-300">Support prioritaire</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
