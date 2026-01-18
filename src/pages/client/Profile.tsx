import { useState, useEffect, useRef } from 'react';
import { 
  User, 
  Building2, 
  Phone, 
  MapPin, 
  Mail, 
  FileText, 
  Lock, 
  Save, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Upload,
  Eye
} from 'lucide-react';
import { getJSON, patchJSON, uploadFile, BASE_URL } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

// Button component
const Button = ({ children, variant = 'primary', onClick, className = '', disabled = false, type = 'button' }: any) => {
  const baseStyle = "px-5 py-2.5 transition-all duration-300 font-medium tracking-wide text-sm uppercase flex items-center justify-center gap-2 rounded-md";
  const variants: any = {
    primary: "bg-primary-600 text-white hover:bg-primary-700 hover:shadow-lg disabled:bg-secondary-300 disabled:text-secondary-500",
    outline: "border border-secondary-300 text-secondary-600 hover:border-primary-500 hover:text-primary-600",
    danger: "bg-red-600 text-white hover:bg-red-700",
    ghost: "text-secondary-500 hover:text-primary-600 hover:bg-primary-50",
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

// Tab component
const Tab = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button
    onClick={onClick}
    className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
      active 
        ? 'text-primary-600 border-primary-600' 
        : 'text-secondary-500 border-transparent hover:text-secondary-700 hover:border-secondary-300'
    }`}
  >
    {children}
  </button>
);

// Input field component
const InputField = ({ 
  label, 
  value, 
  onChange, 
  type = 'text', 
  icon: Icon, 
  disabled = false,
  placeholder = '' 
}: { 
  label: string; 
  value: string; 
  onChange: (v: string) => void; 
  type?: string;
  icon?: any;
  disabled?: boolean;
  placeholder?: string;
}) => (
  <div className="mb-4">
    <label className="block text-xs font-bold text-secondary-500 uppercase tracking-wider mb-2">
      {label}
    </label>
    <div className="relative">
      {Icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400">
          <Icon size={18} />
        </div>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3 border border-secondary-200 rounded-lg text-secondary-900 
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
          disabled:bg-secondary-50 disabled:text-secondary-500 transition-colors`}
      />
    </div>
  </div>
);

// Alert component
const Alert = ({ type, message }: { type: 'success' | 'error'; message: string }) => (
  <div className={`p-4 rounded-lg flex items-center gap-3 mb-6 ${
    type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
  }`}>
    {type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
    <span>{message}</span>
  </div>
);

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  role: string;
  status: string;
  companyName: string | null;
  phone: string | null;
  address: string | null;
  kbisFileUrl: string | null;
  customsFileUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function Profile() {
  useAuth(); // Ensure user is authenticated
  const [activeTab, setActiveTab] = useState<'info' | 'security' | 'documents'>('info');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Document upload
  const kbisInputRef = useRef<HTMLInputElement>(null);
  const customsInputRef = useRef<HTMLInputElement>(null);
  const [uploadingKbis, setUploadingKbis] = useState(false);
  const [uploadingCustoms, setUploadingCustoms] = useState(false);

  // Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getJSON<UserProfile>('/users/me');
        setProfile(data);
        setName(data.name || '');
        setCompanyName(data.companyName || '');
        setPhone(data.phone || '');
        setAddress(data.address || '');
      } catch (err) {
        setAlert({ type: 'error', message: 'Impossible de charger le profil' });
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  // Save profile info
  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const updated = await patchJSON<UserProfile>('/users/me', {
        name,
        companyName,
        phone,
        address,
      });
      setProfile(prev => prev ? { ...prev, ...updated } : null);
      showAlert('success', 'Profil mis à jour avec succès');
    } catch (err) {
      showAlert('error', err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  // Change password
  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      showAlert('error', 'Les mots de passe ne correspondent pas');
      return;
    }
    setSaving(true);
    try {
      await patchJSON('/users/me/password', {
        currentPassword,
        newPassword,
        confirmPassword,
      });
      showAlert('success', 'Mot de passe modifié avec succès');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      showAlert('error', err instanceof Error ? err.message : 'Erreur lors du changement de mot de passe');
    } finally {
      setSaving(false);
    }
  };

  // Upload document
  const handleDocumentUpload = async (type: 'kbis' | 'customs', file: File) => {
    if (type === 'kbis') setUploadingKbis(true);
    else setUploadingCustoms(true);

    try {
      const response = await uploadFile(file);
      const docUrl = `${BASE_URL}${response.url}`;
      
      await patchJSON('/users/me/documents', {
        [type === 'kbis' ? 'kbisFileUrl' : 'customsFileUrl']: docUrl,
      });

      setProfile(prev => prev ? {
        ...prev,
        [type === 'kbis' ? 'kbisFileUrl' : 'customsFileUrl']: docUrl,
      } : null);

      showAlert('success', `Document ${type === 'kbis' ? 'KBIS' : 'Douanes'} mis à jour`);
    } catch (err) {
      showAlert('error', err instanceof Error ? err.message : 'Erreur lors de l\'upload');
    } finally {
      if (type === 'kbis') setUploadingKbis(false);
      else setUploadingCustoms(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-primary-500" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <span className="text-primary-600 text-xs font-bold tracking-widest uppercase mb-1 block">
          Paramètres
        </span>
        <h2 className="text-2xl md:text-3xl font-serif text-secondary-900">
          Mon Compte
        </h2>
      </div>

      {/* Alert */}
      {alert && <Alert type={alert.type} message={alert.message} />}

      {/* Profile Card */}
      <div className="bg-white border border-secondary-200 rounded-xl overflow-hidden shadow-sm">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-secondary-900 to-secondary-800 p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary-600 flex items-center justify-center text-2xl font-bold">
              {(profile?.email || 'U').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="text-xl font-medium">{profile?.companyName || profile?.name || 'Mon Entreprise'}</h3>
              <p className="text-secondary-300 text-sm">{profile?.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  profile?.status === 'ACTIVE' ? 'bg-green-500/20 text-green-300' : 
                  profile?.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-300' : 
                  'bg-red-500/20 text-red-300'
                }`}>
                  {profile?.status === 'ACTIVE' ? 'Actif' : profile?.status === 'PENDING' ? 'En attente' : 'Rejeté'}
                </span>
                <span className="text-secondary-400 text-xs">•</span>
                <span className="text-secondary-400 text-xs">
                  {profile?.role === 'ADMIN' ? 'Administrateur' : 'Client'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-secondary-200 bg-secondary-50 px-6">
          <div className="flex gap-2">
            <Tab active={activeTab === 'info'} onClick={() => setActiveTab('info')}>
              <span className="flex items-center gap-2"><User size={16} /> Informations</span>
            </Tab>
            <Tab active={activeTab === 'security'} onClick={() => setActiveTab('security')}>
              <span className="flex items-center gap-2"><Lock size={16} /> Sécurité</span>
            </Tab>
            <Tab active={activeTab === 'documents'} onClick={() => setActiveTab('documents')}>
              <span className="flex items-center gap-2"><FileText size={16} /> Documents</span>
            </Tab>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Information Tab */}
          {activeTab === 'info' && (
            <div className="max-w-xl">
              <h4 className="text-lg font-medium text-secondary-900 mb-4">Informations personnelles</h4>
              
              <InputField 
                label="Nom / Prénom" 
                value={name} 
                onChange={setName} 
                icon={User}
                placeholder="Jean Dupont"
              />
              
              <InputField 
                label="Nom de l'entreprise" 
                value={companyName} 
                onChange={setCompanyName} 
                icon={Building2}
                placeholder="Ma Bijouterie SARL"
              />
              
              <InputField 
                label="Téléphone" 
                value={phone} 
                onChange={setPhone} 
                icon={Phone}
                placeholder="06 12 34 56 78"
              />
              
              <InputField 
                label="Adresse" 
                value={address} 
                onChange={setAddress} 
                icon={MapPin}
                placeholder="123 Rue de la Bijouterie, 75001 Paris"
              />

              <InputField 
                label="Email" 
                value={profile?.email || ''} 
                onChange={() => {}} 
                icon={Mail}
                disabled
              />

              <div className="mt-6 pt-4 border-t border-secondary-100">
                <Button onClick={handleSaveProfile} disabled={saving}>
                  {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                  Enregistrer
                </Button>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="max-w-xl">
              <h4 className="text-lg font-medium text-secondary-900 mb-4">Changer le mot de passe</h4>
              
              <InputField 
                label="Mot de passe actuel" 
                value={currentPassword} 
                onChange={setCurrentPassword} 
                type="password"
                icon={Lock}
                placeholder="••••••••"
              />
              
              <InputField 
                label="Nouveau mot de passe" 
                value={newPassword} 
                onChange={setNewPassword} 
                type="password"
                icon={Lock}
                placeholder="Minimum 8 caractères avec 1 majuscule et 1 chiffre"
              />
              
              <InputField 
                label="Confirmer le nouveau mot de passe" 
                value={confirmPassword} 
                onChange={setConfirmPassword} 
                type="password"
                icon={Lock}
                placeholder="••••••••"
              />

              <div className="mt-6 pt-4 border-t border-secondary-100">
                <Button 
                  onClick={handleChangePassword} 
                  disabled={saving || !currentPassword || !newPassword || !confirmPassword}
                >
                  {saving ? <Loader2 className="animate-spin" size={18} /> : <Lock size={18} />}
                  Modifier le mot de passe
                </Button>
              </div>

              <div className="mt-8 p-4 bg-secondary-50 rounded-lg border border-secondary-200">
                <h5 className="font-medium text-secondary-900 mb-2">Exigences du mot de passe</h5>
                <ul className="text-sm text-secondary-600 space-y-1">
                  <li className="flex items-center gap-2">
                    <span className={newPassword.length >= 8 ? 'text-green-500' : 'text-secondary-400'}>✓</span>
                    Au moins 8 caractères
                  </li>
                  <li className="flex items-center gap-2">
                    <span className={/[A-Z]/.test(newPassword) ? 'text-green-500' : 'text-secondary-400'}>✓</span>
                    Au moins une lettre majuscule
                  </li>
                  <li className="flex items-center gap-2">
                    <span className={/[0-9]/.test(newPassword) ? 'text-green-500' : 'text-secondary-400'}>✓</span>
                    Au moins un chiffre
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div className="max-w-xl">
              <h4 className="text-lg font-medium text-secondary-900 mb-4">Documents légaux</h4>
              <p className="text-secondary-500 text-sm mb-6">
                Ces documents sont requis pour la validation de votre compte professionnel.
              </p>

              {/* KBIS */}
              <div className="mb-6 p-4 bg-secondary-50 rounded-lg border border-secondary-200">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h5 className="font-medium text-secondary-900">Extrait KBIS</h5>
                    <p className="text-xs text-secondary-500 mt-1">Document de moins de 3 mois</p>
                  </div>
                  {profile?.kbisFileUrl && (
                    <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                      <CheckCircle size={12} /> Fourni
                    </span>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <input 
                    type="file" 
                    ref={kbisInputRef}
                    className="hidden" 
                    accept=".pdf"
                    onChange={(e) => e.target.files?.[0] && handleDocumentUpload('kbis', e.target.files[0])}
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => kbisInputRef.current?.click()}
                    disabled={uploadingKbis}
                    className="flex-1"
                  >
                    {uploadingKbis ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                    {profile?.kbisFileUrl ? 'Mettre à jour' : 'Charger'}
                  </Button>
                  {profile?.kbisFileUrl && (
                    <Button 
                      variant="ghost"
                      onClick={() => window.open(profile.kbisFileUrl!, '_blank')}
                    >
                      <Eye size={16} /> Voir
                    </Button>
                  )}
                </div>
              </div>

              {/* Customs */}
              <div className="mb-6 p-4 bg-secondary-50 rounded-lg border border-secondary-200">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h5 className="font-medium text-secondary-900">Fiche Douanes</h5>
                    <p className="text-xs text-secondary-500 mt-1">Déclaration d'existence - Garantie des métaux</p>
                  </div>
                  {profile?.customsFileUrl && (
                    <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                      <CheckCircle size={12} /> Fourni
                    </span>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <input 
                    type="file" 
                    ref={customsInputRef}
                    className="hidden" 
                    accept=".pdf"
                    onChange={(e) => e.target.files?.[0] && handleDocumentUpload('customs', e.target.files[0])}
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => customsInputRef.current?.click()}
                    disabled={uploadingCustoms}
                    className="flex-1"
                  >
                    {uploadingCustoms ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                    {profile?.customsFileUrl ? 'Mettre à jour' : 'Charger'}
                  </Button>
                  {profile?.customsFileUrl && (
                    <Button 
                      variant="ghost"
                      onClick={() => window.open(profile.customsFileUrl!, '_blank')}
                    >
                      <Eye size={16} /> Voir
                    </Button>
                  )}
                </div>
              </div>

              {/* Account Info */}
              <div className="mt-8 p-4 bg-primary-50 rounded-lg border border-primary-200">
                <h5 className="font-medium text-primary-900 mb-2">Informations du compte</h5>
                <div className="text-sm text-primary-700 space-y-1">
                  <p>Compte créé le : <strong>{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('fr-FR') : '-'}</strong></p>
                  <p>Dernière mise à jour : <strong>{profile?.updatedAt ? new Date(profile.updatedAt).toLocaleDateString('fr-FR') : '-'}</strong></p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
