import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { clsx } from 'clsx';
import ErrorBoundary from '../ErrorBoundary';
import { Container, SectionHeading } from './Layout';
import { DEFAULT_RING_MATERIAL, RING_MATERIALS, type RingMaterial } from './ring/materials';

// three.js n'est téléchargé qu'à l'approche de la section.
const RingScene = lazy(() => import('./ring/RingScene'));

function RingFallback({ material, message }: { material: RingMaterial; message?: string }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
      <span
        aria-hidden="true"
        className="size-28 rounded-full shadow-[0_24px_36px_-18px_rgb(43_41_40/0.55)] transition-[background] duration-700"
        style={{ background: material.grain }}
      />
      {message && <p className="px-6 text-center font-sans text-[13px] text-pierre">{message}</p>}
    </div>
  );
}

/** « De la cire au métal » : la bague granulée en 3D et ses matières. */
export default function RingShowcase() {
  const stageRef = useRef<HTMLDivElement>(null);
  const [material, setMaterial] = useState<RingMaterial>(DEFAULT_RING_MATERIAL);
  const [near, setNear] = useState(() => typeof IntersectionObserver === 'undefined');
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || near) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          observer.disconnect();
        }
      },
      { rootMargin: '400px 0px' },
    );
    observer.observe(stage);
    return () => observer.disconnect();
  }, [near]);

  const handleError = useCallback((error: unknown) => {
    console.error('Aperçu 3D indisponible :', error);
    setFailed(true);
  }, []);

  const unavailable = <RingFallback material={material} message="Aperçu 3D indisponible sur cet appareil." />;

  return (
    <section aria-labelledby="ring-title" className="bg-lin py-20 md:py-28">
      <Container className="grid items-center gap-x-16 gap-y-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        <div className="lg:col-start-1 lg:row-start-1 lg:self-end">
          <SectionHeading
            align="start"
            eyebrow="De la cire au métal"
            title={<span id="ring-title">Une même pièce, chaque étape de l’atelier</span>}
            divider
            lead="Imprimée en résine pour valider le volume, en cire pour la fonte, puis coulée dans le métal de votre choix. Faites tourner la bague et changez de matière."
          />
        </div>

        <figure className="m-0 flex flex-col gap-3 lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <div ref={stageRef} className="relative aspect-[4/3] max-h-[min(68svh,560px)] w-full select-none">
            {failed ? (
              unavailable
            ) : near ? (
              <ErrorBoundary fallback={unavailable} onError={handleError}>
                <Suspense fallback={<RingFallback material={material} />}>
                  <RingScene material={material} onError={handleError} />
                </Suspense>
              </ErrorBoundary>
            ) : (
              <RingFallback material={material} />
            )}
          </div>
          <figcaption className="text-center font-sans text-[13px] text-pierre">
            Glissez pour faire tourner la bague · rendu indicatif
          </figcaption>
        </figure>

        <div className="flex flex-col gap-6 lg:col-start-1 lg:row-start-2 lg:self-start">
          <div role="group" aria-label="Matière de la bague" className="flex flex-wrap gap-2.5">
            {RING_MATERIALS.map((option) => {
              const selected = option.id === material.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setMaterial(option)}
                  className={clsx(
                    'inline-flex min-h-11 items-center gap-2.5 border px-4 font-sans text-[13px] font-medium transition-colors duration-300',
                    selected
                      ? 'border-charbon bg-charbon text-ivoire'
                      : 'border-charbon/70 text-charbon hover:border-charbon hover:bg-papier',
                  )}
                >
                  <span
                    aria-hidden="true"
                    className="size-3.5 rounded-full shadow-[inset_0_0_0_1px_rgb(43_41_40/0.25)]"
                    style={{ background: option.grain }}
                  />
                  {option.label}
                </button>
              );
            })}
          </div>
          <div aria-live="polite" className="flex min-h-16 flex-col gap-1.5 border-t border-grege pt-4">
            <p className="font-serif text-xl font-bold">{material.label}</p>
            <p className="font-serif text-[15px] leading-relaxed text-pierre">{material.description}</p>
          </div>
        </div>
      </Container>
    </section>
  );
}
