import { clsx } from 'clsx';

/** Filet doré ponctué de trois grains : la signature « grenaille » sous les titres. */
export function GrenailleDivider({ align = 'center', className }: { align?: 'center' | 'start'; className?: string }) {
  return (
    <div aria-hidden="true" className={clsx('flex items-center gap-2.5', align === 'center' && 'justify-center', className)}>
      <span className="h-px w-14 bg-or" />
      <span className="size-[5px] rounded-full bg-or" />
      <span className="size-2 rounded-full bg-or" />
      <span className="size-[5px] rounded-full bg-or" />
      {align === 'center' && <span className="h-px w-14 bg-or" />}
    </div>
  );
}

/** Filet doré simple, comme sous le logo des cartes de visite. */
export function GoldRule({ className }: { className?: string }) {
  return <div aria-hidden="true" className={clsx('h-px bg-or', className)} />;
}

/** Croix fine des « maîtres-mots ». */
export function GoldCross({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={clsx('size-6', className)} aria-hidden="true">
      <path d="M12 3v18M3 12h18" stroke="var(--color-or)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
