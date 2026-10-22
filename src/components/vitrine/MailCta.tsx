import { CONTACT } from '../../lib/site';
import ActionLink from './ActionLink';
import { Container } from './Layout';
import Reveal from './Reveal';

/** Bandeau de fin de page : les commandes se passent par email. */
export default function MailCta({ title, text }: { title: string; text: string }) {
  return (
    <section className="pb-20 md:pb-28">
      <Container>
        <Reveal className="flex flex-col gap-6 border border-sable bg-papier p-7 sm:p-10 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
          <div className="flex max-w-2xl flex-col gap-2.5">
            <h2 className="text-[26px] font-normal">{title}</h2>
            <p className="font-serif text-base leading-[1.7] text-pierre">{text}</p>
          </div>
          <ActionLink href={`mailto:${CONTACT.email}`} className="shrink-0 normal-case tracking-[0.06em] sm:self-start lg:self-auto">
            {CONTACT.email}
          </ActionLink>
        </Reveal>
      </Container>
    </section>
  );
}
