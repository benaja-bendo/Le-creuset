import type { ReactNode } from 'react';
import { Box } from 'lucide-react';
import { clsx } from 'clsx';
import { ORDER_STATUS_LABELS } from '../../lib/orders';
import { GRAINS } from './grains';

/**
 * Aperçus illustratifs de l'espace client, sans données réelles : ils montrent
 * aux visiteurs ce qu'un compte pro leur donne.
 */
function PreviewFrame({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-6 border border-sable bg-papier p-6 font-sans sm:p-8">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="font-serif text-xl">{title}</p>
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-pierre">Aperçu de l’espace client</span>
      </div>
      {children}
    </div>
  );
}

const ORDER_STEPS = Object.entries(ORDER_STATUS_LABELS);
const CURRENT_STEP = 2;

const WEIGHT_ACCOUNTS = [
  { label: 'Or fin', grain: GRAINS.orJaune },
  { label: 'Argent fin', grain: GRAINS.argent },
  { label: 'Platine', grain: GRAINS.platine },
];

function Grain({ background, className }: { background: string; className?: string }) {
  return <span aria-hidden="true" className={clsx('shrink-0 rounded-full', className)} style={{ background }} />;
}

export function OrderTrackingPreview() {
  return (
    <PreviewFrame title="Commande CMD-2026-0001">
      <ol className="grid grid-cols-4 gap-2">
        {ORDER_STEPS.map(([key, label], i) => (
          <li key={key} className="flex flex-col gap-2.5" aria-current={i === CURRENT_STEP ? 'step' : undefined}>
            <span
              className={clsx('h-[3px]', i < CURRENT_STEP ? 'bg-charbon' : i === CURRENT_STEP ? 'bg-or' : 'bg-grege')}
            />
            <span
              className={clsx(
                'text-[12px] leading-tight sm:text-[13px]',
                i < CURRENT_STEP && 'font-semibold',
                i === CURRENT_STEP && 'font-semibold text-bronze',
                i > CURRENT_STEP && 'text-pierre',
              )}
            >
              {label}
            </span>
          </li>
        ))}
      </ol>
      <ul className="border-t border-sable">
        {WEIGHT_ACCOUNTS.map((account) => (
          <li key={account.label} className="flex items-center justify-between gap-4 border-b border-sable py-3.5 text-sm">
            <span className="flex items-center gap-2.5">
              <Grain background={account.grain} className="size-3" />
              Compte-poids {account.label.toLowerCase()}
            </span>
            <span className="text-pierre">Solde en grammes</span>
          </li>
        ))}
      </ul>
    </PreviewFrame>
  );
}

const QUOTE_OPTIONS = ['Or jaune 750', 'Argent 925', 'Platine 950', 'Impression cire', 'Prototype résine'];

export function QuotePreview() {
  return (
    <PreviewFrame title="Devis STL">
      <div className="flex items-center gap-4 border border-dashed border-gris-carte/60 p-5">
        <Box size={28} strokeWidth={1.4} className="shrink-0 text-bronze" aria-hidden="true" />
        <div className="flex min-w-0 flex-col gap-1">
          <span className="truncate text-[15px] font-semibold">bague-grenaille.stl</span>
          <span className="text-[13px] text-pierre">Fichier déposé · aperçu 3D disponible</span>
        </div>
      </div>
      <div className="flex flex-col gap-2.5">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-pierre">Matériau ou service</span>
        <ul className="flex flex-wrap gap-2 text-[13px] font-medium">
          {QUOTE_OPTIONS.map((option, i) => (
            <li key={option} className={clsx('px-3.5 py-2', i === 0 ? 'bg-charbon text-ivoire' : 'border border-grege')}>
              {option}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-t border-sable pt-4">
        <span className="text-sm text-pierre">Prix indicatif · fonte et impression</span>
        <span className="font-serif text-lg">Calculé selon le volume</span>
      </div>
    </PreviewFrame>
  );
}

const LIBRARY_ITEMS = ['Bague', 'Pendentif', 'Boucles d’oreilles'];

export function LibraryPreview() {
  return (
    <PreviewFrame title="Bibliothèque">
      <ul className="border-t border-sable">
        {LIBRARY_ITEMS.map((item) => (
          <li key={item} className="flex items-center justify-between gap-4 border-b border-sable py-3.5 text-sm">
            <span className="flex items-center gap-3">
              <span aria-hidden="true" className="size-9 border border-grege bg-lin" />
              {item}
            </span>
            <span className="text-pierre">Code moule · à l’atelier</span>
          </li>
        ))}
      </ul>
    </PreviewFrame>
  );
}
