// React
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
// Libs
import { Button, PageHeader, TextInput } from 'bp-kit';
// Local
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
  });

  const submit = handleSubmit(async (values) => {
    await createPerson(values);
    navigate(AppRoute.Visitors);
  });

  return (
    <div>
      <PageHeader title="Novo visitante" subtitle="Dados coletados no cartão de visitante" back />

      <Form onSubmit={submit}>
        <TextInput label="Nome" control={control} name="name" placeholder="Nome completo" />
        <TextInput label="Telefone" control={control} name="phone" mask="phone" placeholder="(11) 99999-9999" />
        <TextInput label="Idade" control={control} name="age" type="text" inputMode="numeric" placeholder="Idade" />
        <TextInput label="E-mail" control={control} name="email" type="email" placeholder="seu@email.com" />

        <Actions>
          <Button type="button" variant="secondary" onClick={() => navigate(AppRoute.Visitors)}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : 'Salvar'}
          </Button>
        </Actions>
      </Form>
    </div>
  );
}
