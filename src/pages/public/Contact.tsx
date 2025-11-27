import { Mail, MapPin, Phone } from 'lucide-react';

const SectionTitle = ({ title, subtitle }: { title: string, subtitle: string }) => (
  <div className="mb-12 text-center">
    <span className="text-primary-500 text-xs font-bold tracking-widest uppercase mb-2 block">
      {subtitle}
    </span>
    <h2 className="text-3xl md:text-4xl font-serif text-white">
      {title}
    </h2>
    <div className="w-16 h-0.5 bg-primary-600 mx-auto mt-6"></div>
  </div>
);

const Button = ({ children, className = '' }: any) => (
  <button className={`px-6 py-3 bg-primary-600 text-white hover:bg-primary-700 hover:shadow-lg hover:shadow-primary-900/20 transition-all duration-300 font-medium tracking-wide text-sm uppercase flex items-center justify-center gap-2 rounded-sm ${className}`}>
    {children}
  </button>
);

export default function Contact() {
  return (
    <div className="pt-24 pb-16 min-h-screen bg-secondary-950">
      <div className="container mx-auto px-6">
        <SectionTitle title="Contactez-nous" subtitle="Un projet ? Une question ?" />
        
        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-serif text-white mb-4">Nos Coordonnées</h3>
              <p className="text-secondary-400 mb-6 leading-relaxed">
                Notre atelier est à votre disposition pour étudier vos projets de fonderie, moulage et impression 3D.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <MapPin className="text-primary-600 mt-1" size={20} />
                <div>
                  <h4 className="text-white font-medium">L'Atelier Le Creuset</h4>
                  <p className="text-secondary-500">12 Rue des Fondeurs<br/>75003 Paris, France</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Phone className="text-primary-600" size={20} />
                <p className="text-secondary-400">+33 1 23 45 67 89</p>
              </div>
              <div className="flex items-center gap-4">
                <Mail className="text-primary-600" size={20} />
                <p className="text-secondary-400">contact@le-creuset-atelier.com</p>
              </div>
            </div>
          </div>

          <form className="bg-secondary-900 p-8 border border-secondary-800 rounded-sm shadow-xl">
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-xs text-secondary-500 uppercase mb-2">Nom</label>
                <input className="w-full bg-secondary-950 border border-secondary-800 text-white p-3 focus:border-primary-600 outline-none transition-colors rounded-sm" />
              </div>
              <div>
                <label className="block text-xs text-secondary-500 uppercase mb-2">Société</label>
                <input className="w-full bg-secondary-950 border border-secondary-800 text-white p-3 focus:border-primary-600 outline-none transition-colors rounded-sm" />
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-xs text-secondary-500 uppercase mb-2">Email</label>
              <input type="email" className="w-full bg-secondary-950 border border-secondary-800 text-white p-3 focus:border-primary-600 outline-none transition-colors rounded-sm" />
            </div>
            <div className="mb-6">
              <label className="block text-xs text-secondary-500 uppercase mb-2">Message</label>
              <textarea rows={4} className="w-full bg-secondary-950 border border-secondary-800 text-white p-3 focus:border-primary-600 outline-none transition-colors rounded-sm"></textarea>
            </div>
            <Button className="w-full">Envoyer le message</Button>
          </form>
        </div>
      </div>
    </div>
  );
}
