import { ArrowRight, CheckCircle2, Factory, Hammer, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative bg-secondary-900 text-white py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1565619624098-e659884d3c36?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-secondary-900 via-secondary-900/80 to-transparent"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl space-y-6 animate-in fade-in slide-in-from-bottom-10 duration-700">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-900/30 border border-primary-700 text-primary-400 text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></span>
              Leader en Fonderie Industrielle
            </div>
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              L'Art de la <span className="text-primary-500">Fonderie</span><br />
              au Service de l'Industrie
            </h1>
            <p className="text-xl text-secondary-300 max-w-2xl leading-relaxed">
              De la conception 3D à la pièce finie, nous maîtrisons chaque étape pour donner vie à vos projets les plus complexes avec une précision inégalée.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link 
                to="/contact" 
                className="px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-primary-900/20 flex items-center gap-2"
              >
                Demander un Devis <ArrowRight size={20} />
              </Link>
              <Link 
                to="/services" 
                className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold rounded-lg transition-all border border-white/10"
              >
                Nos Services
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 -mt-20 relative z-20">
          {[
            { icon: Factory, title: "Production Industrielle", desc: "Capacité de production de la pièce unique à la grande série." },
            { icon: Hammer, title: "Savoir-faire Artisanal", desc: "Une équipe d'experts passionnés par le travail du métal." },
            { icon: ShieldCheck, title: "Qualité Certifiée", desc: "Contrôle rigoureux et respect des normes ISO 9001." },
          ].map((feature, idx) => (
            <div key={idx} className="bg-white p-8 rounded-xl shadow-xl border border-secondary-100 hover:shadow-2xl transition-shadow group">
              <div className="w-14 h-14 bg-primary-50 rounded-lg flex items-center justify-center text-primary-600 mb-6 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                <feature.icon size={32} />
              </div>
              <h3 className="text-xl font-bold text-secondary-900 mb-3">{feature.title}</h3>
              <p className="text-secondary-600 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-16">
          <div className="w-full md:w-1/2 relative">
            <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2070&auto=format&fit=crop" 
                alt="Atelier de fonderie" 
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-xl shadow-xl border border-secondary-100 max-w-xs hidden md:block">
              <p className="text-4xl font-bold text-primary-600 mb-1">35+</p>
              <p className="text-sm font-medium text-secondary-600">Années d'expérience dans la fonderie de précision</p>
            </div>
          </div>
          <div className="w-full md:w-1/2 space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary-900">
              Une expertise reconnue dans le <span className="text-primary-600">modelage industriel</span>
            </h2>
            <p className="text-secondary-600 text-lg leading-relaxed">
              Notre fonderie allie tradition et innovation technologique. Nous disposons d'un bureau d'études intégré équipé des derniers logiciels de CAO/DAO pour concevoir vos outillages avec une précision millimétrique.
            </p>
            <ul className="space-y-4 pt-4">
              {[
                "Conception et réalisation de modèles",
                "Fonderie aluminium et alliages légers",
                "Usinage et finition de précision",
                "Traitements de surface"
              ].map((item, idx) => (
                <li key={idx} className="flex items-center gap-3 text-secondary-700 font-medium">
                  <CheckCircle2 size={20} className="text-primary-500" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="pt-6">
              <Link to="/services" className="text-primary-600 font-semibold hover:text-primary-700 flex items-center gap-2 group">
                Découvrir notre savoir-faire 
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
