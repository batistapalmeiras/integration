// React
import { createContext, ReactNode, useContext } from 'react';
// Local
import { useStoreItems } from './useStoreItems';

type StoreItemsCtx = ReturnType<typeof useStoreItems>;

const Ctx = createContext<StoreItemsCtx | null>(null);

// Mock-only state has no backend to refetch from on mount, so the list,
// new-item, and edit-item routes need to share one instance instead of
// each holding its own — otherwise navigating away and back would reset it.
export function StoreItemsProvider({ children }: { children: ReactNode }) {
  const value = useStoreItems();
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStoreItemsCtx(): StoreItemsCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useStoreItemsCtx must be used within a StoreItemsProvider');
  return ctx;
}
