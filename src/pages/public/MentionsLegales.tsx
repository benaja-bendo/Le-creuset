export default function MentionsLegales() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-8">
        Mentions Légales
      </h1>

      <div className="space-y-8 text-secondary-300">
        <section>
          <h2 className="text-2xl font-serif font-bold text-white mb-4">
            Éditeur du site
          </h2>
          <div className="space-y-2">
            <p><strong className="text-white">Raison sociale :</strong> [NOM DE LA SOCIÉTÉ]</p>
            <p><strong className="text-white">Forme juridique :</strong> [SAS / SARL / Auto-entrepreneur]</p>
            <p><strong className="text-white">Capital social :</strong> [MONTANT] euros</p>
            <p><strong className="text-white">SIRET :</strong> [NUMÉRO SIRET]</p>
            <p><strong className="text-white">N° TVA intracommunautaire :</strong> [NUMÉRO TVA]</p>
            <p><strong className="text-white">Siège social :</strong><br />
              [ADRESSE COMPLÈTE]<br />
              [CODE POSTAL] [VILLE]
            </p>
            <p><strong className="text-white">Téléphone :</strong> [NUMÉRO]</p>
            <p><strong className="text-white">Email :</strong> [EMAIL]</p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-serif font-bold text-white mb-4">
            Directeur de publication
          </h2>
          <p>[NOM DU DIRECTEUR DE PUBLICATION]</p>
        </section>

        <section>
          <h2 className="text-2xl font-serif font-bold text-white mb-4">
            Hébergement
          </h2>
          <p>Ce site est hébergé par :</p>
          <div className="space-y-2">
            <p><strong className="text-white">GitHub Pages</strong></p>
            <p>GitHub, Inc.<br />
            88 Colin P Kelly Jr St<br />
            San Francisco, CA 94107<br />
            United States</p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-serif font-bold text-white mb-4">
            Propriété intellectuelle
          </h2>
          <p>
            L'ensemble de ce site relève de la législation française et internationale sur le droit d'auteur 
            et la propriété intellectuelle. Tous les droits de reproduction sont réservés, y compris pour les 
            documents téléchargeables et les représentations iconographiques et photographiques.
          </p>
          <p>
            La reproduction de tout ou partie de ce site sur un support électronique quel qu'il soit est 
            formellement interdite sauf autorisation expresse du directeur de la publication.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-serif font-bold text-white mb-4">
            Crédits
          </h2>
          <p><strong className="text-white">Conception et réalisation :</strong> [NOM]</p>
          <p><strong className="text-white">Photographies :</strong> [SOURCES DES IMAGES]</p>
          <p><strong className="text-white">Icônes :</strong> Lucide Icons</p>
        </section>

        <section>
          <h2 className="text-2xl font-serif font-bold text-white mb-4">
            Responsabilité
          </h2>
          <p>
            Les informations contenues sur ce site sont aussi précises que possible et le site est 
            périodiquement remis à jour, mais peut toutefois contenir des inexactitudes, des omissions 
            ou des lacunes. Si vous constatez une lacune, erreur ou ce qui paraît être un dysfonctionnement, 
            merci de bien vouloir le signaler par email en décrivant le problème de la manière la plus 
            précise possible.
          </p>
          <p>
            Le Creuset se réserve le droit de corriger, à tout moment et sans préavis, le contenu de ce site.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-serif font-bold text-white mb-4">
            Liens hypertextes
          </h2>
          <p>
            Les liens hypertextes mis en place dans le cadre du présent site internet en direction d'autres 
            ressources présentes sur le réseau Internet ne sauraient engager la responsabilité de Le Creuset.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-serif font-bold text-white mb-4">
            Litiges
          </h2>
          <p>
            Les présentes conditions du site sont régies par les lois françaises et toute contestation ou 
            litige qui pourrait naître de l'interprétation ou de l'exécution de celles-ci sera de la 
            compétence exclusive des tribunaux dont dépend le siège social de la société. La langue de 
            référence, pour le règlement de contentieux éventuels, est le français.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-serif font-bold text-white mb-4">
            Données personnelles
          </h2>
          <p>
            De manière générale, vous n'êtes pas tenu de nous communiquer vos données personnelles lorsque 
            vous visitez notre site Internet. Pour plus d'informations, consultez notre{' '}
            <a href="/legal/privacy" className="text-primary-500 hover:text-primary-400 underline">
              Politique de confidentialité
            </a>.
          </p>
        </section>
      </div>

      <div className="mt-12 pt-6 border-t border-secondary-800">
        <p className="text-sm text-secondary-500">
          Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>
    </div>
  );
}
