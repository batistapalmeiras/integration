// React
import { useEffect, useState } from 'react';

export function usePresence(open: boolean, exitMs: number): { mounted: boolean; closing: boolean } {
  const [previous, setPrevious] = useState(open);
  const [exiting, setExiting] = useState(false);

  if (open !== previous) {
    setPrevious(open);
    setExiting(!open);
  }

  useEffect(() => {
    if (!exiting) return;
    const timeout = setTimeout(() => setExiting(false), exitMs);
    return () => clearTimeout(timeout);
  }, [exiting, exitMs]);

  return { mounted: open || exiting, closing: exiting };
}
