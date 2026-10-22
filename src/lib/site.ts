import { Instagram, Linkedin, type LucideIcon } from 'lucide-react';

export const CONTACT = {
  email: 'contact@lagrenaille.fr',
  phoneDisplay: '06 71 14 45 47',
  phoneHref: 'tel:+33671144547',
  city: 'Bordeaux',
} as const;

export type SocialLink = {
  label: string;
  icon: LucideIcon;
  /** `null` tant que le client n'a pas fourni l'adresse du compte : l'icône s'affiche sans lien. */
  href: string | null;
};

export const SOCIAL_LINKS: SocialLink[] = [
  { label: 'Instagram', icon: Instagram, href: null },
  { label: 'LinkedIn', icon: Linkedin, href: null },
];

export const SERVICE_LINKS = [
  { label: 'Fonte à cire perdue', to: '/fonte' },
  { label: 'Conception & Impression 3D', to: '/impression' },
  { label: 'Moules', to: '/moulage' },
] as const;
