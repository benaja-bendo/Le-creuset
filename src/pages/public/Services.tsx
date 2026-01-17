import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { 
  Flame, 
  Printer, 
  Layers, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Award,
  Users,
  Target,
  Sparkles
} from 'lucide-react';

// Import Assets
import fonteImg from '../../assets/fonte.png';
import impressionImg from '../../assets/impression-3d.png';
import moulageImg from '../../assets/moulage.png';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, useGSAP);

const ServiceCard = ({ 
  title, 
  description, 
  icon: Icon, 
  image, 
  link, 
  index 
}: { 
  title: string; 
  description: string; 
  icon: any; 
  image: string; 
  link: string;
  index: number;
}) => {
  const cardRef = useRef(null);

  useGSAP(() => {
    gsap.from(cardRef.current, {
      y: 50,
      opacity: 0,
      duration: 0.8,
      delay: index * 0.2,
      ease: "power3.out",
      scrollTrigger: {
        trigger: cardRef.current,
        start: "top bottom-=100",
      }
    });
  }, { scope: cardRef });

  return (
    <div ref={cardRef} className="group relative overflow-hidden rounded-lg bg-secondary-900 border border-secondary-800 hover:border-primary-600 transition-all duration-500">
      {/* Image Background with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-secondary-950 via-secondary-950/80 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 p-8 h-full flex flex-col justify-end min-h-[400px]">
        <div className="mb-4 w-12 h-12 bg-primary-600/20 rounded-lg flex items-center justify-center text-primary-500 group-hover:bg-primary-600 group-hover:text-white transition-colors duration-300">
          <Icon size={24} />
        </div>
        
        <h3 className="text-2xl font-serif font-bold text-white mb-3 group-hover:text-primary-500 transition-colors">
          {title}
        </h3>
        
        <p className="text-secondary-400 mb-6 line-clamp-3 group-hover:text-secondary-300 transition-colors">
          {description}
        </p>

        <Link 
          to={link}
          className="inline-flex items-center gap-2 text-primary-500 font-medium tracking-wide uppercase text-xs hover:text-white transition-colors"
        >
          En savoir plus <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
};

const ProcessStep = ({ number, title, description, index }: { number: string; title: string; description: string; index: number }) => {
  const stepRef = useRef(null);

  useGSAP(() => {
    gsap.from(stepRef.current, {
      x: index % 2 === 0 ? -50 : 50,
      opacity: 0,
      duration: 0.8,
      scrollTrigger: {
        trigger: stepRef.current,
        start: "top bottom-=50",
      }
    });
  }, { scope: stepRef });

  return (
    <div ref={stepRef} className="relative">
      <div className="flex items-start gap-6">
        <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-primary-600/30">
          {number}
        </div>
        <div className="flex-1 pt-2">
          <h3 className="text-xl font-serif font-bold text-white mb-2">{title}</h3>
          <p className="text-secondary-400 leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
};

const Benefit = ({ icon: Icon, title, description, index }: { icon: any; title: string; description: string; index: number }) => {
  const benefitRef = useRef(null);

  useGSAP(() => {
    gsap.from(benefitRef.current, {
      y: 30,
      opacity: 0,
      duration: 0.6,
      delay: index * 0.1,
      scrollTrigger: {
        trigger: benefitRef.current,
        start: "top bottom-=50",
      }
    });
  }, { scope: benefitRef });

  return (
    <div ref={benefitRef} className="flex items-start gap-4 p-6 rounded-lg bg-secondary-900/50 border border-secondary-800 hover:border-primary-600/50 transition-all">
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary-600/20 flex items-center justify-center text-primary-500">
        <Icon size={20} />
      </div>
      <div>
        <h4 className="text-white font-medium mb-1">{title}</h4>
        <p className="text-sm text-secondary-500">{description}</p>
      </div>
    </div>
  );
};

export default function Services() {
  const containerRef = useRef(null);
  const titleRef = useRef(null);
  const processRef = useRef(null);
  const whyUsRef = useRef(null);

  useGSAP(() => {
    gsap.from(titleRef.current, {
      y: -30,
      opacity: 0,
      duration: 1,
      ease: "power3.out"
    });

    gsap.from(processRef.current, {
      opacity: 0,
      duration: 0.8,
      scrollTrigger: {
        trigger: processRef.current,
        start: "top center+=100",
      }
    });

    gsap.from(whyUsRef.current, {
      opacity: 0,
      duration: 0.8,
      scrollTrigger: {
        trigger: whyUsRef.current,
        start: "top center+=100",
      }
    });
  }, { scope: containerRef });

  const services = [
    {
      title: "Fonte à Cire Perdue",
      description: "L'alchimie entre tradition millénaire et technologies modernes. Nous garantissons une qualité de surface exceptionnelle pour vos métaux précieux.",
      icon: Flame,
      image: fonteImg,
      link: "/fonte"
    },
    {
      title: "Impression 3D",
      description: "La précision du numérique au service de votre créativité. Transformation de vos fichiers CAD en objets physiques avec nos résines calcinables.",
      icon: Printer,
      image: impressionImg,
      link: "/impression"
    },
    {
      title: "Moulage",
      description: "Dupliquer l'unique pour créer la série. Moules en silicone ou caoutchouc réalisés avec une découpe experte.",
      icon: Layers,
      image: moulageImg,
      link: "/moulage"
    }
  ];

  const processSteps = [
    {
      number: "01",
      title: "Consultation & Analyse",
      description: "Nous étudions vos besoins, analysons vos fichiers ou vos pièces modèles, et vous conseillons sur la meilleure approche technique."
    },
    {
      number: "02",
      title: "Préparation & Prototypage",
      description: "Impression 3D de vos modèles en résine calcinable ou création de moules selon votre projet. Validation avant production."
    },
    {
      number: "03",
      title: "Production",
      description: "Fonte à cire perdue de vos pièces en métaux précieux ou communs avec un contrôle qualité rigoureux à chaque étape."
    },
    {
      number: "04",
      title: "Finition & Livraison",
      description: "Ébavurage, polissage et finitions selon vos spécifications. Livraison sécurisée de vos pièces finalisées."
    }
  ];

  const benefits = [
    {
      icon: Award,
      title: "Excellence Artisanale",
      description: "Savoir-faire ancestral combiné aux technologies de pointe"
    },
    {
      icon: Clock,
      title: "Délais Respectés",
      description: "Engagement sur les délais avec suivi en temps réel"
    },
    {
      icon: CheckCircle2,
      title: "Qualité Garantie",
      description: "Contrôle qualité à chaque étape de production"
    },
    {
      icon: Users,
      title: "Accompagnement Personnalisé",
      description: "Conseil expert du design à la réalisation"
    },
    {
      icon: Target,
      title: "Précision Maximale",
      description: "Tolérances serrées et respect des spécifications"
    },
    {
      icon: Sparkles,
      title: "Innovation Continue",
      description: "Veille technologique et amélioration constante"
    }
  ];

  return (
    <div ref={containerRef} className="min-h-screen pt-24 pb-20">
      {/* Hero Section */}
      <div className="container mx-auto px-6">
        <div ref={titleRef} className="text-center max-w-3xl mx-auto mb-20">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">
            Nos Savoir-Faire
          </h1>
          <p className="text-lg text-secondary-400 leading-relaxed">
            De la conception numérique à la réalisation physique, nous maîtrisons chaque étape 
            de la chaîne de production pour donner vie à vos créations les plus ambitieuses.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
          {services.map((service, index) => (
            <ServiceCard 
              key={index}
              {...service}
              index={index}
            />
          ))}
        </div>
      </div>

      {/* Process Section */}
      <div className="bg-secondary-900/30 py-20 mb-32">
        <div className="container mx-auto px-6">
          <div ref={processRef}>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">
                Notre Processus
              </h2>
              <p className="text-secondary-400">
                De votre idée à l'objet final, un parcours maîtrisé en 4 étapes
              </p>
            </div>

            <div className="max-w-4xl mx-auto space-y-12">
              {processSteps.map((step, index) => (
                <ProcessStep key={index} {...step} index={index} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="container mx-auto px-6 mb-32">
        <div ref={whyUsRef}>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">
              Pourquoi Nous Choisir
            </h2>
            <p className="text-secondary-400">
              L'engagement Le Creuset pour votre réussite
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <Benefit key={index} {...benefit} index={index} />
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-6">
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-serif font-bold text-white mb-4">
            Prêt à Concrétiser Votre Projet ?
          </h2>
          <p className="text-primary-100 mb-8 max-w-2xl mx-auto">
            Que vous soyez créateur de bijoux, designer d'objets d'art ou industriel, 
            nous avons la solution pour transformer vos idées en réalité.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/client" 
              className="px-8 py-3 rounded-full bg-white text-primary-600 font-medium hover:bg-secondary-100 transition-colors inline-block"
            >
              Demander un devis (Espace client)
            </Link>
            <Link 
              to="/contact" 
              className="px-8 py-3 rounded-full border-2 border-white text-white font-medium hover:bg-white hover:text-primary-600 transition-all inline-block"
            >
              Nous contacter
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
