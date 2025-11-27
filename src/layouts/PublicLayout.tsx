import { Outlet, Link, useLocation } from 'react-router-dom';
import { Hammer, Menu, X, Instagram, Linkedin, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { clsx } from 'clsx';

const CustomLogo = ({ className = "", size = 48 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 200 150"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Creuset */}
    <path
      d="M50 30 L150 30 L135 120 L65 120 Z"
      fill="url(#bronzeGradient)"
      stroke="#78350f"
      strokeWidth="2"
    />
    {/* Métal en fusion */}
    <path
      d="M70 40 Q100 60, 100 90 T100 130 L100 140 L90 140 Z"
      fill="url(#goldGradient)"
    />
    <path
      d="M130 40 Q100 60, 100 90 T100 130 L100 140 L110 140 Z"
      fill="url(#goldGradient)"
    />
    <circle cx="100" cy="35" r="15" fill="url(#goldGradient)" />
    {/* Bague et Diamant */}
    <path
      d="M80 90 Q100 70, 120 90 T100 115 Z"
      fill="none"
      stroke="url(#goldGradient)"
      strokeWidth="3"
    />
    <path
      d="M95 70 L105 70 L100 85 Z"
      fill="none"
      stroke="url(#goldGradient)"
      strokeWidth="2"
    />
    <path
      d="M95 65 L105 65 L100 50 Z"
      fill="url(#diamondGradient)"
      stroke="white"
      strokeWidth="1"
    />
    
    {/* Définition des dégradés */}
    <defs>
      <linearGradient id="bronzeGradient" x1="50" y1="30" x2="150" y2="120" gradientUnits="userSpaceOnUse">
        <stop stopColor="#a16207" />
        <stop offset="1" stopColor="#78350f" />
      </linearGradient>
      <linearGradient id="goldGradient" x1="70" y1="35" x2="130" y2="140" gradientUnits="userSpaceOnUse">
        <stop stopColor="#f59e0b" />
        <stop offset="0.5" stopColor="#d97706" />
        <stop offset="1" stopColor="#b45309" />
      </linearGradient>
      <linearGradient id="diamondGradient" x1="95" y1="65" x2="100" y2="50" gradientUnits="userSpaceOnUse">
        <stop stopColor="white" />
        <stop offset="1" stopColor="#e5e7eb" />
      </linearGradient>
    </defs>
  </svg>
);

export default function PublicLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    setIsMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { name: 'Accueil', path: '/' },
    { name: 'Nos Services', path: '/services' },
    { name: 'Devis en ligne', path: '/quote' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-secondary-950 font-sans text-secondary-100 selection:bg-primary-900 selection:text-white">
      
      {/* Navigation */}
      <nav className={clsx(
        "fixed w-full z-50 transition-all duration-500 border-b",
        scrolled ? "bg-secondary-950/95 backdrop-blur-md border-secondary-900 py-4 shadow-xl" : "bg-transparent border-transparent py-6"
      )}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 cursor-pointer z-50 group">
            <div className="w-8 h-8 bg-primary-600 rounded-sm flex items-center justify-center text-secondary-950 group-hover:bg-primary-500 transition-colors">
              <CustomLogo size={48} />
            </div>
            <span className="text-2xl font-serif font-bold tracking-wide text-white">
              LE CREUSET
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <Link 
                key={link.path}
                to={link.path}
                className={clsx(
                  "text-xs uppercase tracking-widest hover:text-primary-500 transition-colors",
                  isActive(link.path) ? "text-primary-500 font-bold" : "text-secondary-300"
                )}
              >
                {link.name}
              </Link>
            ))}
            <Link 
              to="/client"
              className="flex items-center gap-2 px-4 py-2 border border-secondary-700 rounded-sm hover:border-primary-600 hover:text-primary-500 transition-all text-xs uppercase tracking-wider"
            >
              <User size={14} />
              <span>Espace Client</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-white z-50 hover:text-primary-500 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div className="fixed inset-0 bg-secondary-950 z-40 flex flex-col items-center justify-center space-y-8 md:hidden animate-in fade-in duration-300">
            {navLinks.map(link => (
              <Link 
                key={link.path}
                to={link.path}
                className={clsx(
                  "text-2xl font-serif hover:text-primary-500 transition-colors",
                  isActive(link.path) ? "text-primary-500" : "text-white"
                )}
              >
                {link.name}
              </Link>
            ))}
            <Link 
              to="/client"
              className="mt-8 px-8 py-3 border border-secondary-700 text-primary-500 hover:bg-secondary-900"
            >
              Espace Client
            </Link>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-secondary-950 border-t border-secondary-900 pt-16 pb-8">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-6 h-6 bg-secondary-800 rounded-sm flex items-center justify-center text-primary-600">
                  <Hammer size={14} />
                </div>
                <span className="text-lg font-serif font-bold text-white">LE CREUSET</span>
              </div>
              <p className="text-secondary-500 text-sm leading-relaxed">
                L'excellence de la fonderie d'art et de bijouterie. 
                Nous accompagnons les créateurs de l'idée à l'objet.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-serif mb-4">Services</h4>
              <ul className="space-y-2 text-sm text-secondary-400">
                <li><Link to="/fonte" className="hover:text-primary-500 transition-colors">Fonte cire perdue</Link></li>
                <li><Link to="/impression" className="hover:text-primary-500 transition-colors">Impression 3D</Link></li>
                <li><Link to="/moulage" className="hover:text-primary-500 transition-colors">Moulage</Link></li>
                <li><Link to="/contact" className="hover:text-primary-500 transition-colors">Devis sur mesure</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-serif mb-4">Légal</h4>
              <ul className="space-y-2 text-sm text-secondary-400">
                <li><a href="#" className="hover:text-primary-500 transition-colors">Mentions Légales</a></li>
                <li><a href="#" className="hover:text-primary-500 transition-colors">CGV</a></li>
                <li><a href="#" className="hover:text-primary-500 transition-colors">Politique de confidentialité</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-serif mb-4">Suivez-nous</h4>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 bg-secondary-900 flex items-center justify-center text-secondary-400 hover:bg-primary-600 hover:text-white transition-all rounded-sm">
                  <Instagram size={18} />
                </a>
                <a href="#" className="w-10 h-10 bg-secondary-900 flex items-center justify-center text-secondary-400 hover:bg-primary-600 hover:text-white transition-all rounded-sm">
                  <Linkedin size={18} />
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-secondary-900 pt-8 text-center text-xs text-secondary-600">
            &copy; {new Date().getFullYear()} Le Creuset. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
}
