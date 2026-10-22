import { Fragment, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { SitePhoto } from '../../lib/photos';
import { Container } from './Layout';
import { GoldRule } from './Ornaments';
import { ProvisionalBadge } from './Photo';

type Crumb = { label: string; to?: string };

type PageHeroProps = {
  photo: SitePhoto;
  title: ReactNode;
  lead?: ReactNode;
  breadcrumb: Crumb[];
};

/** Photo plein cadre et titre en surimpression, en tête de chaque page de la vitrine. */
export default function PageHero({ photo, title, lead, breadcrumb }: PageHeroProps) {
  return (
    <section className="relative isolate flex min-h-[340px] items-center overflow-hidden bg-charbon sm:min-h-[420px] lg:min-h-[480px]">
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
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgb(28_26_25/0.78)_0%,rgb(28_26_25/0.5)_60%,rgb(28_26_25/0.35)_100%)]" />
      <Container className="flex flex-col gap-5 py-20 text-ivoire sm:py-24">
        <nav aria-label="Fil d’Ariane" className="font-sans text-[13px] text-ivoire/85">
          <ol className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            {breadcrumb.map((crumb, i) => (
              <Fragment key={crumb.label}>
                {i > 0 && (
                  <li aria-hidden="true" className="text-or-clair">
                    ›
                  </li>
                )}
                <li>
                  {crumb.to ? (
                    <Link to={crumb.to} className="underline-offset-4 hover:underline">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span aria-current="page">{crumb.label}</span>
                  )}
                </li>
              </Fragment>
            ))}
          </ol>
        </nav>
        <h1 className="max-w-3xl text-[clamp(2.4rem,1.6rem+3.6vw,4rem)] leading-[1.08] font-normal">{title}</h1>
        <GoldRule className="w-28" />
        {lead && <p className="max-w-xl font-serif text-lg leading-[1.7] text-ivoire/90">{lead}</p>}
      </Container>
      {photo.provisional && <ProvisionalBadge className="right-4 bottom-4" />}
    </section>
  );
}
