import { Cuboid, Settings, PenTool, Truck } from 'lucide-react';

export default function Services() {
  const services = [
    {
      icon: PenTool,
      title: "Bureau d'Études & Conception",
      description: "Notre équipe d'ingénieurs vous accompagne dès la phase de conception. Utilisation de logiciels CAO avancés pour optimiser vos pièces avant production.",
      features: ["Modélisation 3D", "Simulation de coulée", "Optimisation topologique"]
    },
    {
      icon: Cuboid,
      title: "Modelage & Prototypage",
      description: "Réalisation de modèles en bois, résine ou aluminium. Impression 3D pour le prototypage rapide et la validation de formes complexes.",
      features: ["Impression 3D grand format", "Usinage CNC 5 axes", "Finitions manuelles"]
    },
    {
      icon: Settings,
      title: "Fonderie & Coulée",
      description: "Moyens de production modernes pour la coulée gravitaire et basse pression. Maîtrise parfaite des alliages d'aluminium et de bronze.",
      features: ["Moulage sable à prise chimique", "Coquille gravité", "Contrôle spectrométrique"]
    },
    {
      icon: Truck,
      title: "Parachèvement & Logistique",
      description: "Service complet jusqu'à la livraison. Ébavurage, traitement thermique, usinage de reprise et conditionnement sur mesure.",
      features: ["Traitement thermique T6", "Usinage de précision", "Livraison JIT"]
    }
  ];

  return (
    <div className="py-20 bg-secondary-50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl font-bold text-secondary-900 mb-4">Nos Services</h1>
          <p className="text-xl text-secondary-600">
            Une offre globale intégrée, de l'étude de faisabilité à la livraison de vos pièces finies.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {services.map((service, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow border border-secondary-100 flex gap-6">
              <div className="shrink-0">
                <div className="w-16 h-16 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600">
                  <service.icon size={32} />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-secondary-900 mb-3">{service.title}</h3>
                <p className="text-secondary-600 mb-6 leading-relaxed">
                  {service.description}
                </p>
                <ul className="space-y-2">
                  {service.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-center gap-2 text-sm font-medium text-secondary-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
