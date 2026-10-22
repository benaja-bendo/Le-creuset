import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import SiteFooter from '../components/vitrine/SiteFooter';
import SiteHeader from '../components/vitrine/SiteHeader';

export default function PublicLayout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  return (
    <div className="vitrine flex min-h-screen flex-col bg-ivoire font-serif text-charbon">
      <a
        href="#contenu"
        className="sr-only z-[60] bg-ivoire px-4 py-3 font-sans text-sm text-charbon focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Aller au contenu
      </a>
      <SiteHeader />
      <main id="contenu" className="flex-grow">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}
