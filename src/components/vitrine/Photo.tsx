import { Camera } from 'lucide-react';
import { clsx } from 'clsx';
import type { SitePhoto } from '../../lib/photos';

export function ProvisionalBadge({ className }: { className?: string }) {
  return (
    <span
      className={clsx(
        'pointer-events-none absolute bg-charbon/85 px-2.5 py-1.5 font-sans text-[10px] font-semibold uppercase tracking-[0.14em] text-ivoire',
        className,
      )}
    >
      Photo provisoire
    </span>
  );
}

type PhotoProps = {
  photo: SitePhoto;
  /** Attribut `sizes` de l'image, à ajuster selon la largeur occupée dans la page. */
  sizes: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
};

/** Photo cadrée en `object-cover`, avec le badge « provisoire » tant que le vrai cliché manque. */
export function Photo({ photo, sizes, className, imgClassName, priority = false }: PhotoProps) {
  return (
    <div className={clsx('relative overflow-hidden', className)}>
      <img
        src={photo.src}
        srcSet={photo.srcSet}
        sizes={sizes}
        alt={photo.alt}
        width={photo.width}
        height={photo.height}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className={clsx('absolute inset-0 size-full object-cover', imgClassName)}
      />
      {photo.provisional && <ProvisionalBadge className="bottom-3 left-3" />}
    </div>
  );
}

/** Emplacement réservé à une photo que le client doit fournir. */
export function PhotoPlaceholder({ caption, className }: { caption: string; className?: string }) {
  return (
    <figure className={clsx('m-0 flex flex-col items-center justify-center gap-3 border border-sable bg-lin px-6 text-center', className)}>
      <Camera size={36} strokeWidth={1.1} className="text-bronze" aria-hidden="true" />
      <figcaption className="font-sans text-[13px] text-pierre">Photo à venir · {caption}</figcaption>
    </figure>
  );
}
