import { Outlet, Link, useLocation } from 'react-router-dom';
import { Flame, Menu, X, Phone, Mail, MapPin, Facebook, Linkedin, Instagram } from 'lucide-react';
import { useState } from 'react';
import { clsx } from 'clsx';

export default function PublicLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { name: 'Accueil', path: '/' },
    { name: 'Services', path: '/services' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans text-secondary-900">
      {/* Top Bar */}
      <div className="bg-secondary-900 text-secondary-300 py-2 text-sm hidden md:block">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex space-x-6">
            <span className="flex items-center gap-2"><Phone size={14} className="text-primary-500" /> +33 1 23 45 67 89</span>
            <span className="flex items-center gap-2"><Mail size={14} className="text-primary-500" /> contact@fonderie-industrielle.fr</span>
          </div>
          <div className="flex space-x-4">
            <a href="#" className="hover:text-primary-400 transition-colors"><Linkedin size={16} /></a>
            <a href="#" className="hover:text-primary-400 transition-colors"><Facebook size={16} /></a>
            <a href="#" className="hover:text-primary-400 transition-colors"><Instagram size={16} /></a>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-secondary-100 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-primary-600 p-2 rounded-lg text-white group-hover:bg-primary-700 transition-colors">
              <Flame size={24} fill="currentColor" />
            </div>
            <span className="text-xl font-bold tracking-tight text-secondary-900">
              FONDERIE<span className="text-primary-600">IND</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={clsx(
                  "text-sm font-medium transition-colors hover:text-primary-600",
                  isActive(link.path) ? "text-primary-600" : "text-secondary-600"
                )}
              >
                {link.name}
              </Link>
            ))}
            <Link
              to="/client"
              className="ml-4 px-5 py-2.5 bg-secondary-900 text-white text-sm font-medium rounded-full hover:bg-secondary-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Espace Client
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-secondary-600 hover:text-primary-600 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-secondary-100 shadow-lg py-4 px-4 flex flex-col gap-4 animate-in slide-in-from-top-5">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={clsx(
                  "text-base font-medium py-2 border-b border-secondary-50",
                  isActive(link.path) ? "text-primary-600" : "text-secondary-600"
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <Link
              to="/client"
              className="mt-2 px-5 py-3 bg-secondary-900 text-white text-center font-medium rounded-lg hover:bg-secondary-800"
              onClick={() => setIsMenuOpen(false)}
            >
              Espace Client
            </Link>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-secondary-900 text-secondary-300 py-12 border-t border-secondary-800">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-white">
              <Flame size={20} className="text-primary-500" fill="currentColor" />
              <span className="text-lg font-bold">FONDERIE<span className="text-primary-500">IND</span></span>
            </div>
            <p className="text-sm text-secondary-400 leading-relaxed">
              Excellence en fonderie industrielle, conception et modelage depuis 1985.
              Précision et qualité pour vos projets les plus exigeants.
            </p>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Navigation</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-primary-400 transition-colors">Accueil</Link></li>
              <li><Link to="/services" className="hover:text-primary-400 transition-colors">Nos Services</Link></li>
              <li><Link to="/contact" className="hover:text-primary-400 transition-colors">Contact</Link></li>
              <li><Link to="/client" className="hover:text-primary-400 transition-colors">Espace Client</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Services</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-primary-400 transition-colors">Conception 3D</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">Modelage</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">Fonderie Aluminium</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">Usinage de Précision</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-primary-500 mt-0.5" />
                <span>123 Zone Industrielle Nord<br />69000 Lyon, France</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-primary-500" />
                <span>+33 1 23 45 67 89</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-primary-500" />
                <span>contact@fonderie-industrielle.fr</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-12 pt-8 border-t border-secondary-800 text-center text-xs text-secondary-500">
          &copy; {new Date().getFullYear()} Fonderie Industrielle. Tous droits réservés.
        </div>
      </footer>
    </div>
  );
}
