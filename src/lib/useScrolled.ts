// React
import { useEffect, useRef, useState } from 'react';

export function useWindowScrolled(): boolean {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 0);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  return scrolled;
}

export function useParentScrolled<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const parent = ref.current?.parentElement;
    if (!parent) return undefined;
    const update = () => setScrolled(parent.scrollTop > 0);
    update();
    parent.addEventListener('scroll', update, { passive: true });
    return () => parent.removeEventListener('scroll', update);
  }, []);

  return [ref, scrolled] as const;
}
