import { useEffect, useRef, useState, type ReactNode } from 'react';
import { clsx } from 'clsx';

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Décalage en ms, pour échelonner les éléments d'une même rangée. */
  delay?: number;
};

/** Apparition en fondu au défilement. Désactivée par `prefers-reduced-motion` (cf. index.css). */
export default function Reveal({ children, className, delay = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(() => typeof IntersectionObserver === 'undefined');

  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '0px 0px -10% 0px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [visible]);

  return (
    <div
      ref={ref}
      data-visible={visible}
      className={clsx('reveal', className)}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
