// React
import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
// Libs
import { Button, Form, ModalActions, ModalTitle, Select, text } from 'bp-kit';
import { UserPlus } from 'lucide-react';
import { z } from 'zod';

const schema = z.object({
  personId: z.string().min(1, text.validation.selectRequired('a pessoa')),
});
type FormValues = z.infer<typeof schema>;

interface Candidate {
  id: string;
  name: string;
}

interface Props<T extends Candidate> {
  title: string;
  loadCandidates: () => Promise<T[]>;
  close: () => void;
  onEnroll: (person: T) => Promise<void>;
}

export function EnrollPersonModal<T extends Candidate>({ title, loadCandidates, close, onEnroll }: Props<T>) {
  const [candidates, setCandidates] = useState<T[]>([]);
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { personId: '' } });

  useEffect(() => {
    loadCandidates().then(setCandidates);
  }, [loadCandidates]);

  const submit = handleSubmit(async (values) => {
    const person = candidates.find((c) => c.id === values.personId);
    if (!person) return;
    await onEnroll(person);
    close();
  });

  return (
    <>
      <ModalTitle onClose={close}>{title}</ModalTitle>
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
