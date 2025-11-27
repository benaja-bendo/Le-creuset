import type { LucideIcon } from 'lucide-react';

interface ServiceDetailProps {
  title: string;
  subtitle: string;
  description: string;
  details: { title: string; text: string }[];
  image: string;
  icon: LucideIcon;
}

export default function ServiceDetail({ title, subtitle, description, details, image, icon: Icon }: ServiceDetailProps) {
  return (
    <div className="pt-24 pb-16 min-h-screen bg-secondary-950 text-secondary-200">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-900/30 text-primary-500 mb-6 border border-primary-800/50">
              <Icon size={24} />
            </div>
            <h1 className="text-4xl md:text-5xl font-serif text-white mb-6">{title}</h1>
            <p className="text-xl text-secondary-400 font-light leading-relaxed mb-8">
              {subtitle}
            </p>
            <div className="prose prose-invert prose-stone max-w-none text-secondary-300">
              <p>{description}</p>
            </div>
          </div>
          <div className="relative h-[400px] rounded-sm overflow-hidden border border-secondary-800 group shadow-2xl">
            <img 
              src={image} 
              alt={title} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-secondary-950 via-transparent to-transparent opacity-60"></div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-12">
          {details.map((item, index) => (
            <div key={index} className="bg-secondary-900/50 p-8 border border-secondary-800 hover:border-primary-700/50 transition-colors rounded-sm">
              <h3 className="text-xl font-serif text-white mb-4">{item.title}</h3>
              <p className="text-secondary-400 text-sm leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
