// React
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
// Libs
import { Button, text, TextInput } from 'bp-kit';
// Local
import { PHONE_PLACEHOLDER } from '../../../../domain/text';
import { CreateVisitorFormValues, createVisitorSchema } from '../../validators';
import { Person } from '../../types';
import { Actions, Form } from '../styles';

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
    <Form onSubmit={submit}>
      <TextInput
        label={text.fields.name}
        control={control}
        name="name"
        placeholder={text.fields.fullName}
        disabled={!canEdit}
      />
      <TextInput
        label={text.fields.email}
        control={control}
        name="email"
        type="email"
        placeholder={text.fields.emailPlaceholder}
        disabled={!canEdit}
      />
      <TextInput
        label={text.fields.phone}
        control={control}
        name="phone"
        mask="phone"
        placeholder={PHONE_PLACEHOLDER}
        disabled={!canEdit}
      />
      <TextInput label="Idade" control={control} name="age" type="text" inputMode="numeric" placeholder="Idade" disabled={!canEdit} />

      {canEdit && (
        <Actions>
          <Button type="submit" variant="primary" disabled={isSubmitting || person.status === 'archived'}>
            {isSubmitting ? 'Salvando...' : 'Salvar alterações'}
          </Button>
        </Actions>
      )}
    </Form>
  );
}
