import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { clsx } from 'clsx';
import { buttonBase, goldFiletFill } from './styles';

type Variant = 'primary' | 'outline' | 'light' | 'outline-light';

const VARIANTS: Record<Variant, string> = {
  primary: goldFiletFill,
  outline: 'border border-charbon text-charbon hover:bg-charbon hover:text-ivoire',
  light: 'bg-ivoire text-charbon hover:bg-papier',
  'outline-light': 'border border-ivoire/90 text-ivoire hover:bg-ivoire hover:text-charbon',
};

type ActionLinkProps = {
  children: ReactNode;
  variant?: Variant;
  className?: string;
} & ({ to: string; href?: never } | { href: string; to?: never });

/** Bouton-lien de la vitrine : `to` pour une route interne, `href` pour mailto/tel. */
export default function ActionLink({ children, variant = 'primary', className, ...target }: ActionLinkProps) {
  const classes = clsx(buttonBase, VARIANTS[variant], className);
  if (target.to !== undefined) {
    return (
      <Link to={target.to} className={classes}>
        {children}
      </Link>
    );
  }
  return (
    <a href={target.href} className={classes}>
      {children}
    </a>
  );
}
