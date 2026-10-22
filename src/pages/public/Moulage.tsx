import { Flame, Snowflake } from 'lucide-react';
import ActionLink from '../../components/vitrine/ActionLink';
import { BlockTitle, Container, Paragraph, SectionHeading, Split } from '../../components/vitrine/Layout';
import MailCta from '../../components/vitrine/MailCta';
import PageHero from '../../components/vitrine/PageHero';
import { PhotoPlaceholder } from '../../components/vitrine/Photo';
import { LibraryPreview } from '../../components/vitrine/ProPreview';
import Reveal from '../../components/vitrine/Reveal';
import { PHOTOS } from '../../lib/photos';

const TECHNIQUES = [
  {
    icon: Snowflake,
    title: 'Moules à froid',
    text: 'Ils reproduisent fidèlement vos éléments organiques, vos modelages en plastiline et vos textures, dans le respect de la matière.',
  },
  {
    icon: Flame,
    title: 'Moules par vulcanisation',
    text: 'Ils reproduisent fidèlement vos créations en série.',
  },
];

function MoldTag() {
  return (
    <div className="absolute -bottom-6 left-4 flex flex-col gap-1 border border-or bg-papier px-5 py-4 shadow-[0_18px_30px_-18px_rgb(43_41_40/0.5)] sm:-left-5">
      <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-pierre">Moule n°</span>
      <span className="font-serif text-lg tracking-[0.08em]">Code unique</span>
    </div>
  );
}

export default function Moulage() {
  return (
    <>
      <PageHero
        photo={PHOTOS.moulage}
        title="Moules"
        lead="Reproduire vos modèles, en série comme à l’unité."
        breadcrumb={[{ label: 'Accueil', to: '/' }, { label: 'Nos services', to: '/services' }, { label: 'Moules' }]}
      />

      <section className="py-20 md:py-28">
        <Split
          media={
            <div className="relative">
              <PhotoPlaceholder caption="moules stockés à l’atelier" className="aspect-[4/3]" />
              <MoldTag />
            </div>
          }
        >
          <BlockTitle eyebrow="Moulage">Vos modèles moulés et conservés à l’atelier</BlockTitle>
          <Paragraph>Nous réalisons dans nos locaux le moulage des modèles que vous souhaitez reproduire en série.</Paragraph>
          <Paragraph>
            Chaque moule reçoit un code unique, ce qui facilite son stockage. À votre demande, nous réalisons ensuite les
            tirages, puis la fonte dans les métaux souhaités.
          </Paragraph>
        </Split>
      </section>

      <section aria-labelledby="techniques" className="bg-lin py-20 md:py-28">
        <Container className="flex flex-col items-center gap-12 md:gap-14">
          <SectionHeading
            title={<span id="techniques">À froid ou par vulcanisation</span>}
            divider
            lead="Nous réalisons des moules à froid ainsi que par vulcanisation, ce qui nous permet de nous adapter à tout type de réalisation."
          />
          <ul className="grid w-full gap-5 md:grid-cols-2">
            {TECHNIQUES.map(({ icon: Icon, title, text }, i) => (
              <li key={title} className="flex">
                <Reveal delay={i * 120} className="flex w-full flex-col gap-4 border border-sable bg-papier p-8 sm:p-10">
                  <Icon size={30} strokeWidth={1.2} className="text-bronze" aria-hidden="true" />
                  <h3 className="text-[22px] font-bold">{title}</h3>
                  <p className="font-serif text-base leading-[1.75] text-pierre">{text}</p>
                </Reveal>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="py-20 md:py-28">
        <Split media={<LibraryPreview />}>
          <BlockTitle eyebrow="Bibliothèque">Tous vos moules, consultables en ligne</BlockTitle>
          <Paragraph>
            Dans votre espace personnel, l’onglet Bibliothèque vous permet de visualiser tous les moules stockés dans nos
            locaux, afin de faciliter vos démarches.
          </Paragraph>
          <ActionLink to="/register" className="self-start">
            Créer un compte
          </ActionLink>
        </Split>
      </section>

      <MailCta
        title="Un modèle à reproduire ?"
        text="Décrivez-nous votre pièce et la série souhaitée : nous revenons vers vous rapidement."
      />
    </>
  );
}
