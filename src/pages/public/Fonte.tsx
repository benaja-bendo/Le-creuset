import { BlockTitle, Container, Paragraph, SectionHeading, Split, TagList } from '../../components/vitrine/Layout';
import { GRAINS } from '../../components/vitrine/grains';
import MailCta from '../../components/vitrine/MailCta';
import PageHero from '../../components/vitrine/PageHero';
import { PhotoPlaceholder } from '../../components/vitrine/Photo';
import Reveal from '../../components/vitrine/Reveal';
import { PHOTOS } from '../../lib/photos';

const ALLIAGES = [
  { label: 'Or jaune', detail: '750 · 375', grain: GRAINS.orJaune },
  { label: 'Or rose', detail: '750 · 375', grain: GRAINS.orRose },
  { label: 'Or blanc palladié', detail: 'Palladium 13 %', grain: GRAINS.orBlanc },
  { label: 'Argent', detail: '925', grain: GRAINS.argent },
  { label: 'Platine', detail: '950', grain: GRAINS.platine },
];

const REALISATIONS = ['pièce réalisée', 'arbre de fonte', 'grenaille de métal'];

export default function Fonte() {
  return (
    <>
      <PageHero
        photo={PHOTOS.fonte}
        title="Fonte à cire perdue"
        lead="Tous les métaux précieux, jusqu’au platine."
        breadcrumb={[{ label: 'Accueil', to: '/' }, { label: 'Nos services', to: '/services' }, { label: 'Fonte' }]}
      />

      <section className="py-20 md:py-28">
        <Split media={<PhotoPlaceholder caption="la machine Galloni" className="aspect-[4/3]" />}>
          <BlockTitle eyebrow="L’atelier de fonte">Une machine Galloni de dernière génération</BlockTitle>
          <Paragraph>
            Elle permet la réalisation de pièces de bijouterie en tous métaux précieux, jusqu’au platine. Les dernières
            technologies intégrées dans cette machine permettent d’atteindre une structure moléculaire dense et sans
            défauts.
          </Paragraph>
          <Paragraph>Nous pouvons réaliser les fontes à partir de :</Paragraph>
          <TagList items={['Cire sculptée', 'Cires en série, depuis vos moules', 'Fichiers CAO']} />
        </Split>
      </section>

      <section aria-labelledby="alliages" className="bg-lin py-20 md:py-28">
        <Container className="flex flex-col items-center gap-14 md:gap-16">
          <SectionHeading
            eyebrow="Affinage & compte-poids"
            title="Des métaux tracés, un compte-poids visible en temps réel"
            divider
            lead="Nous travaillons avec des sociétés d’affinage qui garantissent la qualité et la traçabilité des métaux précieux, et facilitent les transactions par compte-poids. Nous avons à cœur de rendre ces comptes lisibles : vous visualisez votre compte-poids en temps réel dans votre espace personnel."
          />
          <div className="flex w-full flex-col items-center gap-10">
            <h3 id="alliages" className="text-center text-[22px] font-normal">
              Les alliages que nous travaillons
            </h3>
            <ul className="flex w-full flex-wrap justify-center gap-x-4 gap-y-10">
              {ALLIAGES.map((alliage, i) => (
                <li key={alliage.label} className="basis-[44%] sm:basis-[30%] lg:basis-0 lg:flex-1">
                  <Reveal delay={i * 90} className="flex flex-col items-center gap-3.5 text-center">
                    <span
                      aria-hidden="true"
                      className="size-20 rounded-full shadow-[0_14px_22px_-10px_rgb(43_41_40/0.45)] sm:size-24"
                      style={{ background: alliage.grain }}
                    />
                    <span className="font-serif text-lg font-bold">{alliage.label}</span>
                    <span className="font-sans text-[13px] text-pierre">{alliage.detail}</span>
                  </Reveal>
                </li>
              ))}
            </ul>
            <p className="max-w-xl text-center font-sans text-sm text-pierre">
              Toutes les nuances de l’or en 750 et 375, l’or blanc palladié 13 %, l’argent 925 et le platine 950.
            </p>
          </div>
        </Container>
      </section>

      <section aria-labelledby="realisations" className="py-20 md:py-28">
        <Container className="flex flex-col gap-10">
          <h2 id="realisations" className="text-[clamp(1.6rem,1.2rem+1.6vw,2.35rem)] font-normal">
            Nos réalisations
          </h2>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {REALISATIONS.map((caption) => (
              <li key={caption}>
                <PhotoPlaceholder caption={caption} className="aspect-[4/3] sm:aspect-square" />
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <MailCta
        title="Une fonte à prévoir ?"
        text="Les commandes se passent par email : décrivez votre pièce, le métal et la quantité, nous revenons vers vous rapidement."
      />
    </>
  );
}
