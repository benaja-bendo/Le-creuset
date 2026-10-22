import { Link } from 'react-router-dom';
import Logo from '../brand/Logo';
import { CONTACT, SERVICE_LINKS, SOCIAL_LINKS } from '../../lib/site';
import { Container } from './Layout';
import { GoldRule } from './Ornaments';

const ATELIER_LINKS = [
  { label: 'Accueil', to: '/' },
  { label: 'Nos services', to: '/services' },
  { label: 'Espace client', to: '/client' },
  { label: 'Créer un compte pro', to: '/register' },
];

const LEGAL_LINKS = [
  { label: 'Mentions légales', to: '/legal/mentions-legales' },
  { label: 'CGV', to: '/legal/cgv' },
  { label: 'Confidentialité', to: '/legal/privacy' },
];

function ColumnTitle({ children }: { children: string }) {
  return <p className="mb-2 font-serif text-xs font-bold uppercase tracking-[0.28em] text-or-clair">{children}</p>;
}

const linkClass = 'font-sans text-[15px] text-ivoire/85 transition-colors hover:text-or-clair';

export default function SiteFooter() {
  return (
    <footer className="bg-charbon text-ivoire">
      <Container className="flex flex-col gap-14 pt-16 pb-8 md:pt-20">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="flex flex-col gap-4">
            <Logo className="h-14 w-auto self-start" />
            <p className="font-serif text-base text-ivoire/80">Fonderie de métaux Précieux</p>
            <p className="font-serif text-xs font-bold tracking-[0.34em]">BORDEAUX</p>
            <GoldRule className="mt-1 w-36" />
            <ul className="mt-3 flex gap-3" aria-label="Réseaux sociaux">
              {SOCIAL_LINKS.map(({ label, icon: Icon, href }) => (
                <li key={label}>
                  {href ? (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="inline-flex size-11 items-center justify-center border border-ivoire/25 transition-colors hover:border-or hover:text-or-clair"
                    >
                      <Icon size={18} strokeWidth={1.5} aria-hidden="true" />
                    </a>
                  ) : (
                    <span
                      role="img"
                      aria-label={`${label} — bientôt disponible`}
                      title="Bientôt disponible"
                      className="inline-flex size-11 items-center justify-center border border-ivoire/25 text-ivoire/85"
                    >
                      <Icon size={18} strokeWidth={1.5} aria-hidden="true" />
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <nav aria-label="Services" className="flex flex-col gap-3">
            <ColumnTitle>Services</ColumnTitle>
            {SERVICE_LINKS.map((link) => (
              <Link key={link.to} to={link.to} className={linkClass}>
                {link.label}
              </Link>
            ))}
          </nav>

          <nav aria-label="L’atelier" className="flex flex-col gap-3">
            <ColumnTitle>L’atelier</ColumnTitle>
            {ATELIER_LINKS.map((link) => (
              <Link key={link.label} to={link.to} className={linkClass}>
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-col gap-3">
            <ColumnTitle>Contact</ColumnTitle>
            <a href={CONTACT.phoneHref} className="font-serif text-lg text-ivoire transition-colors hover:text-or-clair">
              {CONTACT.phoneDisplay}
            </a>
            <a href={`mailto:${CONTACT.email}`} className={linkClass}>
              {CONTACT.email}
            </a>
            <p className="font-sans text-[15px] text-ivoire/85">Atelier à {CONTACT.city}</p>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-or/35 pt-6 font-sans text-[13px] text-ivoire/70 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} La Grenaille · Fonderie de métaux précieux</p>
          <nav aria-label="Informations légales" className="flex flex-wrap gap-x-7 gap-y-2">
            {LEGAL_LINKS.map((link) => (
              <Link key={link.to} to={link.to} className="transition-colors hover:text-or-clair">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </Container>
    </footer>
  );
}
