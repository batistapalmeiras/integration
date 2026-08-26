// React
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
// Libs
import { Button, DatePicker, ModalActions, ModalTitle, text } from 'bp-kit';
import { z } from 'zod';
// Local
import { DangerLink } from '../../Visitors/Detail/styles';
import { Form } from '../styles';
import { Lesson } from '../types';

const schema = z.object({
  date1: z.string().min(1, text.validation.required('a data')),
  date2: z.string().min(1, text.validation.required('a data')),
  date3: z.string().min(1, text.validation.required('a data')),
  date4: z.string().min(1, text.validation.required('a data')),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  lessons: Lesson[];
  close: () => void;
  onSave: (lessonDates: [string, string, string, string]) => Promise<void>;
  onCloseCohort: () => Promise<void>;
}

export function EditCohortModal({ lessons, close, onSave, onCloseCohort }: Props) {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      date1: lessons[0]?.date ?? '',
      date2: lessons[1]?.date ?? '',
      date3: lessons[2]?.date ?? '',
      date4: lessons[3]?.date ?? '',
    },
  });

  const submit = handleSubmit(async (values) => {
    await onSave([values.date1, values.date2, values.date3, values.date4]);
    close();
  });

  return (
    <>
      <ModalTitle>Editar datas das aulas</ModalTitle>
      <Form onSubmit={submit}>
        <DatePicker label="Aula 1" control={control} name="date1" />
        <DatePicker label="Aula 2" control={control} name="date2" />
        <DatePicker label="Aula 3" control={control} name="date3" />
        <DatePicker label="Aula 4" control={control} name="date4" />

        <ModalActions>
          <Button type="button" variant="secondary" onClick={close}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : 'Salvar'}
          </Button>
        </ModalActions>

        <DangerLink
          type="button"
          onClick={async () => {
            await onCloseCohort();
            close();
          }}
        >
          Encerrar turma
        </DangerLink>
      </Form>
    </>
  );
}
