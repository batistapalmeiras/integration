// React
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
// Libs
import { Button, DatePicker, ModalActions, ModalTitle, text } from 'bp-kit';
import { z } from 'zod';
// Local
import { isSunday } from '../domain';

const schema = z.object({
  firstDate: z
    .string()
    .min(1, text.validation.required('a data'))
    .refine(isSunday, 'A primeira aula precisa ser em um domingo'),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  close: () => void;
  onCreate: (firstDate: string) => Promise<void>;
}

export function CreateCohortModal({ close, onCreate }: Props) {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const submit = handleSubmit(async (values) => {
    await onCreate(values.firstDate);
    close();
  });

  return (
    <>
      <ModalTitle>Nova turma de integração</ModalTitle>
      <form onSubmit={submit}>
        <DatePicker
          label="Data da 1ª aula"
          control={control}
          name="firstDate"
          isDateDisabled={(date) => date.getDay() !== 0}
        />

        <ModalActions>
          <Button type="button" variant="secondary" onClick={close}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : 'Criar'}
          </Button>
        </ModalActions>
      </form>
    </>
  );
}
