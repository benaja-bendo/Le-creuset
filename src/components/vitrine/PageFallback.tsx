import { GrenailleDivider } from './Ornaments';

/**
 * Attente du chunk d'une page de la vitrine. N'apparaît qu'après un court délai
 * (cf. `animate-page-fallback`) : sur une connexion correcte, on ne la voit pas.
 */
export default function PageFallback() {
  return (
    <div role="status" className="flex min-h-[60svh] items-center justify-center">
      <GrenailleDivider className="animate-page-fallback" />
      <span className="sr-only">Chargement de la page…</span>
    </div>
  );
}
