import { Award, CircleCheck, Clock, Users } from 'lucide-react';
import ActionLink from '../../components/vitrine/ActionLink';
import { Container, SectionHeading } from '../../components/vitrine/Layout';
import PageHero from '../../components/vitrine/PageHero';
import Reveal from '../../components/vitrine/Reveal';
import ServiceCards from '../../components/vitrine/ServiceCards';
import { PHOTOS } from '../../lib/photos';

const ENGAGEMENTS = [
  { icon: Award, title: 'Technologie de pointe', text: 'Machine de dernière génération, de qualité joaillerie.' },
  { icon: Clock, title: 'Délais respectés', text: 'Engagement sur les délais, avec un suivi en temps réel.' },
  { icon: CircleCheck, title: 'Espace personnalisé', text: 'Un suivi de vos comptes-poids, factures et commandes.' },
  { icon: Users, title: 'Accompagnement personnalisé', text: 'Un suivi personnalisé à toutes les étapes de vos créations.' },
];

const PARCOURS = [
  { title: 'Croquis ou fichier', text: 'Vous nous confiez un dessin, une cire sculptée ou un fichier CAO.' },
  { title: 'Modélisation 3D', text: 'Sur 3Design et Rhino, pensée pour le sertissage et la joaillerie.' },
  { title: 'Cire ou moule', text: 'Impression en cire 3D Systems, ou tirage de cires depuis vos moules.' },
  { title: 'Fonte', text: 'Coulée sur machine Galloni, de l’or 375 au platine 950.' },
  { title: 'Suivi en ligne', text: 'Statut de commande, compte-poids et factures dans votre espace pro.' },
];

export default function Services() {
  return (
    <>
      <PageHero
        photo={PHOTOS.moulage}
        title="Nos services"
        lead="Fonte, conception 3D et moulage : toutes les étapes de vos pièces, réunies dans un même atelier à Bordeaux."
        breadcrumb={[{ label: 'Accueil', to: '/' }, { label: 'Nos services' }]}
      />

      <section aria-label="Nos services" className="py-20 md:py-28">
        <Container>
          <ServiceCards headingLevel="h2" />
        </Container>
      </section>

      <section aria-labelledby="engagements" className="pb-20 md:pb-28">
        <Container className="flex flex-col items-center gap-12 md:gap-14">
          <SectionHeading
            title={<span id="engagements">Pourquoi nous choisir</span>}
            lead="L’engagement La Grenaille pour votre réussite"
            divider
          />
          <ul className="grid w-full gap-5 md:grid-cols-2">
            {ENGAGEMENTS.map(({ icon: Icon, title, text }, i) => (
              <li key={title} className="flex">
                <Reveal delay={(i % 2) * 120} className="flex w-full items-start gap-5 border border-sable bg-papier p-7 sm:p-8">
                  <span className="flex size-[52px] shrink-0 items-center justify-center rounded-full bg-lin">
                    <Icon size={22} strokeWidth={1.4} className="text-bronze" aria-hidden="true" />
                  </span>
                  <div className="flex flex-col gap-2">
                    <h3 className="text-[19px] font-bold">{title}</h3>
                    <p className="font-serif text-[15px] leading-[1.7] text-pierre">{text}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section aria-labelledby="parcours" className="bg-lin py-20 md:py-28">
        <Container className="flex flex-col gap-12 md:gap-14">
          <SectionHeading
            align="start"
            eyebrow="Le parcours d’une pièce"
            title={<span id="parcours">Du croquis à la pièce finie</span>}
          />
          <ol className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-5">
            {PARCOURS.map((step, i) => (
              <li key={step.title}>
                <Reveal delay={i * 90} className="flex flex-col gap-3.5 border-t border-charbon pt-5">
                  <span className="font-serif text-3xl text-bronze" aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="text-lg font-bold">{step.title}</h3>
                  <p className="font-serif text-[15px] leading-[1.7] text-pierre">{step.text}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section aria-labelledby="projet" className="py-20 md:py-28">
        <Container>
          <Reveal className="mx-auto max-w-[980px] border border-or p-2">
            <div className="flex flex-col items-center gap-6 border border-or px-6 py-14 text-center sm:px-10 sm:py-16">
              <h2 id="projet" className="text-[clamp(1.75rem,1.3rem+1.6vw,2.4rem)] font-normal">
                Prêt à concrétiser votre projet ?
              </h2>
              <p className="max-w-xl font-serif text-[17px] leading-[1.78] text-pierre">
                Que vous soyez bijoutier, designer ou grossiste, nous avons la solution pour donner vie à vos idées.
              </p>
              <div className="mt-2 flex w-full flex-col gap-3.5 sm:w-auto sm:flex-row">
                <ActionLink to="/register">Créer un compte</ActionLink>
                <ActionLink to="/contact" variant="outline">
                  Nous contacter
                </ActionLink>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
