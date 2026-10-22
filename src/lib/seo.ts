export const SITE_URL = 'https://lagrenaille.fr';
const SUFFIX = 'La Grenaille';

export type PageMeta = {
  title: string;
  description: string;
  /** Page à ne pas faire apparaître dans les moteurs de recherche (espace pro, comptes). */
  noindex?: boolean;
};

export const DEFAULT_META: PageMeta = {
  title: 'La Grenaille — Fonderie de métaux précieux à Bordeaux',
  description:
    'La Grenaille, fonderie de métaux précieux à Bordeaux : fonte à cire perdue, conception et impression 3D, moules. Un espace pro pour suivre vos commandes et votre compte-poids.',
};

const ACCOUNT_DESCRIPTION = 'Espace professionnel de La Grenaille : commandes, compte-poids, factures et bibliothèque de moules.';

/** Titre et description de chaque page de la vitrine, par chemin. */
const PAGES: Record<string, PageMeta> = {
  '/': DEFAULT_META,
  '/services': {
    title: `Nos services : fonte, impression 3D et moules | ${SUFFIX}`,
    description:
      'Fonte à cire perdue, conception et impression 3D, moules : toutes les étapes de vos pièces de joaillerie réunies dans un même atelier à Bordeaux.',
  },
  '/fonte': {
    title: `Fonte à cire perdue à Bordeaux | ${SUFFIX}`,
    description:
      'Fonte à cire perdue de bijoux à Bordeaux : or 750 et 375, or blanc palladié, argent 925 et platine 950, sur machine Galloni. Compte-poids consultable en ligne.',
  },
  '/impression': {
    title: `Conception et impression 3D pour la joaillerie | ${SUFFIX}`,
    description:
      'Conception 3D (3Design, Rhino) et impression 3D en cire ou en résine pour la joaillerie. Du croquis à la fonte, avec un devis indicatif à partir de votre fichier STL.',
  },
  '/moulage': {
    title: `Moules à froid et par vulcanisation | ${SUFFIX}`,
    description:
      'Moules à froid et par vulcanisation pour reproduire vos modèles de bijoux en série, stockés à l’atelier à Bordeaux et consultables dans votre espace pro.',
  },
  '/contact': {
    title: `Contact | ${SUFFIX}, fonderie à Bordeaux`,
    description:
      'Contactez La Grenaille, fonderie de métaux précieux à Bordeaux : téléphone, email et formulaire pour vos projets de fonderie, de moulage et d’impression 3D.',
  },
  '/legal/mentions-legales': {
    title: `Mentions légales | ${SUFFIX}`,
    description: 'Mentions légales du site de La Grenaille, fonderie de métaux précieux à Bordeaux.',
  },
  '/legal/cgv': {
    title: `Conditions générales de vente | ${SUFFIX}`,
    description: 'Conditions générales de vente de La Grenaille : devis, commandes, paiement, délais, livraison et garanties.',
  },
  '/legal/privacy': {
    title: `Politique de confidentialité | ${SUFFIX}`,
    description: 'Comment La Grenaille traite vos données personnelles : données collectées, durées de conservation, vos droits.',
  },
  '/login': { title: `Connexion | ${SUFFIX}`, description: ACCOUNT_DESCRIPTION, noindex: true },
  '/register': { title: `Demande d’accès professionnel | ${SUFFIX}`, description: ACCOUNT_DESCRIPTION, noindex: true },
  '/reset': { title: `Mot de passe oublié | ${SUFFIX}`, description: ACCOUNT_DESCRIPTION, noindex: true },
  '/waiting-approval': { title: `Dossier en cours d’examen | ${SUFFIX}`, description: ACCOUNT_DESCRIPTION, noindex: true },
};

export const CLIENT_AREA_META: PageMeta = {
  title: `Espace client | ${SUFFIX}`,
  description: ACCOUNT_DESCRIPTION,
  noindex: true,
};

export const NOT_FOUND_META: PageMeta = {
  title: `Page introuvable | ${SUFFIX}`,
  description: DEFAULT_META.description,
  noindex: true,
};

/** Un chemin inconnu retombe sur l'accueil : mieux vaut un titre correct qu'un titre vide. */
export function metaForPath(pathname: string): PageMeta {
  const clean = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  return PAGES[clean] ?? DEFAULT_META;
}

export function canonicalUrl(pathname: string): string {
  const clean = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  return `${SITE_URL}${clean === '/' ? '/' : clean}`;
}

function upsert(doc: Document, selector: string, create: () => HTMLElement): HTMLElement {
  const existing = doc.head.querySelector<HTMLElement>(selector);
  if (existing) return existing;
  const el = create();
  doc.head.appendChild(el);
  return el;
}

/**
 * Écrit titre, description, lien canonique et directive robots dans le `<head>`.
 * Les balises existent déjà dans `index.html` pour l'accueil ; on les met à jour
 * plutôt que d'en ajouter, pour ne jamais avoir deux descriptions.
 */
export function applyPageMeta(doc: Document, meta: PageMeta, canonical: string | null): void {
  doc.title = meta.title;

  const description = upsert(doc, 'meta[name="description"]', () => {
    const m = doc.createElement('meta');
    m.setAttribute('name', 'description');
    return m;
  });
  description.setAttribute('content', meta.description);

  const robots = doc.head.querySelector<HTMLElement>('meta[name="robots"]');
  if (meta.noindex) {
    const el =
      robots ??
      upsert(doc, 'meta[name="robots"]', () => {
        const m = doc.createElement('meta');
        m.setAttribute('name', 'robots');
        return m;
      });
    el.setAttribute('content', 'noindex, nofollow');
  } else {
    robots?.remove();
  }

  const link = doc.head.querySelector<HTMLElement>('link[rel="canonical"]');
  if (canonical) {
    const el =
      link ??
      upsert(doc, 'link[rel="canonical"]', () => {
        const l = doc.createElement('link');
        l.setAttribute('rel', 'canonical');
        return l;
      });
    el.setAttribute('href', canonical);
  } else {
    link?.remove();
  }
}
