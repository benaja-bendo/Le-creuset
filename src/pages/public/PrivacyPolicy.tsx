export default function PrivacyPolicy() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-8">
        Politique de Confidentialité
      </h1>

      <div className="space-y-8 text-secondary-300">
        <section>
          <p className="text-lg text-secondary-400 italic">
            Le Creuset accorde une grande importance à la protection de vos données personnelles. 
            Cette politique de confidentialité vous informe sur la manière dont nous collectons, 
            utilisons et protégeons vos informations conformément au Règlement Général sur la 
            Protection des Données (RGPD).
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-serif font-bold text-white mb-4">
            1. Responsable du traitement
          </h2>
          <div className="space-y-2">
            <p><strong className="text-white">Responsable :</strong> [NOM DE LA SOCIÉTÉ]</p>
            <p><strong className="text-white">Adresse :</strong> [ADRESSE COMPLÈTE]</p>
            <p><strong className="text-white">Email :</strong> [EMAIL DE CONTACT]</p>
            <p><strong className="text-white">Téléphone :</strong> [NUMÉRO]</p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-serif font-bold text-white mb-4">
            2. Données collectées
          </h2>
          
          <h3 className="text-xl font-serif font-bold text-white mb-3 mt-6">2.1 Données d'identification</h3>
          <p>Nous collectons les données suivantes lorsque vous nous contactez ou passez commande :</p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li>Nom et prénom</li>
            <li>Raison sociale (si professionnel)</li>
            <li>Adresse postale</li>
            <li>Adresse email</li>
            <li>Numéro de téléphone</li>
            <li>SIRET (pour les professionnels)</li>
          </ul>

          <h3 className="text-xl font-serif font-bold text-white mb-3 mt-6">2.2 Données de commande</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Détails des services commandés</li>
            <li>Fichiers 3D et spécifications techniques</li>
            <li>Historique des commandes et factures</li>
            <li>Correspondances et échanges</li>
          </ul>

          <h3 className="text-xl font-serif font-bold text-white mb-3 mt-6">2.3 Données de navigation</h3>
          <p>
            Ce site utilise des technologies standard (cookies, logs) pour améliorer votre expérience. 
            Ces données incluent :
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li>Adresse IP</li>
            <li>Type de navigateur</li>
            <li>Pages visitées</li>
            <li>Date et heure de visite</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-serif font-bold text-white mb-4">
            3. Finalités du traitement
          </h2>
          <p>Vos données sont utilisées pour :</p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li><strong className="text-white">Gestion des commandes :</strong> traitement, fabrication, livraison</li>
            <li><strong className="text-white">Communication :</strong> réponses à vos demandes, suivi de projet</li>
            <li><strong className="text-white">Facturation :</strong> établissement des devis et factures</li>
            <li><strong className="text-white">Amélioration des services :</strong> statistiques anonymisées</li>
            <li><strong className="text-white">Obligations légales :</strong> comptabilité, fiscalité</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-serif font-bold text-white mb-4">
            4. Base légale du traitement
          </h2>
          <p>Le traitement de vos données repose sur :</p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li><strong className="text-white">Contrat :</strong> exécution de la relation commerciale</li>
            <li><strong className="text-white">Intérêt légitime :</strong> amélioration de nos services</li>
            <li><strong className="text-white">Obligation légale :</strong> conservation des factures (10 ans)</li>
            <li><strong className="text-white">Consentement :</strong> newsletter et communications marketing</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-serif font-bold text-white mb-4">
            5. Destinataires des données
          </h2>
          <p>Vos données peuvent être partagées avec :</p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li><strong className="text-white">Personnel du Creuset :</strong> équipe de production et administrative</li>
            <li><strong className="text-white">Prestataires :</strong> transporteurs, service de paiement</li>
            <li><strong className="text-white">Autorités :</strong> sur demande légale uniquement</li>
          </ul>
          <p className="mt-4">
            Nous ne vendons ni ne louons vos données personnelles à des tiers à des fins commerciales.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-serif font-bold text-white mb-4">
            6. Durée de conservation
          </h2>
          <div className="space-y-3">
            <p><strong className="text-white">Données clients :</strong> durée de la relation commerciale + 3 ans</p>
            <p><strong className="text-white">Factures :</strong> 10 ans (obligation légale)</p>
            <p><strong className="text-white">Fichiers et projets :</strong> 5 ans sauf demande de suppression</p>
            <p><strong className="text-white">Cookies :</strong> 13 mois maximum</p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-serif font-bold text-white mb-4">
            7. Sécurité des données
          </h2>
          <p>
            Le Creuset met en œuvre toutes les mesures techniques et organisationnelles pour protéger 
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
          <h2 className="text-2xl font-serif font-bold text-white mb-4">
            8. Vos droits
          </h2>
          <p>Conformément au RGPD, vous disposez des droits suivants :</p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li><strong className="text-white">Droit d'accès :</strong> obtenir une copie de vos données</li>
            <li><strong className="text-white">Droit de rectification :</strong> corriger vos données inexactes</li>
            <li><strong className="text-white">Droit à l'effacement :</strong> demander la suppression de vos données</li>
            <li><strong className="text-white">Droit à la limitation :</strong> restreindre le traitement</li>
            <li><strong className="text-white">Droit à la portabilité :</strong> récupérer vos données dans un format structuré</li>
            <li><strong className="text-white">Droit d'opposition :</strong> vous opposer au traitement</li>
            <li><strong className="text-white">Droit de retirer votre consentement :</strong> à tout moment</li>
          </ul>
          <p className="mt-4">
            Pour exercer ces droits, contactez-nous à : <strong className="text-white">[EMAIL]</strong>
          </p>
          <p className="mt-4">
            Nous nous engageons à répondre dans un délai d'un mois. Vous disposez également du droit 
            de déposer une réclamation auprès de la{' '}
            <a 
              href="https://www.cnil.fr" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary-500 hover:text-primary-400 underline"
            >
              CNIL
            </a>.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-serif font-bold text-white mb-4">
            9. Cookies
          </h2>
          <p>
            Ce site utilise des cookies pour améliorer votre expérience de navigation. Les cookies sont 
            de petits fichiers texte stockés sur votre appareil.
          </p>
          
          <h3 className="text-xl font-serif font-bold text-white mb-3 mt-6">Types de cookies utilisés</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong className="text-white">Cookies essentiels :</strong> nécessaires au fonctionnement du site</li>
            <li><strong className="text-white">Cookies analytiques :</strong> statistiques de fréquentation anonymes</li>
          </ul>
          
          <p className="mt-4">
            Vous pouvez paramétrer votre navigateur pour refuser les cookies, mais certaines 
            fonctionnalités du site pourraient être limitées.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-serif font-bold text-white mb-4">
            10. Modifications
          </h2>
          <p>
            Le Creuset se réserve le droit de modifier cette politique de confidentialité à tout moment. 
            Les modifications seront publiées sur cette page avec une nouvelle date de mise à jour. 
            Nous vous encourageons à consulter régulièrement cette page.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-serif font-bold text-white mb-4">
            11. Contact
          </h2>
          <p>
            Pour toute question concernant cette politique de confidentialité ou l'utilisation de vos 
            données personnelles, contactez-nous :
          </p>
          <div className="space-y-2 mt-4">
            <p><strong className="text-white">Email :</strong> [EMAIL]</p>
            <p><strong className="text-white">Téléphone :</strong> [NUMÉRO]</p>
            <p><strong className="text-white">Courrier :</strong> [ADRESSE COMPLÈTE]</p>
          </div>
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
