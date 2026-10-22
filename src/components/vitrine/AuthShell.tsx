import type { ReactNode } from 'react';
import { Box, FileText, Workflow } from 'lucide-react';
import { clsx } from 'clsx';
import { PHOTOS } from '../../lib/photos';
import { Container, Eyebrow } from './Layout';
import { Photo } from './Photo';

type AuthShellProps = {
  title: string;
  lead?: ReactNode;
  children: ReactNode;
  /** Colonne de droite sur grand écran (photo, arguments). Sans elle, la carte est centrée. */
  aside?: ReactNode;
};

/** Gabarit des pages de compte : connexion, inscription, mot de passe, validation. */
export default function AuthShell({ title, lead, children, aside }: AuthShellProps) {
  return (
    <section className="py-14 md:py-24">
      <Container
        className={clsx(
          'grid items-start gap-12',
          aside ? 'lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:gap-16' : 'max-w-[620px]',
        )}
      >
        <div className="flex flex-col gap-7 border border-sable bg-papier p-6 sm:p-10">
          <div className="flex flex-col gap-3">
            <Eyebrow>Espace professionnel</Eyebrow>
            <h1 className="text-[clamp(1.75rem,1.4rem+1.4vw,2.4rem)] leading-tight font-normal">{title}</h1>
            {lead && <p className="font-serif text-base leading-[1.7] text-pierre">{lead}</p>}
          </div>
          {children}
        </div>
        {aside && <aside className="hidden lg:block">{aside}</aside>}
      </Container>
    </section>
  );
}

const PRO_FEATURES = [
  { icon: Workflow, text: 'Suivi de vos commandes, de la cire à l’expédition' },
  { icon: Box, text: 'Devis indicatif sur dépôt de fichier STL' },
  { icon: FileText, text: 'Factures, compte-poids et bibliothèque de moules' },
];

/** Colonne de droite des pages de connexion et d'inscription. */
export function ProAside() {
  return (
    <div className="flex flex-col gap-8">
      <Photo photo={PHOTOS.fonte} sizes="520px" className="aspect-[5/4]" />
      <ul className="flex flex-col gap-4 border-t border-grege pt-6 font-sans text-[15px]">
        {PRO_FEATURES.map(({ icon: Icon, text }) => (
          <li key={text} className="flex items-center gap-4">
            <Icon size={20} strokeWidth={1.4} className="shrink-0 text-bronze" aria-hidden="true" />
            {text}
          </li>
        ))}
      </ul>
    </div>
  );
}
