import { Flame, Layers, Printer, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import fonteImg from '../../assets/fonte.png';
import impressionImg from '../../assets/impression-3d.png';
import moulageImg from '../../assets/moulage.png';

const Button = ({ children, variant = 'primary', onClick, className = '' }: any) => {
  const baseStyle = "px-8 py-4 transition-all duration-300 font-semibold tracking-widest text-sm uppercase flex items-center justify-center gap-2";
  const variants: any = {
    primary: "bg-primary-400 text-secondary-900 hover:bg-primary-500 hover:-translate-y-1 shadow-lg",
    outline: "border border-primary-400 text-primary-400 hover:bg-primary-400 hover:text-secondary-900",
  };
  return (
    <button onClick={onClick} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

const SectionTitle = ({ title, subtitle }: { title: string, subtitle: string }) => (
  <div className="mb-16 text-center">
    <span className="text-primary-400 text-xs font-bold tracking-[0.2em] uppercase mb-4 block">
      {subtitle}
    </span>
    <h2 className="text-4xl md:text-5xl font-serif text-white mb-6">
      {title}
    </h2>
    <div className="w-20 h-0.5 bg-primary-400 mx-auto"></div>
  </div>
);

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="bg-secondary-900">
      {/* Hero Section */}
      <div className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80" 
            alt="Atelier de fonderie" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-secondary-900"></div>
        </div>

        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-10 duration-1000">
          <h1 className="text-5xl md:text-7xl font-serif text-white mb-8 leading-tight">
            L'Art de la Fonderie <br />
            <span className="text-primary-400 italic">& La Précision du Bijou</span>
          </h1>
          <p className="text-secondary-200 text-lg md:text-xl mb-12 font-light max-w-2xl mx-auto leading-relaxed tracking-wide">
            De la matière brute à l'éclat final. Nous façonnons vos idées les plus précieuses avec une expertise industrielle et une âme d'artisan.
          </p>
          <div className="flex flex-col md:flex-row gap-6 justify-center">
            <Button onClick={() => navigate('/quote')}>
              <div className="flex items-center gap-2">
                <Upload size={18} />
                <span>Déposer un fichier 3D</span>
              </div>
            </Button>
            <Button variant="outline" onClick={() => navigate('/fonte')}>Découvrir nos services</Button>
          </div>
        </div>
      </div>

      {/* Target Audience Section */}
      <section className="py-24 bg-secondary-900 border-b border-secondary-800">
        <div className="container mx-auto px-6 text-center">
          <h3 className="text-secondary-400 text-sm uppercase tracking-[0.2em] mb-12">Nous travaillons pour</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { title: "Artisans Bijoutiers", desc: "Des fontes précises respectant votre travail de cire." },
              { title: "Créateurs Indépendants", desc: "Accompagnement technique du fichier 3D au métal." },
              { title: "Entreprises", desc: "Production de série et externalisation de qualité." }
            ].map((target, i) => (
              <div key={i} className="p-8 hover:bg-secondary-800 transition-all duration-500 rounded-sm group border border-transparent hover:border-primary-900">
                <div className="w-3 h-3 bg-primary-400 mx-auto mb-6 rounded-full group-hover:scale-150 transition-transform shadow-[0_0_15px_rgba(212,175,55,0.5)]"></div>
                <h4 className="text-white text-xl font-serif mb-4">{target.title}</h4>
                <p className="text-secondary-400 text-sm leading-relaxed">{target.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-32 bg-secondary-900">
        <div className="container mx-auto px-6">
          <SectionTitle title="Nos Savoir-Faire" subtitle="Expertise" />
          <div className="grid md:grid-cols-3 gap-8">
            
            {/* Impression 3D */}
            <div 
              onClick={() => navigate('/impression')}
              className="group relative h-[500px] bg-secondary-800 cursor-pointer overflow-hidden border border-secondary-800 hover:border-primary-400/50 transition-all duration-500"
            >
              <div className="absolute inset-0 z-0">
                <img 
                  src={impressionImg} 
                  alt="Impression 3D" 
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-40 group-hover:scale-110 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-secondary-900 via-transparent to-transparent"></div>
              </div>
              
              <div className="absolute inset-0 flex flex-col justify-end p-8 z-10">
                <div className="mb-auto pt-8 opacity-0 group-hover:opacity-100 transition-all duration-500 -translate-y-4 group-hover:translate-y-0">
                  <Printer size={32} className="text-primary-400 mb-4" />
                </div>
                <h3 className="text-3xl font-serif text-white mb-3 group-hover:text-primary-400 transition-colors">Impression 3D</h3>
                <p className="text-secondary-300 text-sm leading-relaxed opacity-80 group-hover:opacity-100">
                  Prototypage et cires calcinables haute résolution pour une précision micrométrique.
                </p>
              </div>
            </div>

            {/* Moulage */}
            <div 
              onClick={() => navigate('/moulage')}
              className="group relative h-[500px] bg-secondary-800 cursor-pointer overflow-hidden border border-secondary-800 hover:border-primary-400/50 transition-all duration-500"
            >
              <div className="absolute inset-0 z-0">
                <img 
                  src={moulageImg} 
                  alt="Moulage" 
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-40 group-hover:scale-110 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-secondary-900 via-transparent to-transparent"></div>
              </div>
              
              <div className="absolute inset-0 flex flex-col justify-end p-8 z-10">
                <div className="mb-auto pt-8 opacity-0 group-hover:opacity-100 transition-all duration-500 -translate-y-4 group-hover:translate-y-0">
                  <Layers size={32} className="text-primary-400 mb-4" />
                </div>
                <h3 className="text-3xl font-serif text-white mb-3 group-hover:text-primary-400 transition-colors">Moulage</h3>
                <p className="text-secondary-300 text-sm leading-relaxed opacity-80 group-hover:opacity-100">
                  Duplication précise via moules silicone ou caoutchouc pour vos séries.
                </p>
              </div>
            </div>

            {/* Fonte */}
            <div 
              onClick={() => navigate('/fonte')}
              className="group relative h-[500px] bg-secondary-800 cursor-pointer overflow-hidden border border-secondary-800 hover:border-primary-400/50 transition-all duration-500"
            >
              <div className="absolute inset-0 z-0">
                <img 
                  src={fonteImg} 
                  alt="Fonte" 
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-40 group-hover:scale-110 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-secondary-900 via-transparent to-transparent"></div>
              </div>
              
              <div className="absolute inset-0 flex flex-col justify-end p-8 z-10">
                <div className="mb-auto pt-8 opacity-0 group-hover:opacity-100 transition-all duration-500 -translate-y-4 group-hover:translate-y-0">
                  <Flame size={32} className="text-primary-400 mb-4" />
                </div>
                <h3 className="text-3xl font-serif text-white mb-3 group-hover:text-primary-400 transition-colors">Fonte à cire perdue</h3>
                <p className="text-secondary-300 text-sm leading-relaxed opacity-80 group-hover:opacity-100">
                  Or, Argent, Bronze et Laiton. Maîtrise de la fusion pour des pièces uniques.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
