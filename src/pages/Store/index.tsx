// Local
import { StoreTable } from './components/StoreTable';
import { useStoreItemsCtx } from './hooks/StoreItemsProvider';

export function StorePage() {
  const { items } = useStoreItemsCtx();

  return <StoreTable items={items} />;
}
