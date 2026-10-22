import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { PHOTOS, type SitePhoto } from '../../lib/photos';
import { Photo } from './Photo';
import Reveal from './Reveal';

type Service = { title: string; text: string; to: string; cta: string; photo: SitePhoto };

const SERVICES: Service[] = [
  {
    title: 'Fonderie',
    text: 'Des réalisations en tous types de métaux : or, argent, platine…',
    to: '/fonte',
    cta: 'Fonte à cire perdue',
    photo: PHOTOS.fonte,
  },
  {
    title: 'Conception & Impression 3D',
    text: 'De l’idée posée au crayon à la modélisation 3D, nous pouvons réaliser vos pièces.',
    to: '/impression',
    cta: 'Conception 3D',
    photo: PHOTOS.impression,
  },
  {
    title: 'Moules',
    text: 'Pour une reproduction de chaque modèle, en série comme à l’unité.',
    to: '/moulage',
    cta: 'Moulage',
    photo: PHOTOS.moulage,
  },
];

export default function ServiceCards({ headingLevel: Heading = 'h3' }: { headingLevel?: 'h2' | 'h3' }) {
  return (
    <ul className="grid gap-6 md:grid-cols-3 lg:gap-8">
      {SERVICES.map((service, i) => (
        <li key={service.to} className="flex">
          <Reveal delay={i * 120} className="flex w-full">
            <Link
              to={service.to}
              className="group flex w-full flex-col border border-sable bg-papier transition-colors duration-500 hover:border-or"
            >
              <Photo
                photo={service.photo}
                sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
                className="aspect-[4/3]"
                imgClassName="transition-transform duration-[1200ms] ease-[var(--ease-luxe)] group-hover:scale-105"
              />
              <div className="flex flex-1 flex-col gap-3 p-7">
                <Heading className="text-[22px] leading-snug font-bold">{service.title}</Heading>
                <p className="font-serif text-[15px] leading-[1.72] text-pierre">{service.text}</p>
                <span className="mt-auto flex items-center gap-2 pt-3 font-sans text-xs font-semibold uppercase tracking-[0.16em] text-bronze">
                  {service.cta}
                  <ArrowRight size={14} aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          </Reveal>
        </li>
      ))}
    </ul>
  );
}
