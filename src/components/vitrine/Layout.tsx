import type { ReactNode } from 'react';
import { clsx } from 'clsx';
import { GrenailleDivider } from './Ornaments';
import Reveal from './Reveal';

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={clsx('mx-auto w-full max-w-[1280px] px-5 sm:px-8', className)}>{children}</div>;
}

/** Surtitre en capitales espacées, comme « BORDEAUX » sur la carte de visite. */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={clsx('font-serif text-xs font-bold uppercase tracking-[0.32em] text-charbon', className)}>{children}</p>
  );
}

type SectionHeadingProps = {
  title: ReactNode;
  eyebrow?: ReactNode;
  lead?: ReactNode;
  align?: 'center' | 'start';
  divider?: boolean;
  className?: string;
};

export function SectionHeading({ title, eyebrow, lead, align = 'center', divider = false, className }: SectionHeadingProps) {
  const centered = align === 'center';
  return (
    <div className={clsx('flex flex-col gap-5', centered ? 'items-center text-center' : 'items-start', className)}>
      {eyebrow && <Eyebrow className={centered ? 'pl-[0.32em]' : undefined}>{eyebrow}</Eyebrow>}
      <h2 className="text-[clamp(1.75rem,1.2rem+2vw,2.5rem)] leading-[1.2] font-normal">{title}</h2>
      {divider && <GrenailleDivider align={align} />}
      {lead && <p className="max-w-2xl font-serif text-[17px] leading-[1.78] text-pierre">{lead}</p>}
    </div>
  );
}

/** Texte et visuel côte à côte sur grand écran, empilés sur mobile (le texte d'abord). */
export function Split({ media, children, reverse = false }: { media: ReactNode; children: ReactNode; reverse?: boolean }) {
  return (
    <Container className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
      <Reveal className={clsx('flex flex-col gap-6', reverse && 'lg:order-2')}>{children}</Reveal>
      <Reveal delay={120} className={clsx(reverse && 'lg:order-1')}>
        {media}
      </Reveal>
    </Container>
  );
}

export function Paragraph({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={clsx('font-serif text-[17px] leading-[1.78]', className)}>{children}</p>;
}

export function TagList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-wrap gap-2.5">
      {items.map((item) => (
        <li key={item} className="border border-grege bg-papier px-4 py-2.5 font-sans text-sm font-medium">
          {item}
        </li>
      ))}
    </ul>
  );
}

/** En-tête de bloc dans un `Split` : surtitre et titre alignés à gauche. */
export function BlockTitle({ eyebrow, children }: { eyebrow: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="text-[clamp(1.6rem,1.2rem+1.6vw,2.35rem)] leading-[1.25] font-normal">{children}</h2>
    </div>
  );
}
