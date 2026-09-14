// React
import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
// Libs
import { Button, Form, ModalActions, ModalTitle, Select, text } from 'bp-kit';
import { UserPlus } from 'lucide-react';
import { z } from 'zod';
// Local
import { EnrollableCoffeePerson, listEnrollableCoffeePeople } from '../../../domain/cafeSchedule';

const schema = z.object({
  personId: z.string().min(1, text.validation.selectRequired('a pessoa')),
});
type FormValues = z.infer<typeof schema>;

interface Props {
  eventId: string;
  close: () => void;
  onEnroll: (person: EnrollableCoffeePerson) => Promise<void>;
}

export function EnrollPersonModal({ eventId, close, onEnroll }: Props) {
  const [candidates, setCandidates] = useState<EnrollableCoffeePerson[]>([]);
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { personId: '' } });

  useEffect(() => {
    listEnrollableCoffeePeople(eventId).then(setCandidates);
  }, [eventId]);

  const submit = handleSubmit(async (values) => {
    const person = candidates.find((c) => c.id === values.personId);
    if (!person) return;
    await onEnroll(person);
    close();
  });

  return (
    <>
      <ModalTitle onClose={close}>Adicionar pessoa ao café</ModalTitle>
      <Form onSubmit={submit}>
        <Select label="Pessoa" control={control} name="personId">
          <option value="">Selecione…</option>
          {candidates.map((person) => (
            <option key={person.id} value={person.id}>
              {person.name}
            </option>
          ))}
        </Select>

        <ModalActions>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? (
              'Adicionando...'
            ) : (
              <>
                <UserPlus size={16} />
                Adicionar
              </>
            )}
          </Button>
        </ModalActions>
      </Form>
    </>
  );
}
