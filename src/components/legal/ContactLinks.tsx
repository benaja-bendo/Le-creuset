import { CONTACT } from '../../lib/site';

const LINK = 'text-bronze underline decoration-or underline-offset-4 hover:text-charbon';

export function EmailLink() {
  return (
    <a href={`mailto:${CONTACT.email}`} className={LINK}>
      {CONTACT.email}
    </a>
  );
}

export function PhoneLink() {
  return (
    <a href={CONTACT.phoneHref} className={LINK}>
      {CONTACT.phoneDisplay}
    </a>
  );
}
