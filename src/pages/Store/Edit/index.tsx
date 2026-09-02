// React
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
// Libs
import {
  Button,
  DatePicker,
  Empty,
  Form,
  ImageUpload,
  ImageUploadItem,
  ModalActions,
  ModalTitle,
  MultiSelect,
  PageHeader,
  Switch,
  text,
  TextInput,
  Typography,
  useModal,
} from 'bp-kit';
import { Trash2 } from 'lucide-react';
import { z } from 'zod';
// Local
import { AppRoute } from '../../../routes/paths';
import { useStoreItemsCtx } from '../hooks/StoreItemsProvider';
import { FormActions } from '../styles';
import { SIZE_OPTIONS } from '../types';

const schema = z.object({
  name: z.string().min(1, text.validation.required('o nome')),
  deadline: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export function EditStoreItemPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { items, updateItem, removeItem } = useStoreItemsCtx();
  const { open, close, modal } = useModal('dialog');

  const item = items.find((i) => i.id === id);

  const [images, setImages] = useState<ImageUploadItem[]>(
    () => item?.imageUrls?.map((url) => ({ id: crypto.randomUUID(), url })) ?? [],
  );
  const [sizes, setSizes] = useState<string[]>(item?.sizes ?? []);
  const [active, setActive] = useState(item?.active ?? true);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: item ? { name: item.name, deadline: item.deadline ?? '' } : undefined,
  });

  if (!item) return <Empty title="Item não encontrado" description="" />;

  const submit = handleSubmit((values) => {
    updateItem(item.id, {
      name: values.name.trim(),
      sizes: sizes.length > 0 ? sizes : undefined,
      active,
      deadline: values.deadline || undefined,
      imageUrls: images.length > 0 ? images.map((image) => image.url) : undefined,
    });
    navigate(AppRoute.Store);
  });

  const confirmRemove = () =>
    open(
      <>
        <ModalTitle>Remover {item.name}?</ModalTitle>
        <Typography type="p">Essa ação não pode ser desfeita.</Typography>
        <ModalActions>
          <Button type="button" variant="secondary" onClick={close}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={() => {
              removeItem(item.id);
              close();
              navigate(AppRoute.Store);
            }}
          >
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

      <Form onSubmit={submit}>
        <ImageUpload
          label="Imagens (opcional)"
          value={images}
          onChange={setImages}
          hint="PNG, JPG ou JPEG"
        />

        <TextInput label="Nome do item" control={control} name="name" placeholder="Nome do item" />

        <MultiSelect
          label="Tamanhos (opcional)"
          options={SIZE_OPTIONS.map((size) => ({ value: size, label: size }))}
          value={sizes}
          onChange={setSizes}
        />

        <DatePicker label="Data limite (opcional)" control={control} name="deadline" />

        <Switch label="Item ativo" checked={active} onChange={(e) => setActive(e.target.checked)} />

        <FormActions>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : 'Salvar'}
          </Button>
        </FormActions>
      </Form>

      {modal}
    </div>
  );
}
