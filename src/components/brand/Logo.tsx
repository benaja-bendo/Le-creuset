import { WORDMARK_PATH, WORDMARK_VIEWBOX } from './wordmark';

type LogoProps = {
  className?: string;
  /** `false` quand un texte voisin nomme déjà la marque (lien « La Grenaille — accueil »). */
  labelled?: boolean;
};

/** Mot-logo « La Grenaille ». Prend la couleur du texte courant (`text-ivoire`, `text-charbon`). */
export default function Logo({ className = '', labelled = true }: LogoProps) {
  return (
    <svg
      viewBox={WORDMARK_VIEWBOX}
      className={className}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...(labelled ? { role: 'img', 'aria-label': 'La Grenaille' } : { 'aria-hidden': true })}
    >
      <path d={WORDMARK_PATH} />
    </svg>
  );
}
