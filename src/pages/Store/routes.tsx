// React
import { Route, Routes } from 'react-router-dom';
// Local
import { EditStoreItemPage } from './Edit';
import { StoreItemsProvider } from './hooks/StoreItemsProvider';
import { NewStoreItemPage } from './New';
import { StorePage } from '.';

export function StoreRoutes() {
  return (
    <StoreItemsProvider>
      <Routes>
        <Route index element={<StorePage />} />
        <Route path="novo" element={<NewStoreItemPage />} />
        <Route path=":id/editar" element={<EditStoreItemPage />} />
      </Routes>
    </StoreItemsProvider>
  );
}
