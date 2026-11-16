// React
import { useEffect, useState } from 'react';

const MIN_DELTA = 4;
const TOP_ZONE = 56;
const BOTTOM_ZONE = 8;

export function useHideOnScroll(enabled: boolean, resetKey: string): boolean {
  const [hidden, setHidden] = useState(false);
  const [lastKey, setLastKey] = useState(resetKey);

  if (resetKey !== lastKey) {
    setLastKey(resetKey);
    setHidden(false);
  }

  useEffect(() => {
    if (!enabled) return undefined;
    let lastY = window.scrollY;
    let frame = 0;

    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const delta = y - lastY;
      const atBottom = window.innerHeight + y >= document.documentElement.scrollHeight - BOTTOM_ZONE;
      if (atBottom || y < TOP_ZONE) setHidden(false);
      else if (delta > MIN_DELTA) setHidden(true);
      else if (delta < -MIN_DELTA) setHidden(false);
      if (Math.abs(delta) > MIN_DELTA) lastY = y;
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, [enabled]);

  return enabled && hidden;
}
