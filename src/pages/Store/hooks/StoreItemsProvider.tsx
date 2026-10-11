// React
import { createContext, ReactNode, useContext } from 'react';
// Local
import { useStoreItems } from './useStoreItems';

type StoreItemsCtx = ReturnType<typeof useStoreItems>;

const Ctx = createContext<StoreItemsCtx | null>(null);

export function StoreItemsProvider({ children }: { children: ReactNode }) {
  const value = useStoreItems();
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStoreItemsCtx(): StoreItemsCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useStoreItemsCtx must be used within a StoreItemsProvider');
  return ctx;
}
