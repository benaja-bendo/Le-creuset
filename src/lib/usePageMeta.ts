import { useEffect } from 'react';
import { applyPageMeta, canonicalUrl, type PageMeta } from './seo';

/** Applique le titre et la description de la page courante. `pathname` fournit le lien canonique ; `null` le retire (pages noindex). */
export function usePageMeta(meta: PageMeta, pathname: string | null) {
  const { title, description, noindex } = meta;
  useEffect(() => {
    applyPageMeta(document, { title, description, noindex }, pathname === null ? null : canonicalUrl(pathname));
  }, [title, description, noindex, pathname]);
}
