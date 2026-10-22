import fonte from '../assets/photos/atelier-fonte.webp';
import fonteSmall from '../assets/photos/atelier-fonte-768.webp';
import impression from '../assets/photos/atelier-impression.webp';
import impressionSmall from '../assets/photos/atelier-impression-768.webp';
import moulage from '../assets/photos/atelier-moulage.webp';
import moulageSmall from '../assets/photos/atelier-moulage-768.webp';

export type SitePhoto = {
  src: string;
  srcSet: string;
  alt: string;
  width: number;
  height: number;
  /** Visuel d'attente en place d'une vraie photo de l'atelier : affiche un badge « Photo provisoire ». */
  provisional: boolean;
};

function photo(large: string, small: string, alt: string, provisional: boolean): SitePhoto {
  return {
    src: large,
    srcSet: `${small} 768w, ${large} 1408w`,
    alt,
    width: 1408,
    height: 768,
    provisional,
  };
}

/** Point unique pour remplacer les visuels provisoires par les photos de l'atelier. */
export const PHOTOS = {
  fonte: photo(fonte, fonteSmall, 'Coulée de métal en fusion dans un moule, à l’atelier', true),
  impression: photo(impression, impressionSmall, 'Bague imprimée en 3D sur le plateau de l’imprimante', true),
  moulage: photo(moulage, moulageSmall, 'Coulée de silicone autour d’un modèle de bague', true),
} satisfies Record<string, SitePhoto>;
