import { Mail, MapPin, Phone, Send } from 'lucide-react';

export default function Contact() {
  return (
    <div className="py-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Info */}
          <div>
            <h1 className="text-4xl font-bold text-secondary-900 mb-6">Parlons de votre projet</h1>
            <p className="text-xl text-secondary-600 mb-12 leading-relaxed">
              Notre équipe technique est à votre disposition pour étudier vos besoins et vous proposer les solutions les plus adaptées.
            </p>

            <div className="space-y-8">
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center text-primary-600 shrink-0">
                  <MapPin size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-secondary-900 mb-1">Notre Atelier</h3>
                  <p className="text-secondary-600">
                    123 Zone Industrielle Nord<br />
                    69000 Lyon, France
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center text-primary-600 shrink-0">
                  <Phone size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-secondary-900 mb-1">Téléphone</h3>
                  <p className="text-secondary-600">
                    +33 1 23 45 67 89
                  </p>
                  <p className="text-sm text-secondary-400 mt-1">Du Lundi au Vendredi, 8h-18h</p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center text-primary-600 shrink-0">
                  <Mail size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-secondary-900 mb-1">Email</h3>
                  <p className="text-secondary-600">
                    contact@fonderie-industrielle.fr
                  </p>
                  <p className="text-sm text-secondary-400 mt-1">Réponse sous 24h</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-secondary-100">
            <h2 className="text-2xl font-bold text-secondary-900 mb-6">Envoyez-nous un message</h2>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstname" className="block text-sm font-medium text-secondary-700 mb-2">Prénom</label>
                  <input 
                    type="text" 
                    id="firstname" 
                    className="w-full px-4 py-3 rounded-lg border border-secondary-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                    placeholder="Jean"
                  />
                </div>
                <div>
                  <label htmlFor="lastname" className="block text-sm font-medium text-secondary-700 mb-2">Nom</label>
                  <input 
                    type="text" 
                    id="lastname" 
                    className="w-full px-4 py-3 rounded-lg border border-secondary-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                    placeholder="Dupont"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-secondary-700 mb-2">Email professionnel</label>
                <input 
                  type="email" 
                  id="email" 
                  className="w-full px-4 py-3 rounded-lg border border-secondary-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                  placeholder="jean.dupont@entreprise.com"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-secondary-700 mb-2">Votre projet</label>
                <textarea 
                  id="message" 
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-secondary-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all resize-none"
                  placeholder="Décrivez votre besoin..."
                ></textarea>
              </div>

              <button 
                type="submit" 
                className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Send size={20} />
                Envoyer ma demande
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
