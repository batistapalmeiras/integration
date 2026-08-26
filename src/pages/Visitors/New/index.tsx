// React
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
// Libs
import { Button, PageHeader, text, TextInput } from 'bp-kit';
// Local
import { PHONE_PLACEHOLDER } from '../../../domain/text';
import { AppRoute } from '../../../routes/paths';
import { useCreatePerson } from '../hooks';
import { CreateVisitorFormValues, createVisitorSchema } from '../validators';
import { Actions, Form } from './styles';

export function NewVisitorPage() {
  const navigate = useNavigate();
  const { createPerson } = useCreatePerson();

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<CreateVisitorFormValues>({
    resolver: zodResolver(createVisitorSchema),
    defaultValues: { name: '', phone: '', age: '', email: '' },
  });

  const submit = handleSubmit(async (values) => {
    await createPerson(values);
    navigate(AppRoute.Visitors);
  });

  return (
    <div>
      <PageHeader title="Novo visitante" subtitle="Dados coletados no cartão de visitante" back />

      <Form onSubmit={submit}>
        <TextInput label={text.fields.name} control={control} name="name" placeholder={text.fields.fullName} />
        <TextInput
          label={text.fields.phone}
          control={control}
          name="phone"
          mask="phone"
          placeholder={PHONE_PLACEHOLDER}
        />
        <TextInput
          label={text.fields.email}
          control={control}
          name="email"
          type="email"
          placeholder={text.fields.emailPlaceholder}
        />
        <TextInput label="Idade" control={control} name="age" type="text" inputMode="numeric" placeholder="Idade" />

        <Actions>
          <Button type="button" variant="secondary" onClick={() => navigate(AppRoute.Visitors)}>
            {text.actions.cancel}
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : 'Salvar'}
          </Button>
        </Actions>
      </Form>
    </div>
  );
}
