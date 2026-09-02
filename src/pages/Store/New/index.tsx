// React
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
// Libs
import { Button, DatePicker, Form, ImageUpload, ImageUploadItem, MultiSelect, PageHeader, Switch, text, TextInput } from 'bp-kit';
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

export function NewStoreItemPage() {
  const navigate = useNavigate();
  const { addItem } = useStoreItemsCtx();
  const [images, setImages] = useState<ImageUploadItem[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [active, setActive] = useState(true);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { name: '', deadline: '' } });

  const submit = handleSubmit((values) => {
    addItem({
      name: values.name.trim(),
      sizes: sizes.length > 0 ? sizes : undefined,
      active,
      deadline: values.deadline || undefined,
      imageUrls: images.length > 0 ? images.map((image) => image.url) : undefined,
    });
    navigate(AppRoute.Store);
  });

  return (
    <div>
      <PageHeader title="Novo item" subtitle="Loja" back />

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
    </div>
  );
}
