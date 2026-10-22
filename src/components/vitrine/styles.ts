/** Classes partagées de la vitrine : boutons, champs de formulaire, liens. */

/** Bouton charbon à filet doré intérieur, comme le verso des cartes de visite. */
export const goldFiletFill =
  'bg-charbon text-ivoire shadow-[inset_0_0_0_4px_var(--color-charbon),inset_0_0_0_5px_var(--color-or)] hover:bg-charbon-doux hover:shadow-[inset_0_0_0_4px_var(--color-charbon-doux),inset_0_0_0_5px_var(--color-or-clair)]';

export const buttonBase =
  'inline-flex min-h-[52px] items-center justify-center gap-3 px-7 text-center font-sans text-[13px] font-semibold uppercase tracking-[0.16em] transition-colors duration-300';

export const submitButton = `${buttonBase} ${goldFiletFill} w-full disabled:cursor-not-allowed disabled:opacity-60`;

export const fieldLabel =
  'flex flex-col gap-2 font-sans text-xs font-semibold uppercase tracking-[0.14em] text-pierre';

export const fieldInput =
  'min-h-[50px] w-full border border-grege bg-white px-4 font-sans text-[15px] font-normal normal-case tracking-normal text-charbon placeholder:text-gris-carte/70 transition-colors focus:border-charbon focus:outline-none';

export const fieldTextarea = `${fieldInput} py-3.5 resize-y`;

export const textLink = 'text-bronze underline decoration-or underline-offset-4 transition-colors hover:text-charbon';
