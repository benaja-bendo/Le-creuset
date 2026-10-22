import { isRouteErrorResponse, useRouteError, Link } from 'react-router-dom';
import { Home, RotateCcw } from 'lucide-react';
import Logo from '../../components/brand/Logo';
import { GoldRule } from '../../components/vitrine/Ornaments';
import { buttonBase, goldFiletFill } from '../../components/vitrine/styles';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export default function ErrorPage() {
  const error = useRouteError();
  console.error(error);

  const message =
    error instanceof Error
      ? error.message
      : isRecord(error) && typeof error.statusText === 'string'
        ? error.statusText
        : isRecord(error) && typeof error.message === 'string'
          ? error.message
          : "Erreur système inconnue";

  const notFound = isRouteErrorResponse(error) && error.status === 404;

  return (
    <div className="vitrine flex min-h-screen items-center justify-center bg-ivoire p-6 text-center text-charbon">
      <div className="flex w-full max-w-lg flex-col items-center gap-6">
        <Logo className="h-auto w-56 text-charbon" />
        <GoldRule className="w-40" />
        <h1 className="mt-2 text-3xl font-normal">{notFound ? 'Page introuvable' : 'Une erreur est survenue'}</h1>
        <p className="font-serif text-base leading-[1.7] text-pierre">
          {notFound
            ? 'Cette page n’existe pas ou a été déplacée.'
            : 'Cette page n’a pas pu s’afficher. Réessayez, ou revenez à l’accueil.'}
        </p>
        {!notFound && (
          <p className="w-full border border-sable bg-papier p-4 text-left font-mono text-xs break-words text-red-800">
            {message}
          </p>
        )}
        <div className="flex w-full flex-col gap-3.5 sm:w-auto sm:flex-row">
          <Link to="/" className={`${buttonBase} ${goldFiletFill} whitespace-nowrap`}>
            <Home size={16} aria-hidden="true" />
            Retour à l’accueil
          </Link>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className={`${buttonBase} whitespace-nowrap border border-charbon text-charbon hover:bg-charbon hover:text-ivoire`}
          >
            <RotateCcw size={16} aria-hidden="true" />
            Réessayer
          </button>
        </div>
      </div>
    </div>
  );
}
