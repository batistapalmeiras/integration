// React
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
// Libs
import { Button, Form, ModalActions, ModalTitle, text, TextInput } from 'bp-kit';
import { z } from 'zod';
// Local
import { Person } from '../../types';

const schema = z.object({
  smallGroup: z.string().min(1, text.validation.required('o PG')),
  ministry: z.string().min(1, text.validation.required('o ministério')),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  person: Pick<Person, 'id' | 'name'>;
  close: () => void;
  onConfirm: (smallGroup: string, ministry: string) => Promise<void>;
}

export function ConfirmMemberModal({ person, close, onConfirm }: Props) {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const submit = handleSubmit(async (values) => {
    await onConfirm(values.smallGroup, values.ministry);
    close();
  });

  return (
    <>
      <ModalTitle>Confirmar {person.name} como membro</ModalTitle>
      <Form onSubmit={submit}>
        <TextInput label="PG (Pequeno Grupo)" control={control} name="smallGroup" placeholder="Nome do PG" />
        <TextInput label="Ministério" control={control} name="ministry" placeholder="Nome do ministério" />

        <ModalActions>
          <Button type="button" variant="secondary" onClick={close}>
            {text.actions.cancel}
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : 'Confirmar'}
          </Button>
        </ModalActions>
      </Form>
    </>
  );
}
