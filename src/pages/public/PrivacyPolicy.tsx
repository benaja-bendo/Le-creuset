import { LEGAL_LAST_UPDATED } from '../../lib/legal';

export default function PrivacyPolicy() {
  return (
    <div className="max-w-none">
      <h1 className="text-3xl md:text-4xl font-serif font-normal text-charbon mb-8">
        Politique de Confidentialité
      </h1>

      <div className="space-y-8 font-serif text-base leading-[1.8] text-charbon">
        <section>
          <p className="text-lg text-pierre italic">
            La Grenaille accorde une grande importance à la protection de vos données personnelles. 
            Cette politique de confidentialité vous informe sur la manière dont nous collectons, 
            utilisons et protégeons vos informations conformément au Règlement Général sur la 
            Protection des Données (RGPD).
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-serif font-normal text-charbon mb-4">
            1. Responsable du traitement
          </h2>
          <div className="space-y-2">
            <p><strong className="text-charbon">Responsable :</strong> [NOM DE LA SOCIÉTÉ]</p>
            <p><strong className="text-charbon">Adresse :</strong> [ADRESSE COMPLÈTE]</p>
            <p><strong className="text-charbon">Email :</strong> [EMAIL DE CONTACT]</p>
            <p><strong className="text-charbon">Téléphone :</strong> [NUMÉRO]</p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-serif font-normal text-charbon mb-4">
            2. Données collectées
          </h2>
          
          <h3 className="text-xl font-serif font-bold text-charbon mb-3 mt-6">2.1 Données d'identification</h3>
          <p>Nous collectons les données suivantes lorsque vous nous contactez ou passez commande :</p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li>Nom et prénom</li>
            <li>Raison sociale (si professionnel)</li>
            <li>Adresse postale</li>
            <li>Adresse email</li>
            <li>Numéro de téléphone</li>
            <li>SIRET (pour les professionnels)</li>
            <li>Documents transmis à l'inscription (extrait Kbis, déclaration douanes)</li>
            <li>Mot de passe, conservé sous forme chiffrée</li>
          </ul>

          <h3 className="text-xl font-serif font-bold text-charbon mb-3 mt-6">2.2 Données de commande</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Détails des services commandés</li>
            <li>Fichiers 3D et spécifications techniques</li>
            <li>Historique des commandes et factures</li>
            <li>Correspondances et échanges</li>
          </ul>

          <h3 className="text-xl font-serif font-bold text-charbon mb-3 mt-6">2.3 Données de navigation</h3>
          <p>
            Comme tout serveur web, celui de ce site enregistre des journaux techniques, nécessaires à sa
            sécurité et à son bon fonctionnement. Ces données incluent :
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li>Adresse IP</li>
            <li>Type de navigateur</li>
            <li>Pages visitées</li>
            <li>Date et heure de visite</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-serif font-normal text-charbon mb-4">
            3. Finalités du traitement
          </h2>
          <p>Vos données sont utilisées pour :</p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li><strong className="text-charbon">Gestion des commandes :</strong> traitement, fabrication, livraison</li>
            <li><strong className="text-charbon">Communication :</strong> réponses à vos demandes, suivi de projet</li>
            <li><strong className="text-charbon">Facturation :</strong> établissement des devis et factures</li>
            <li><strong className="text-charbon">Sécurité :</strong> prévention des abus et protection de votre espace professionnel</li>
            <li><strong className="text-charbon">Obligations légales :</strong> comptabilité, fiscalité</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-serif font-normal text-charbon mb-4">
            4. Base légale du traitement
          </h2>
          <p>Le traitement de vos données repose sur :</p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li><strong className="text-charbon">Contrat :</strong> exécution de la relation commerciale</li>
            <li><strong className="text-charbon">Intérêt légitime :</strong> sécurité du site et prévention des abus</li>
            <li><strong className="text-charbon">Obligation légale :</strong> conservation des factures (10 ans)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-serif font-normal text-charbon mb-4">
            5. Destinataires des données
          </h2>
          <p>Vos données peuvent être partagées avec :</p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li><strong className="text-charbon">Personnel de La Grenaille :</strong> équipe de production et administrative</li>
            <li><strong className="text-charbon">Hébergeur :</strong> Infomaniak Network SA (Suisse), qui héberge le site, ses données et sa messagerie</li>
            <li><strong className="text-charbon">Transporteurs :</strong> pour la livraison de vos pièces</li>
            <li><strong className="text-charbon">Autorités :</strong> sur demande légale uniquement</li>
          </ul>
          <p className="mt-4">
            Nous ne vendons ni ne louons vos données personnelles à des tiers à des fins commerciales.
            Vos données sont hébergées en Suisse, pays reconnu par la Commission européenne comme offrant
            un niveau de protection adéquat.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-serif font-normal text-charbon mb-4">
            6. Durée de conservation
          </h2>
          <div className="space-y-3">
            <p><strong className="text-charbon">Données clients :</strong> durée de la relation commerciale + 3 ans</p>
            <p><strong className="text-charbon">Factures :</strong> 10 ans (obligation légale)</p>
            <p><strong className="text-charbon">Fichiers et projets :</strong> 5 ans sauf demande de suppression</p>
            <p><strong className="text-charbon">Journaux techniques du serveur :</strong> le temps nécessaire à la sécurité du service</p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-serif font-normal text-charbon mb-4">
            7. Sécurité des données
          </h2>
          <p>
            La Grenaille met en œuvre toutes les mesures techniques et organisationnelles pour protéger 
            vos données contre tout accès non autorisé, modification, divulgation ou destruction :
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li>Accès restreint aux données (personnel autorisé uniquement)</li>
            <li>Connexions sécurisées (HTTPS)</li>
            <li>Sauvegardes régulières</li>
            <li>Mots de passe sécurisés</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-serif font-normal text-charbon mb-4">
            8. Vos droits
          </h2>
          <p>Conformément au RGPD, vous disposez des droits suivants :</p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li><strong className="text-charbon">Droit d'accès :</strong> obtenir une copie de vos données</li>
            <li><strong className="text-charbon">Droit de rectification :</strong> corriger vos données inexactes</li>
            <li><strong className="text-charbon">Droit à l'effacement :</strong> demander la suppression de vos données</li>
            <li><strong className="text-charbon">Droit à la limitation :</strong> restreindre le traitement</li>
            <li><strong className="text-charbon">Droit à la portabilité :</strong> récupérer vos données dans un format structuré</li>
            <li><strong className="text-charbon">Droit d'opposition :</strong> vous opposer au traitement</li>
            <li><strong className="text-charbon">Droit de retirer votre consentement :</strong> à tout moment</li>
          </ul>
          <p className="mt-4">
            Pour exercer ces droits, contactez-nous à : <strong className="text-charbon">[EMAIL]</strong>
          </p>
          <p className="mt-4">
            Nous nous engageons à répondre dans un délai d'un mois. Vous disposez également du droit 
            de déposer une réclamation auprès de la{' '}
            <a 
              href="https://www.cnil.fr" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-bronze underline decoration-or underline-offset-4 hover:text-charbon"
            >
              CNIL
            </a>.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-serif font-normal text-charbon mb-4">
            9. Cookies
          </h2>
          <p>
            Ce site ne dépose aucun cookie et n'utilise aucun outil de mesure d'audience, de publicité
            ou de suivi. Il n'y a donc aucun bandeau de consentement à accepter.
          </p>

          <h3 className="text-xl font-serif font-bold text-charbon mb-3 mt-6">Ce qui est conservé dans votre navigateur</h3>
          <p>
            Lorsque vous vous connectez à votre espace professionnel, votre navigateur conserve un jeton de
            session dans son stockage local. Il est strictement nécessaire à la connexion et supprimé
            lorsque vous vous déconnectez.
          </p>
          <p className="mt-4">
            Les polices de caractères sont servies par le site lui-même : aucune requête n'est envoyée à
            un service tiers lors de votre visite.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-serif font-normal text-charbon mb-4">
            10. Modifications
          </h2>
          <p>
            La Grenaille se réserve le droit de modifier cette politique de confidentialité à tout moment. 
            Les modifications seront publiées sur cette page avec une nouvelle date de mise à jour. 
            Nous vous encourageons à consulter régulièrement cette page.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-serif font-normal text-charbon mb-4">
            11. Contact
          </h2>
          <p>
            Pour toute question concernant cette politique de confidentialité ou l'utilisation de vos 
            données personnelles, contactez-nous :
          </p>
          <div className="space-y-2 mt-4">
            <p><strong className="text-charbon">Email :</strong> [EMAIL]</p>
            <p><strong className="text-charbon">Téléphone :</strong> [NUMÉRO]</p>
            <p><strong className="text-charbon">Courrier :</strong> [ADRESSE COMPLÈTE]</p>
          </div>
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
