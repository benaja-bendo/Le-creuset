export default function CGV() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-8">
        Conditions Générales de Vente
      </h1>

      <div className="space-y-8 text-secondary-300">
        <section>
          <h2 className="text-2xl font-serif font-bold text-white mb-4">
            Article 1 - Champ d'application
          </h2>
          <p>
            Les présentes Conditions Générales de Vente (CGV) régissent les relations contractuelles entre 
            Le Creuset et ses clients pour toutes les prestations de services proposées, notamment :
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li>Fonte à cire perdue (métaux précieux et communs)</li>
            <li>Impression 3D en résine calcinable</li>
            <li>Moulage (silicone et caoutchouc)</li>
            <li>Services de finition et polissage</li>
          </ul>
          <p className="mt-4">
            Toute commande implique l'acceptation sans réserve par l'acheteur des présentes CGV.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-serif font-bold text-white mb-4">
            Article 2 - Devis et commandes
          </h2>
          <h3 className="text-xl font-serif font-bold text-white mb-3 mt-6">2.1 Devis</h3>
          <p>
            Tout devis est valable 30 jours à compter de sa date d'émission. Passé ce délai, les prix et 
            délais indiqués pourront être révisés.
          </p>
          
          <h3 className="text-xl font-serif font-bold text-white mb-3 mt-6">2.2 Commande</h3>
          <p>
            La commande sera considérée comme ferme et définitive après :
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li>Signature du devis par le client</li>
            <li>Réception de l'acompte demandé (généralement 50% du montant total)</li>
            <li>Réception des fichiers, cires, ou pièces modèles nécessaires</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-serif font-bold text-white mb-4">
            Article 3 - Tarifs et paiement
          </h2>
          <h3 className="text-xl font-serif font-bold text-white mb-3 mt-6">3.1 Prix</h3>
          <p>
            Les prix sont indiqués en euros hors taxes (HT). La TVA applicable est celle en vigueur au 
            jour de la facturation. Les prix tiennent compte du cours des métaux au moment du devis. 
            En cas de variations importantes, un réajustement pourra être proposé.
          </p>
          
          <h3 className="text-xl font-serif font-bold text-white mb-3 mt-6">3.2 Modalités de paiement</h3>
          <p>
            Le règlement s'effectue selon les modalités suivantes :
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li><strong className="text-white">Acompte :</strong> 50% à la commande</li>
            <li><strong className="text-white">Solde :</strong> 50% à la livraison</li>
            <li><strong className="text-white">Moyens de paiement :</strong> Virement bancaire, chèque, espèces (dans la limite légale)</li>
          </ul>

          <h3 className="text-xl font-serif font-bold text-white mb-3 mt-6">3.3 Retard de paiement</h3>
          <p>
            En cas de retard de paiement, des pénalités de retard égales à trois fois le taux d'intérêt légal 
            seront appliquées. Une indemnité forfaitaire de 40€ pour frais de recouvrement sera également due.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-serif font-bold text-white mb-4">
            Article 4 - Délais de fabrication
          </h2>
          <p>
            Les délais de fabrication sont communiqués à titre indicatif et peuvent varier en fonction de :
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li>La complexité de la pièce</li>
            <li>La disponibilité des matières premières</li>
            <li>La charge de travail de l'atelier</li>
          </ul>
          <p className="mt-4">
            Le Creuset s'engage à respecter au mieux les délais annoncés. En cas de retard, le client sera 
            informé dans les meilleurs délais. Un retard de livraison ne pourra donner lieu à des pénalités 
            ou à l'annulation de la commande, sauf accord express.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-serif font-bold text-white mb-4">
            Article 5 - Livraison
          </h2>
          <p>
            Les pièces sont livrées à l'adresse indiquée par le client ou peuvent être retirées directement 
            à l'atelier sur rendez-vous. Les frais de livraison sont à la charge du client sauf mention 
            contraire sur le devis.
          </p>
          <p className="mt-4">
            Pour les métaux précieux, les envois sont effectués en recommandé avec assurance. Le client devra 
            vérifier l'état du colis en présence du transporteur et signaler toute anomalie immédiatement.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-serif font-bold text-white mb-4">
            Article 6 - Garantie et responsabilité
          </h2>
          <h3 className="text-xl font-serif font-bold text-white mb-3 mt-6">6.1 Garantie</h3>
          <p>
            Le Creuset garantit la conformité des pièces réalisées par rapport aux spécifications validées. 
            Toute réclamation devra être formulée par écrit dans les 7 jours suivant la réception.
          </p>
          
          <h3 className="text-xl font-serif font-bold text-white mb-3 mt-6">6.2 Limites de responsabilité</h3>
          <p>
            Le Creuset ne saurait être tenu responsable :
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li>Des défauts inhérents aux fichiers 3D fournis par le client</li>
            <li>De la fragilité des pièces modèles confiées pour moulage</li>
            <li>Des variations naturelles dans les alliages métalliques</li>
            <li>De l'utilisation finale des pièces produites</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-serif font-bold text-white mb-4">
            Article 7 - Propriété intellectuelle
          </h2>
          <p>
            Les fichiers, moules et modèles confiés par le client restent sa propriété. Le Creuset s'engage 
            à ne pas reproduire, diffuser ou exploiter ces créations sans autorisation expresse. Les moules 
            réalisés restent propriété du client et peuvent être conservés par Le Creuset pour faciliter les 
            commandes ultérieures, sauf demande contraire.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-serif font-bold text-white mb-4">
            Article 8 - Métaux précieux
          </h2>
          <p>
            Pour les travaux en métaux précieux, le client peut :
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li><strong className="text-white">Option 1 :</strong> Fournir ses propres métaux (or, argent)</li>
            <li><strong className="text-white">Option 2 :</strong> Acheter le métal via Le Creuset au cours du jour</li>
          </ul>
          <p className="mt-4">
            Les chutes de métaux précieux sont restituées au client ou déduites du prix de la prestation, 
            selon accord préalable.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-serif font-bold text-white mb-4">
            Article 9 - Annulation
          </h2>
          <p>
            En cas d'annulation par le client après validation du devis :
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li>Avant le début de fabrication : 30% du montant total</li>
            <li>Après le début de fabrication : 100% du montant total</li>
          </ul>
          <p className="mt-4">
            Les métaux ou matériaux déjà commandés seront facturés au client.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-serif font-bold text-white mb-4">
            Article 10 - Droit applicable et litiges
          </h2>
          <p>
            Les présentes CGV sont soumises au droit français. En cas de litige, une solution amiable sera 
            recherchée avant toute action judiciaire. À défaut, les tribunaux du siège social de Le Creuset 
            seront seuls compétents.
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
