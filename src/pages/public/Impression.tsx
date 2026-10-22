import ActionLink from '../../components/vitrine/ActionLink';
import { BlockTitle, Paragraph, Split, TagList } from '../../components/vitrine/Layout';
import { GRAINS } from '../../components/vitrine/grains';
import MailCta from '../../components/vitrine/MailCta';
import PageHero from '../../components/vitrine/PageHero';
import { Photo, PhotoPlaceholder } from '../../components/vitrine/Photo';
import { QuotePreview } from '../../components/vitrine/ProPreview';
import { PHOTOS } from '../../lib/photos';

const MATIERES = [
  { title: 'Cire d’impression', text: 'Calcinable, pour la fonte directe.', grain: GRAINS.cire },
  { title: 'Résine prototype', text: 'Pour présenter la pièce avant production.', grain: GRAINS.resine },
];

export default function Impression() {
  return (
    <>
      <PageHero
        photo={PHOTOS.impression}
        title="Conception & Impression 3D"
        lead="Du simple croquis jusqu’au dessin technique, puis jusqu’à la fonte."
        breadcrumb={[{ label: 'Accueil', to: '/' }, { label: 'Nos services', to: '/services' }, { label: 'Conception 3D' }]}
      />

      <section className="py-20 md:py-28">
        <Split media={<PhotoPlaceholder caption="du croquis au modèle 3D" className="aspect-[4/3]" />}>
          <BlockTitle eyebrow="Conception">Une modélisation pensée pour la joaillerie</BlockTitle>
          <Paragraph>
            Au sein de notre atelier, nous concevons vos projets à partir du simple croquis jusqu’au dessin technique, à
            l’aide de logiciels tels que 3Design et Rhino. Nous pouvons réaliser le processus dans son intégralité, de la
            modélisation à la fonte.
          </Paragraph>
          <Paragraph>
            Notre expérience en atelier de bijouterie et en sertissage garantit une modélisation pensée spécifiquement
            pour les pièces de joaillerie.
          </Paragraph>
          <TagList items={['3Design', 'Rhino', 'Sertissage']} />
        </Split>
      </section>

      <section className="bg-lin py-20 md:py-28">
        <Split media={<QuotePreview />}>
          <BlockTitle eyebrow="Devis automatique">Déposez un fichier STL, obtenez un prix indicatif</BlockTitle>
          <Paragraph>
            Sur votre espace personnel, un outil de devis automatique vous facilite la tarification pour vos clients : en
            y déposant vos fichiers STL, il vous indique un prix à titre informatif pour la fonte et l’impression.
          </Paragraph>
          <div className="flex flex-col gap-3.5 sm:flex-row">
            <ActionLink to="/register">Créer un compte</ActionLink>
            <ActionLink to="/login" variant="outline">
              Se connecter
            </ActionLink>
          </div>
        </Split>
      </section>

      <section className="py-20 md:py-28">
        <Split
          reverse
          media={<Photo photo={PHOTOS.impression} sizes="(min-width: 1024px) 600px, 100vw" className="aspect-[4/3]" />}
        >
          <BlockTitle eyebrow="Impression">Une imprimante 3D Systems</BlockTitle>
          <Paragraph>
            Elle réalise des impressions en cire, pour une qualité de fonte à la hauteur des exigences de la joaillerie.
            Nous pouvons également imprimer des prototypes en résine, pour fournir un visuel à votre client.
          </Paragraph>
          <ul className="grid gap-4 sm:grid-cols-2">
            {MATIERES.map((matiere) => (
              <li key={matiere.title} className="flex flex-col gap-2.5 border border-sable bg-papier p-6">
                <span aria-hidden="true" className="size-6 rounded-full" style={{ background: matiere.grain }} />
                <h3 className="text-[17px] font-bold">{matiere.title}</h3>
                <p className="font-serif text-sm leading-[1.65] text-pierre">{matiere.text}</p>
              </li>
            ))}
          </ul>
        </Split>
      </section>

      <MailCta
        title="Un projet à modéliser ?"
        text="Envoyez-nous votre croquis ou votre fichier, avec le métal souhaité : nous revenons vers vous rapidement."
      />
    </>
  );
}
