import { Box, FileText, Layers, Scale, Workflow } from 'lucide-react';
import Logo from '../../components/brand/Logo';
import ActionLink from '../../components/vitrine/ActionLink';
import ContactSection from '../../components/vitrine/ContactSection';
import { Container, SectionHeading } from '../../components/vitrine/Layout';
import { GoldCross, GoldRule } from '../../components/vitrine/Ornaments';
import { ProvisionalBadge } from '../../components/vitrine/Photo';
import { OrderTrackingPreview } from '../../components/vitrine/ProPreview';
import Reveal from '../../components/vitrine/Reveal';
import RingShowcase from '../../components/vitrine/RingShowcase';
import ServiceCards from '../../components/vitrine/ServiceCards';
import { PHOTOS } from '../../lib/photos';

const MAITRES_MOTS = [
  {
    title: 'Précision',
    text: 'Nos machines de précision permettent des fontes soignées, fidèles au moindre détail de vos créations.',
  },
  {
    title: 'Réactivité',
    text: 'Grâce à des délais courts et à des échanges simplifiés, nous devenons un véritable partenaire de votre développement.',
  },
  {
    title: 'Savoir-faire',
    text: 'Forts de notre expérience en joaillerie, nous concevons et réalisons vos pièces avec une attention particulière.',
  },
];

const ESPACE_PRO = [
  { icon: Scale, text: 'Compte-poids or fin, argent fin et platine' },
  { icon: Workflow, text: 'Suivi de commande, de la cire à l’expédition' },
  { icon: FileText, text: 'Factures à télécharger' },
  { icon: Layers, text: 'Bibliothèque de vos moules et fichiers STL' },
  { icon: Box, text: 'Devis indicatif sur dépôt de fichier STL' },
];

function Hero() {
  const photo = PHOTOS.fonte;
  return (
    <section className="relative isolate flex min-h-[calc(100svh-76px)] items-center justify-center overflow-hidden bg-charbon lg:min-h-[calc(100svh-92px)]">
      <img
        src={photo.src}
        srcSet={photo.srcSet}
        sizes="100vw"
        alt=""
        width={photo.width}
        height={photo.height}
        fetchPriority="high"
        className="absolute inset-0 -z-10 size-full animate-hero-zoom object-cover"
      />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgb(28_26_25/0.55)_0%,rgb(28_26_25/0.72)_100%)]" />

      <div className="flex flex-col items-center gap-5 px-5 py-24 text-center text-ivoire">
        <h1 className="m-0">
          <Logo className="h-auto w-[min(640px,84vw)]" />
        </h1>
        <p className="font-serif text-[clamp(1.25rem,1rem+1.2vw,1.75rem)] text-ivoire/90">Fonderie de métaux Précieux</p>
        <p className="pl-[0.36em] font-serif text-[13px] font-bold tracking-[0.36em]">BORDEAUX</p>
        <GoldRule className="w-[min(280px,60vw)]" />
        <div className="mt-6 flex w-full flex-col gap-4 sm:w-auto sm:flex-row">
          <ActionLink to="/client/quote" variant="light">
            Devis dans l’espace client
          </ActionLink>
          <ActionLink to="/services" variant="outline-light">
            Découvrir nos services
          </ActionLink>
        </div>
      </div>

      <span aria-hidden="true" className="absolute bottom-0 left-1/2 h-14 w-px bg-gradient-to-b from-transparent to-or" />
      {photo.provisional && <ProvisionalBadge className="right-4 bottom-4" />}
    </section>
  );
}

export default function Home() {
  return (
    <>
      <Hero />

      <section aria-labelledby="maitres-mots" className="py-20 md:py-28">
        <Container className="flex flex-col items-center gap-14 md:gap-16">
          <SectionHeading title={<span id="maitres-mots">Nos maîtres-mots</span>} divider />
          <ul className="grid w-full gap-12 md:grid-cols-3 md:gap-16">
            {MAITRES_MOTS.map((item, i) => (
              <li key={item.title}>
                <Reveal delay={i * 120} className="flex flex-col items-center gap-4 text-center">
                  <GoldCross />
                  <h3 className="text-[22px] font-normal">{item.title}</h3>
                  <p className="max-w-xs font-serif text-base leading-[1.75] text-pierre">{item.text}</p>
                </Reveal>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section aria-labelledby="services" className="pb-20 md:pb-28">
        <Container className="flex flex-col items-center gap-12 md:gap-14">
          <GoldRule className="w-[min(420px,70%)]" />
          <SectionHeading eyebrow="Expertise" title={<span id="services">Nos services</span>} />
          <div className="w-full">
            <ServiceCards />
          </div>
        </Container>
      </section>

      <RingShowcase />

      <section aria-labelledby="espace-pro" className="py-20 md:py-28">
        <Container className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <Reveal className="flex flex-col gap-8">
            <SectionHeading
              align="start"
              eyebrow="Espace professionnel"
              title={<span id="espace-pro">Votre atelier, suivi en temps réel</span>}
              lead="Bijoutiers, designers, grossistes : votre compte pro réunit tout ce qui concerne vos pièces confiées à La Grenaille."
            />
            <ul className="flex flex-col gap-4 font-sans text-[15px]">
              {ESPACE_PRO.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-4">
                  <Icon size={20} strokeWidth={1.4} className="shrink-0 text-bronze" aria-hidden="true" />
                  {text}
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-3.5 sm:flex-row">
              <ActionLink to="/register">Créer un compte pro</ActionLink>
              <ActionLink to="/login" variant="outline">
                Se connecter
              </ActionLink>
            </div>
          </Reveal>
          <Reveal delay={150}>
            <OrderTrackingPreview />
          </Reveal>
        </Container>
      </section>

      <ContactSection id="contact" />
    </>
  );
}
