import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AuthShell from '../../components/vitrine/AuthShell';

export default function WaitingApproval() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.status === 'ACTIVE') {
      navigate('/client');
    }
  }, [user, navigate]);

  return (
    <AuthShell
      title="Dossier en cours d’examen"
      lead="Votre inscription a bien été reçue. Nous vérifions actuellement vos documents (KBIS et douanes)."
    >
      <div className="flex items-start gap-4 border border-sable bg-lin p-5">
        <Clock size={22} strokeWidth={1.4} className="mt-0.5 shrink-0 text-bronze" aria-hidden="true" />
        <p className="font-serif text-[15px] leading-[1.7]">
          Vous recevrez un email de confirmation dès que votre compte sera activé. Cela prend généralement moins de 24 h
          ouvrées.
        </p>
      </div>
      <button
        type="button"
        onClick={() => {
          logout();
          navigate('/login');
        }}
        className="inline-flex min-h-[52px] items-center justify-center border border-charbon px-7 font-sans text-[13px] font-semibold uppercase tracking-[0.16em] text-charbon transition-colors hover:bg-charbon hover:text-ivoire"
      >
        Se déconnecter
      </button>
    </AuthShell>
  );
}
