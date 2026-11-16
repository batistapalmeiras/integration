// React
import { useEffect, useRef, useState } from 'react';

export function useInView<T extends Element>(topOffset: number) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      rootMargin: `-${topOffset}px 0px 0px 0px`,
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [topOffset]);

  return [ref, inView] as const;
}
