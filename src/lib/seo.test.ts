import { beforeEach, describe, expect, it } from 'vitest';
import { applyPageMeta, canonicalUrl, DEFAULT_META, metaForPath } from './seo';

describe('metaForPath', () => {
  it('gives each public page its own title and description', () => {
    const paths = ['/', '/services', '/fonte', '/impression', '/moulage', '/contact', '/legal/cgv'];
    const titles = paths.map((p) => metaForPath(p).title);

    expect(new Set(titles).size).toBe(paths.length);
    for (const p of paths) expect(metaForPath(p).description.length).toBeLessThanOrEqual(175);
  });

  it('keeps account pages out of search engines but not the showcase pages', () => {
    for (const p of ['/login', '/register', '/reset', '/waiting-approval']) expect(metaForPath(p).noindex).toBe(true);
    for (const p of ['/', '/services', '/fonte', '/contact']) expect(metaForPath(p).noindex).toBeUndefined();
  });

  it('ignores a trailing slash and falls back to the home meta for an unknown path', () => {
    expect(metaForPath('/fonte/').title).toBe(metaForPath('/fonte').title);
    expect(metaForPath('/nimporte-quoi')).toBe(DEFAULT_META);
  });
});

describe('canonicalUrl', () => {
  it('is the absolute address on the main domain, without a trailing slash except for the home page', () => {
    expect(canonicalUrl('/')).toBe('https://lagrenaille.fr/');
    expect(canonicalUrl('/fonte/')).toBe('https://lagrenaille.fr/fonte');
  });
});

describe('applyPageMeta', () => {
  beforeEach(() => {
    document.head.innerHTML = '<meta name="description" content="ancienne"><title>ancien</title>';
  });

  it('updates the existing description instead of adding a second one', () => {
    applyPageMeta(document, metaForPath('/fonte'), canonicalUrl('/fonte'));

    expect(document.title).toBe(metaForPath('/fonte').title);
    expect(document.head.querySelectorAll('meta[name="description"]')).toHaveLength(1);
    expect(document.head.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(metaForPath('/fonte').description);
    expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe('https://lagrenaille.fr/fonte');
  });

  it('adds noindex and drops the canonical link on an account page, then removes noindex again', () => {
    applyPageMeta(document, metaForPath('/login'), null);

    expect(document.head.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex, nofollow');
    expect(document.head.querySelector('link[rel="canonical"]')).toBeNull();

    applyPageMeta(document, metaForPath('/contact'), canonicalUrl('/contact'));

    expect(document.head.querySelector('meta[name="robots"]')).toBeNull();
    expect(document.head.querySelector('link[rel="canonical"]')).not.toBeNull();
  });
});
