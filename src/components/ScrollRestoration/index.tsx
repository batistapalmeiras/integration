// React
import { useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

const RESTORE_TIMEOUT_MS = 2000;

const positions = new Map<string, number>();

function restoreScroll(target: number): () => void {
  const deadline = Date.now() + RESTORE_TIMEOUT_MS;
  let frame = 0;
  const attempt = () => {
    const reachable = document.documentElement.scrollHeight - window.innerHeight >= target;
    if (reachable || Date.now() > deadline) {
      window.scrollTo(0, target);
      return;
    }
    frame = requestAnimationFrame(attempt);
  };
  attempt();
  return () => cancelAnimationFrame(frame);
}

export function ScrollRestoration() {
  const { key, pathname } = useLocation();
  const navigationType = useNavigationType();
  const currentKey = useRef(key);
  const previousPath = useRef(pathname);

  useEffect(() => {
    window.history.scrollRestoration = 'manual';
    const remember = () => positions.set(currentKey.current, window.scrollY);
    window.addEventListener('scroll', remember, { passive: true });
    return () => window.removeEventListener('scroll', remember);
  }, []);

  useLayoutEffect(() => {
    currentKey.current = key;
    const pathChanged = previousPath.current !== pathname;
    previousPath.current = pathname;
    if (navigationType === 'POP') return restoreScroll(positions.get(key) ?? 0);
    if (navigationType === 'PUSH' && pathChanged) window.scrollTo(0, 0);
    return undefined;
  }, [key, pathname, navigationType]);

  return null;
}
