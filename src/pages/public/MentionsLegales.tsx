import { EmailLink, PhoneLink } from '../../components/legal/ContactLinks';
import { LEGAL_LAST_UPDATED, LEGAL_PENDING } from '../../lib/legal';

export default function MentionsLegales() {
  return (
    <div className="max-w-none">
      <h1 className="text-3xl md:text-4xl font-serif font-normal text-charbon mb-8">
        Mentions Légales
      </h1>

      <div className="space-y-8 font-serif text-base leading-[1.8] text-charbon">
        <section>
          <h2 className="text-2xl font-serif font-normal text-charbon mb-4">
            Éditeur du site
          </h2>
          <div className="space-y-2">
            <p><strong className="text-charbon">Dénomination :</strong> La Grenaille</p>
            <p>{LEGAL_PENDING.status}</p>
            <p><strong className="text-charbon">Siège social :</strong> {LEGAL_PENDING.address}</p>
            <p><strong className="text-charbon">Téléphone :</strong> <PhoneLink /></p>
            <p><strong className="text-charbon">Email :</strong> <EmailLink /></p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-serif font-normal text-charbon mb-4">
            Directeur de publication
          </h2>
          <p>{LEGAL_PENDING.director}</p>
        </section>

        <section>
          <h2 className="text-2xl font-serif font-normal text-charbon mb-4">
            Hébergement
          </h2>
          <p>Ce site est hébergé par :</p>
          <div className="space-y-2">
            <p><strong className="text-charbon">Infomaniak Network SA</strong></p>
            <p>Rue Eugène Marziano 25<br />
            1227 Les Acacias (Genève)<br />
            Suisse</p>
            <p>
              <a
                href="https://www.infomaniak.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-bronze underline decoration-or underline-offset-4 hover:text-charbon"
              >
                www.infomaniak.com
              </a>
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-serif font-normal text-charbon mb-4">
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
          <h2 className="text-2xl font-serif font-normal text-charbon mb-4">
            Crédits
          </h2>
          <p><strong className="text-charbon">Conception et réalisation :</strong> Benaja Bendo</p>
        </section>

        <section>
          <h2 className="text-2xl font-serif font-normal text-charbon mb-4">
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
            La Grenaille se réserve le droit de corriger, à tout moment et sans préavis, le contenu de ce site.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-serif font-normal text-charbon mb-4">
            Liens hypertextes
          </h2>
          <p>
            Les liens hypertextes mis en place dans le cadre du présent site internet en direction d'autres 
            ressources présentes sur le réseau Internet ne sauraient engager la responsabilité de La Grenaille.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-serif font-normal text-charbon mb-4">
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
          <h2 className="text-2xl font-serif font-normal text-charbon mb-4">
            Données personnelles
          </h2>
          <p>
            De manière générale, vous n'êtes pas tenu de nous communiquer vos données personnelles lorsque 
            vous visitez notre site Internet. Pour plus d'informations, consultez notre{' '}
            <a href="/legal/privacy" className="text-bronze underline decoration-or underline-offset-4 hover:text-charbon">
              Politique de confidentialité
            </a>.
          </p>
        </section>
      </div>

      <div className="mt-12 pt-6 border-t border-sable">
        <p className="text-sm text-pierre">
          Dernière mise à jour : {LEGAL_LAST_UPDATED}
        </p>
      </div>
    </div>
  );
}
