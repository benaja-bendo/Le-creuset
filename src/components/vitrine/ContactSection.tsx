import { useState, type FormEvent } from 'react';
import { Mail, MapPin, Phone } from 'lucide-react';
import { buildContactMailto, type ContactFields } from '../../lib/contactMail';
import { CONTACT } from '../../lib/site';
import { Container, SectionHeading } from './Layout';
import Reveal from './Reveal';
import { fieldInput, fieldLabel, fieldTextarea, submitButton, textLink } from './styles';

const EMPTY: ContactFields = { name: '', company: '', email: '', message: '' };

export default function ContactSection({ id }: { id?: string }) {
  const [fields, setFields] = useState<ContactFields>(EMPTY);
  const [sent, setSent] = useState(false);

  const update = (key: keyof ContactFields) => (event: { target: { value: string } }) =>
    setFields((current) => ({ ...current, [key]: event.target.value }));

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    window.location.href = buildContactMailto(fields);
    setSent(true);
  };

  return (
    <section id={id} aria-labelledby="contact-title" className="scroll-mt-24 bg-lin py-20 md:py-28">
      <Container className="grid items-start gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
        <Reveal className="flex flex-col gap-8">
          <SectionHeading
            align="start"
            eyebrow="Contact"
            title={<span id="contact-title">Nos coordonnées</span>}
            lead="Notre atelier est à votre disposition pour étudier vos projets de fonderie, moulage et impression 3D."
          />
          <ul className="flex flex-col gap-4 font-serif text-[17px]">
            <li className="flex items-center gap-4">
              <MapPin size={20} strokeWidth={1.5} className="shrink-0 text-bronze" aria-hidden="true" />
              Atelier à {CONTACT.city}
            </li>
            <li>
              <a href={CONTACT.phoneHref} className="flex items-center gap-4 transition-colors hover:text-bronze">
                <Phone size={20} strokeWidth={1.5} className="shrink-0 text-bronze" aria-hidden="true" />
                {CONTACT.phoneDisplay}
              </a>
            </li>
            <li>
              <a href={`mailto:${CONTACT.email}`} className="flex items-center gap-4 break-all transition-colors hover:text-bronze">
                <Mail size={20} strokeWidth={1.5} className="shrink-0 text-bronze" aria-hidden="true" />
                {CONTACT.email}
              </a>
            </li>
          </ul>
        </Reveal>

        <Reveal delay={120}>
          <form onSubmit={onSubmit} className="flex flex-col gap-5 border border-sable bg-papier p-6 sm:p-9">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className={fieldLabel}>
                Nom
                <input className={fieldInput} type="text" autoComplete="name" value={fields.name} onChange={update('name')} required />
              </label>
              <label className={fieldLabel}>
                Société
                <input className={fieldInput} type="text" autoComplete="organization" value={fields.company} onChange={update('company')} />
              </label>
            </div>
            <label className={fieldLabel}>
              Email
              <input className={fieldInput} type="email" autoComplete="email" value={fields.email} onChange={update('email')} required />
            </label>
            <label className={fieldLabel}>
              Message
              <textarea className={fieldTextarea} rows={5} value={fields.message} onChange={update('message')} required />
            </label>
            <button type="submit" className={submitButton}>
              Envoyer le message
            </button>
            <p aria-live="polite" className="font-sans text-[13px] leading-relaxed text-pierre">
              {sent ? (
                <>
                  Votre messagerie s’ouvre avec votre message prêt à partir. Rien ne s’ouvre ? Écrivez-nous à{' '}
                  <a href={`mailto:${CONTACT.email}`} className={textLink}>
                    {CONTACT.email}
                  </a>
                  .
                </>
              ) : (
                'Le message est envoyé depuis votre messagerie habituelle.'
              )}
            </p>
          </form>
        </Reveal>
      </Container>
    </section>
  );
}
