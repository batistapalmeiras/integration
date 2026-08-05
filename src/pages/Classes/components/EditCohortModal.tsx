// React
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
// Libs
import { Button, ModalActions, ModalTitle, TextInput } from 'bp-kit';
import { z } from 'zod';
// Local
import { Lesson } from '../types';

const schema = z.object({
  date1: z.string().min(1, 'Informe a data'),
  date2: z.string().min(1, 'Informe a data'),
  date3: z.string().min(1, 'Informe a data'),
  date4: z.string().min(1, 'Informe a data'),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  lessons: Lesson[];
  close: () => void;
  onSave: (lessonDates: [string, string, string, string]) => Promise<void>;
}

export function EditCohortModal({ lessons, close, onSave }: Props) {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      date1: lessons[0]?.date,
      date2: lessons[1]?.date,
      date3: lessons[2]?.date,
      date4: lessons[3]?.date,
    },
  });

  const submit = handleSubmit(async (values) => {
    await onSave([values.date1, values.date2, values.date3, values.date4]);
    close();
  });

  return (
    <>
      <ModalTitle>Editar datas das aulas</ModalTitle>
      <form onSubmit={submit}>
        <TextInput label="Aula 1" control={control} name="date1" type="date" />
        <TextInput label="Aula 2" control={control} name="date2" type="date" />
        <TextInput label="Aula 3" control={control} name="date3" type="date" />
        <TextInput label="Aula 4" control={control} name="date4" type="date" />

        <ModalActions>
          <Button type="button" variant="secondary" onClick={close}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : 'Salvar'}
          </Button>
        </ModalActions>
      </form>
    </>
  );
}
