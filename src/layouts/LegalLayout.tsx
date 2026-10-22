import { Outlet, Link, useLocation } from 'react-router-dom';
import { ChevronRight, FileText, Scale, Shield } from 'lucide-react';
import { clsx } from 'clsx';
import { Container } from '../components/vitrine/Layout';
import { textLink } from '../components/vitrine/styles';

const LEGAL_PAGES = [
  { name: 'Mentions légales', path: '/legal/mentions-legales', icon: FileText, description: 'Informations légales' },
  { name: 'CGV', path: '/legal/cgv', icon: Scale, description: 'Conditions générales de vente' },
  { name: 'Politique de confidentialité', path: '/legal/privacy', icon: Shield, description: 'Protection des données' },
];

export default function LegalLayout() {
  const { pathname } = useLocation();

  return (
    <section className="py-14 md:py-20">
      <Container className="flex flex-col gap-10 lg:flex-row lg:gap-14">
        <aside className="lg:w-80 lg:shrink-0">
          <div className="flex flex-col gap-6 lg:sticky lg:top-32">
            <h2 className="text-2xl font-normal">Informations légales</h2>
            <nav aria-label="Pages légales" className="flex flex-col gap-2">
              {LEGAL_PAGES.map(({ name, path, icon: Icon, description }) => {
                const active = pathname === path;
                return (
                  <Link
                    key={path}
                    to={path}
                    aria-current={active ? 'page' : undefined}
                    className={clsx(
                      'group flex items-center gap-3 border p-4 transition-colors',
                      active ? 'border-charbon bg-charbon text-ivoire' : 'border-sable bg-papier hover:border-or',
                    )}
                  >
                    <Icon size={20} strokeWidth={1.4} className={active ? 'text-or-clair' : 'text-bronze'} aria-hidden="true" />
                    <span className="flex flex-1 flex-col">
                      <span className="font-sans text-[15px] font-medium">{name}</span>
                      <span className={clsx('mt-0.5 font-sans text-xs', active ? 'text-ivoire/75' : 'text-pierre')}>
                        {description}
                      </span>
                    </span>
                    <ChevronRight size={16} aria-hidden="true" className={clsx('transition-transform', active && 'translate-x-1')} />
                  </Link>
                );
              })}
            </nav>
            <div className="flex flex-col gap-2 border border-sable bg-lin p-6">
              <h3 className="text-lg font-bold">Une question ?</h3>
              <p className="font-serif text-sm leading-relaxed text-pierre">Notre équipe est à votre disposition.</p>
              <Link to="/contact" className={`${textLink} self-start font-sans text-sm`}>
                Nous contacter
              </Link>
            </div>
          </div>
        </aside>

        <div className="legal-content min-w-0 flex-1 border border-sable bg-papier p-6 sm:p-10 lg:p-12">
          <Outlet />
        </div>
      </Container>
    </section>
  );
}
