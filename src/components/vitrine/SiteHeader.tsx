import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, UserRound, X } from 'lucide-react';
import { clsx } from 'clsx';
import Logo from '../brand/Logo';
import { CONTACT, SERVICE_LINKS } from '../../lib/site';
import { Container } from './Layout';

const SERVICE_PATHS = ['/services', ...SERVICE_LINKS.map((link) => link.to)];

const NAV = [
  { label: 'Accueil', to: '/', isActive: (path: string) => path === '/' },
  { label: 'Nos services', to: '/services', isActive: (path: string) => SERVICE_PATHS.includes(path) },
  { label: 'Contact', to: '/contact', isActive: (path: string) => path === '/contact' },
];

export default function SiteHeader() {
  const { pathname } = useLocation();
  // Le menu se referme de lui-même au changement de page.
  const [openOnPath, setOpenOnPath] = useState<string | null>(null);
  const open = openOnPath === pathname;
  const close = () => setOpenOnPath(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenOnPath(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 bg-charbon text-ivoire">
      <Container>
        <div className="flex h-[76px] items-center justify-between gap-6 border-b border-or/50 lg:h-[92px]">
          <Link to="/" aria-label="La Grenaille — accueil" className="shrink-0">
            <Logo labelled={false} className="h-10 w-auto lg:h-12" />
          </Link>

          <nav aria-label="Navigation principale" className="hidden items-center gap-10 lg:flex">
            {NAV.map((item) => {
              const active = item.isActive(pathname);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  aria-current={active ? 'page' : undefined}
                  className={clsx(
                    'border-b py-3 font-sans text-[13px] font-medium uppercase tracking-[0.16em] transition-colors duration-300',
                    active ? 'border-or text-or-clair' : 'border-transparent text-ivoire hover:text-or-clair',
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/client"
              className="hidden min-h-11 items-center gap-2.5 border border-or px-5 font-sans text-[13px] font-semibold uppercase tracking-[0.16em] transition-colors duration-300 hover:bg-or hover:text-charbon sm:inline-flex"
            >
              <UserRound size={16} strokeWidth={1.5} aria-hidden="true" />
              Espace client
            </Link>
            <button
              type="button"
              className="inline-flex size-11 items-center justify-center text-ivoire transition-colors hover:text-or-clair lg:hidden"
              aria-expanded={open}
              aria-controls="menu-mobile"
              aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
              onClick={() => setOpenOnPath(open ? null : pathname)}
            >
              {open ? <X size={26} strokeWidth={1.5} /> : <Menu size={26} strokeWidth={1.5} />}
            </button>
          </div>
        </div>
      </Container>

      <div
        id="menu-mobile"
        hidden={!open}
        className="fixed inset-x-0 top-[76px] bottom-0 overflow-y-auto bg-charbon lg:hidden"
      >
        <Container className="flex min-h-full flex-col gap-10 py-10">
          <nav aria-label="Navigation mobile" className="flex flex-col">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={close}
                aria-current={item.isActive(pathname) ? 'page' : undefined}
                className={clsx(
                  'border-b border-ivoire/10 py-4 font-serif text-[28px] transition-colors',
                  item.isActive(pathname) ? 'text-or-clair' : 'text-ivoire hover:text-or-clair',
                )}
              >
                {item.label}
              </Link>
            ))}
            <ul className="flex flex-col gap-1 pt-4 pl-1">
              {SERVICE_LINKS.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    onClick={close}
                    className="block py-2 font-sans text-[15px] text-ivoire/80 transition-colors hover:text-or-clair"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <Link
            to="/client"
            onClick={close}
            className="inline-flex min-h-[52px] items-center justify-center gap-3 border border-or font-sans text-[13px] font-semibold uppercase tracking-[0.16em] text-ivoire"
          >
            <UserRound size={16} strokeWidth={1.5} aria-hidden="true" />
            Espace client
          </Link>
          <div className="mt-auto flex flex-col gap-2 border-t border-or/40 pt-6 font-sans text-[15px] text-ivoire/85">
            <a href={CONTACT.phoneHref} className="font-serif text-lg text-ivoire">
              {CONTACT.phoneDisplay}
            </a>
            <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
            <p>Atelier à {CONTACT.city}</p>
          </div>
        </Container>
      </div>
    </header>
  );
}
