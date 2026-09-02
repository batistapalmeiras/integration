// React
import { useState } from 'react';
// Local
import { MOCK_STORE_ITEMS } from '../mock';
import { StoreItem } from '../types';

export function useStoreItems() {
  const [items, setItems] = useState<StoreItem[]>(MOCK_STORE_ITEMS);

  const addItem = (item: Omit<StoreItem, 'id'>) => {
    setItems((prev) => [...prev, { ...item, id: crypto.randomUUID() }]);
  };

  const updateItem = (id: string, patch: Omit<StoreItem, 'id'>) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...patch, id } : i)));
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  return { items, addItem, updateItem, removeItem };
}
