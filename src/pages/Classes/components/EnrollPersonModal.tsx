// React
import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
// Libs
import { Button, Form, ModalActions, ModalTitle, Select, text } from 'bp-kit';
import { UserPlus } from 'lucide-react';
import { z } from 'zod';
// Local
import { EnrollablePerson, listEnrollablePeople } from '../../../domain/classesRoster';

const schema = z.object({
  personId: z.string().min(1, text.validation.selectRequired('a pessoa')),
});
type FormValues = z.infer<typeof schema>;

interface Props {
  cohortId: string;
  close: () => void;
  onEnroll: (person: EnrollablePerson) => Promise<void>;
}

export function EnrollPersonModal({ cohortId, close, onEnroll }: Props) {
  const [candidates, setCandidates] = useState<EnrollablePerson[]>([]);
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { personId: '' } });

  useEffect(() => {
    listEnrollablePeople(cohortId).then(setCandidates);
  }, [cohortId]);

  const submit = handleSubmit(async (values) => {
    const person = candidates.find((c) => c.id === values.personId);
    if (!person) return;
    await onEnroll(person);
    close();
  });

  return (
    <>
      <ModalTitle>Adicionar pessoa à turma</ModalTitle>
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
          <Button type="button" variant="secondary" onClick={close}>
            {text.actions.cancel}
          </Button>
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
