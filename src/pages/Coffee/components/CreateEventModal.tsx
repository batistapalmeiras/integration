// React
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
// Libs
import { Button, DatePicker, Form, ModalActions, ModalTitle, text } from 'bp-kit';
import { z } from 'zod';
// Local
import { formatDate } from '../domain';
import { Hint } from '../styles';

const schema = z.object({ eventDate: z.string().min(1, text.validation.required('a data')) });
type FormValues = z.infer<typeof schema>;

interface Props {
  close: () => void;
  onCreate: (eventDate: string) => Promise<void>;
  initialDate?: string;
}

export function CreateEventModal({ close, onCreate, initialDate }: Props) {
  const {
    control,
    watch,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { eventDate: initialDate ?? '' } });

  const eventDate = watch('eventDate');

  const submit = handleSubmit(async (values) => {
    await onCreate(values.eventDate);
    close();
  });

  return (
    <>
      <ModalTitle>{initialDate ? 'Editar café de boas-vindas' : 'Novo café de boas-vindas'}</ModalTitle>
      <Form onSubmit={submit}>
        <DatePicker label="Data" control={control} name="eventDate" isDateDisabled={(date) => date.getDay() !== 0} />
        {eventDate && <Hint>Agendado para {formatDate(eventDate)}, 17h30.</Hint>}

        <ModalActions>
          <Button type="button" variant="secondary" onClick={close}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : initialDate ? 'Salvar' : 'Criar'}
          </Button>
        </ModalActions>
      </Form>
    </>
  );
}
