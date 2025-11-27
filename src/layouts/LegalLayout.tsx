import { Outlet, Link, useLocation } from 'react-router-dom';
import { FileText, Scale, Shield, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';

import { useEffect } from 'react';

export default function LegalLayout() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const legalPages = [
    { 
      name: 'Mentions Légales', 
      path: '/legal/mentions-legales',
      icon: FileText,
      description: 'Informations légales'
    },
    { 
      name: 'CGV', 
      path: '/legal/cgv',
      icon: Scale,
      description: 'Conditions générales de vente'
    },
    { 
      name: 'Politique de confidentialité', 
      path: '/legal/privacy',
      icon: Shield,
      description: 'Protection des données'
    },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen pt-24 pb-20 bg-secondary-950">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar Navigation */}
          <aside className="lg:w-80 flex-shrink-0">
            <div className="sticky top-28">
              <h2 className="text-2xl font-serif font-bold text-white mb-6">
                Informations Légales
              </h2>
              <nav className="space-y-2">
                {legalPages.map((page) => {
                  const Icon = page.icon;
                  return (
                    <Link
                      key={page.path}
                      to={page.path}
                      className={clsx(
                        "block p-4 rounded-lg border transition-all group",
                        isActive(page.path)
                          ? "bg-primary-600 border-primary-600 text-white"
                          : "bg-secondary-900 border-secondary-800 text-secondary-300 hover:border-primary-600 hover:text-white"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon 
                          size={20} 
                          className={clsx(
                            isActive(page.path) 
                              ? "text-white" 
                              : "text-primary-500 group-hover:text-primary-400"
                          )} 
                        />
                        <div className="flex-1">
                          <div className="font-medium">{page.name}</div>
                          <div className={clsx(
                            "text-xs mt-0.5",
                            isActive(page.path) 
                              ? "text-primary-100" 
                              : "text-secondary-500"
                          )}>
                            {page.description}
                          </div>
                        </div>
                        <ChevronRight 
                          size={16} 
                          className={clsx(
                            "transition-transform",
                            isActive(page.path) && "translate-x-1"
                          )} 
                        />
                      </div>
                    </Link>
                  );
                })}
              </nav>

              {/* Contact Section */}
              <div className="mt-8 p-6 rounded-lg bg-secondary-900 border border-secondary-800">
                <h3 className="text-white font-serif font-bold mb-2">
                  Questions ?
                </h3>
                <p className="text-secondary-400 text-sm mb-4">
                  Notre équipe est à votre disposition pour toute question juridique.
                </p>
                <Link 
                  to="/contact"
                  className="text-primary-500 hover:text-primary-400 text-sm font-medium inline-flex items-center gap-2"
                >
                  Nous contacter <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <div className="bg-secondary-900 border border-secondary-800 rounded-lg p-8 lg:p-12">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
