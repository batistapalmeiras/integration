// React
import { useNavigate } from 'react-router-dom';
// Components
import { PageHeader } from '../../../components/PageHeader';
// Local
import { AppRoute } from '../../../routes/paths';
import { StoreItemForm } from '../components/StoreItemForm';
import { useStoreItemsCtx } from '../hooks/StoreItemsProvider';

export function NewStoreItemPage() {
  const navigate = useNavigate();
  const { addItem } = useStoreItemsCtx();

  return (
    <div>
      <PageHeader title="Novo item" subtitle="Loja" back />
      <StoreItemForm
        onSubmit={(values) => {
          addItem(values);
          navigate(AppRoute.Store);
        }}
      />
    </div>
  );
}
