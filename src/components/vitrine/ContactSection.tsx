import { useLayoutEffect, useRef, useState, type FormEvent } from 'react';
import { AlertCircle, Check, Loader2, Mail, MapPin, Phone } from 'lucide-react';
import { postJSON } from '../../api/client';
import { buildContactMailto, type ContactFields } from '../../lib/contactMail';
import { CONTACT } from '../../lib/site';
import { Container, SectionHeading } from './Layout';
import { GrenailleDivider } from './Ornaments';
import Reveal from './Reveal';
import { fieldInput, fieldLabel, fieldTextarea, submitButton, textLink } from './styles';

const EMPTY: ContactFields = { name: '', company: '', email: '', message: '' };

type Status = 'idle' | 'sending' | 'sent' | 'error';

export default function ContactSection({ id }: { id?: string }) {
  const [fields, setFields] = useState<ContactFields>(EMPTY);
  // Pot de miel : laissé vide par un humain, rempli par les robots. Le back
  // accepte alors la requête sans envoyer de mail.
  const [website, setWebsite] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [sentTo, setSentTo] = useState('');

  const nameInput = useRef<HTMLInputElement>(null);
  const submit = useRef<HTMLButtonElement>(null);
  const sentPanel = useRef<HTMLDivElement>(null);
  const sentHeading = useRef<HTMLHeadingElement>(null);
  const previousStatus = useRef<Status>(status);

  // Le bouton désactivé pendant l'envoi perd le focus, et le formulaire et la
  // confirmation se remplacent : le focus suit, sinon il retombe en haut de
  // page. Layout effect : le focus est posé dans le même commit que le
  // changement d'écran. Le défilement passe par le panneau, dont le
  // scroll-margin dégage l'en-tête.
  useLayoutEffect(() => {
    if (status === 'sent') {
      sentHeading.current?.focus({ preventScroll: true });
      sentPanel.current?.scrollIntoView({ block: 'nearest' });
    } else if (status === 'error') {
      submit.current?.focus();
    } else if (status === 'idle' && previousStatus.current === 'sent') {
      nameInput.current?.focus();
    }
    previousStatus.current = status;
  }, [status]);

  const update = (key: keyof ContactFields) => (event: { target: { value: string } }) =>
    setFields((current) => ({ ...current, [key]: event.target.value }));

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setStatus('sending');
    try {
      await postJSON('/contact', { ...fields, website });
      setSentTo(fields.email.trim());
      setFields(EMPTY);
      setWebsite('');
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  };

  const sending = status === 'sending';

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
          {status === 'sent' ? (
            <div
              ref={sentPanel}
              className="flex scroll-mt-28 flex-col items-center gap-5 border border-sable bg-papier px-6 py-14 text-center sm:px-9 sm:py-20"
            >
              <span className="flex size-14 items-center justify-center rounded-full border border-or text-bronze">
                <Check size={26} strokeWidth={1.5} aria-hidden="true" />
              </span>
              <h3 ref={sentHeading} tabIndex={-1} className="text-[22px] leading-snug font-bold focus:outline-none">
                Message envoyé
              </h3>
              <GrenailleDivider />
              <p className="max-w-sm font-serif text-[15px] leading-[1.72] text-pierre">
                Merci, l’atelier a bien reçu votre message. Nous vous répondons à{' '}
                <span className="break-words text-charbon">{sentTo}</span>.
              </p>
              <button
                type="button"
                onClick={() => setStatus('idle')}
                className={`${textLink} mt-2 font-sans text-xs font-semibold uppercase tracking-[0.16em]`}
              >
                Écrire un autre message
              </button>
            </div>
          ) : (
            <form
              onSubmit={onSubmit}
              aria-busy={sending}
              className="flex flex-col gap-5 border border-sable bg-papier p-6 sm:p-9"
            >
              <fieldset disabled={sending} className="flex min-w-0 flex-col gap-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className={fieldLabel}>
                    Nom
                    <input
                      ref={nameInput}
                      className={fieldInput}
                      type="text"
                      autoComplete="name"
                      maxLength={100}
                      value={fields.name}
                      onChange={update('name')}
                      required
                    />
                  </label>
                  <label className={fieldLabel}>
                    Société
                    <input
                      className={fieldInput}
                      type="text"
                      autoComplete="organization"
                      maxLength={150}
                      value={fields.company}
                      onChange={update('company')}
                    />
                  </label>
                </div>
                <label className={fieldLabel}>
                  Email
                  <input
                    className={fieldInput}
                    type="email"
                    autoComplete="email"
                    maxLength={254}
                    value={fields.email}
                    onChange={update('email')}
                    required
                  />
                </label>
                <label className={fieldLabel}>
                  Message
                  <textarea
                    className={fieldTextarea}
                    rows={5}
                    maxLength={5000}
                    value={fields.message}
                    onChange={update('message')}
                    required
                  />
                </label>
                <div aria-hidden="true" className="sr-only">
                  <label>
                    Site web, à laisser vide
                    <input
                      type="text"
                      name="website"
                      tabIndex={-1}
                      autoComplete="off"
                      value={website}
                      onChange={(event) => setWebsite(event.target.value)}
                    />
                  </label>
                </div>
                <button ref={submit} type="submit" className={submitButton}>
                  {sending ? (
                    <>
                      <Loader2 size={16} className="motion-safe:animate-spin" aria-hidden="true" />
                      Envoi en cours…
                    </>
                  ) : (
                    'Envoyer le message'
                  )}
                </button>
              </fieldset>
              {status === 'error' ? (
                <div
                  role="alert"
                  className="flex gap-3 border-l-2 border-bronze bg-lin px-4 py-3.5 font-sans text-[13px] leading-relaxed text-charbon"
                >
                  <AlertCircle size={18} strokeWidth={1.5} className="mt-px shrink-0 text-bronze" aria-hidden="true" />
                  <p>
                    Votre message n’a pas pu partir. Réessayez dans quelques minutes, ou{' '}
                    <a href={buildContactMailto(fields)} className={textLink}>
                      envoyez-le depuis votre messagerie
                    </a>
                    .
                  </p>
                </div>
              ) : (
                <p className="font-sans text-[13px] leading-relaxed text-pierre">
                  Nous vous répondons à l’adresse email indiquée.
                </p>
              )}
            </form>
          )}
        </Reveal>
      </Container>
    </section>
  );
}
