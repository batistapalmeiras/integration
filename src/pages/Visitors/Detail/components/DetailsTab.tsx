// React
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
// Libs
import { Button, TextInput } from 'bp-kit';
// Local
import { CreateVisitorFormValues, createVisitorSchema } from '../../validators';
import { Person } from '../../types';
import { Actions } from '../styles';

interface Props {
  person: Person;
  canEdit: boolean;
  onSave: (values: CreateVisitorFormValues) => Promise<void>;
}

export function DetailsTab({ person, canEdit, onSave }: Props) {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<CreateVisitorFormValues>({
    resolver: zodResolver(createVisitorSchema),
    defaultValues: {
      name: person.name,
      phone: person.phone,
      age: person.age ? String(person.age) : '',
      email: person.email ?? '',
    },
  });

  const submit = handleSubmit(async (values) => {
    await onSave(values);
  });

  return (
    <form onSubmit={submit}>
      <TextInput label="Nome" control={control} name="name" placeholder="Nome completo" disabled={!canEdit} />
      <TextInput label="Telefone" control={control} name="phone" mask="phone" placeholder="(11) 99999-9999" disabled={!canEdit} />
      <TextInput label="Idade" control={control} name="age" type="text" inputMode="numeric" placeholder="Idade" disabled={!canEdit} />
      <TextInput label="E-mail" control={control} name="email" type="email" placeholder="seu@email.com" disabled={!canEdit} />

      {canEdit && (
        <Actions>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : 'Salvar alterações'}
          </Button>
        </Actions>
      )}
    </form>
  );
}
