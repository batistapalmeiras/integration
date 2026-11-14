// React
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

export function useStuck(enabled: boolean) {
  const barRef = useRef<HTMLDivElement>(null);
  const fullHeight = useRef(0);
  const [stuck, setStuck] = useState(false);
  const [spare, setSpare] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    const update = () => {
      const bar = barRef.current;
      if (!bar) return;
      setStuck(window.scrollY > 0 && bar.getBoundingClientRect().top <= parseFloat(getComputedStyle(bar).top) + 0.5);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [enabled]);

  useLayoutEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    if (!stuck) fullHeight.current = bar.offsetHeight;
    setSpare(stuck ? Math.max(0, fullHeight.current - bar.offsetHeight) : 0);
  }, [stuck]);

  return { barRef, stuck, spare };
}
