// React
import { useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
// Libs
import { Button, DatePicker, Form, InfoBox, ModalActions, ModalTitle, text } from 'bp-kit';
import { z } from 'zod';
// Local
import { formatDate } from '../domain';

interface Props {
  close: () => void;
  onCreate: (firstDate: string) => Promise<void>;
  minDate: string | null;
}

export function CreateCohortModal({ close, onCreate, minDate }: Props) {
  const schema = useMemo(
    () =>
      z.object({
        firstDate: z
          .string()
          .min(1, text.validation.required('a data'))
          .refine((date) => !minDate || date >= minDate, 'A 1ª aula não pode ser antes do café agendado'),
      }),
    [minDate],
  );
  type FormValues = z.infer<typeof schema>;

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { firstDate: '' } });

  const submit = handleSubmit(async (values) => {
    await onCreate(values.firstDate);
    close();
  });

  return (
    <>
      <ModalTitle>Nova turma de integração</ModalTitle>
      <Form onSubmit={submit}>
        {minDate && (
          <InfoBox variant="info">A 1ª aula precisa ser em ou depois de {formatDate(minDate)}, data do café agendado.</InfoBox>
        )}

        <DatePicker
          label="Data da 1ª aula"
          control={control}
          name="firstDate"
          isDateDisabled={minDate ? (date) => toDateKey(date) < minDate : undefined}
        />

        <ModalActions>
          <Button type="button" variant="secondary" onClick={close}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : 'Criar'}
          </Button>
        </ModalActions>
      </Form>
    </>
  );
}

function toDateKey(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
