// React
import { createContext, useContext, useEffect } from 'react';

export const ModuleBarContext = createContext<(hidden: boolean) => void>(() => undefined);

export function useHideModuleBar(hidden: boolean): void {
  const setHidden = useContext(ModuleBarContext);

  useEffect(() => {
    setHidden(hidden);
    return () => setHidden(false);
  }, [hidden, setHidden]);
}
