// React
import { useNavigate, useParams } from 'react-router-dom';
// Libs
import { Button, Empty, ModalActions, ModalTitle, Typography, useModal } from 'bp-kit';
import { Trash2 } from 'lucide-react';
// Components
import { PageHeader } from '../../../components/PageHeader';
// Local
import { AppRoute } from '../../../routes/paths';
import { StoreItemForm } from '../components/StoreItemForm';
import { useStoreItemsCtx } from '../hooks/StoreItemsProvider';

export function EditStoreItemPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { items, updateItem, removeItem } = useStoreItemsCtx();
  const { open, close, modal } = useModal('dialog');

  const item = items.find((i) => i.id === id);

  if (!item) return <Empty title="Item não encontrado" description="" />;

  const confirmRemove = () =>
    open(
      <>
        <ModalTitle onClose={close}>Remover {item.name}?</ModalTitle>
        <Typography type="p">Essa ação não pode ser desfeita.</Typography>
        <ModalActions>
          <Button
            type="button"
            variant="danger"
            onClick={() => {
              removeItem(item.id);
              close();
              navigate(AppRoute.Store);
            }}
          >
            <Trash2 size={16} />
            Remover
          </Button>
        </ModalActions>
      </>,
    );

  return (
    <div>
      <PageHeader
        title="Editar item"
        subtitle={item.name}
        back
        action={
          <Button variant="danger" onClick={confirmRemove}>
            <Trash2 size={16} />
            Remover
          </Button>
        }
      />

      <StoreItemForm
        item={item}
        onSubmit={(values) => {
          updateItem(item.id, values);
          navigate(AppRoute.Store);
        }}
      />

      {modal}
    </div>
  );
}
