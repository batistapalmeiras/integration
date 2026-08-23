// React
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
// Libs
import { Button, Form, ModalActions, ModalTitle, MonthPicker, text } from 'bp-kit';
import { z } from 'zod';
// Local
import { firstSundayOfMonth, formatDate } from '../domain';
import { Hint } from '../styles';

const schema = z.object({ month: z.string().min(1, text.validation.selectRequired('o mês')) });
type FormValues = z.infer<typeof schema>;

interface Props {
  close: () => void;
  onCreate: (eventDate: string) => Promise<void>;
  initialMonth?: string;
}

export function CreateEventModal({ close, onCreate, initialMonth }: Props) {
  const {
    control,
    watch,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { month: initialMonth } });

  const month = watch('month');
  const previewDate = month ? firstSundayOfMonth(month) : null;

  const submit = handleSubmit(async (values) => {
    await onCreate(firstSundayOfMonth(values.month));
    close();
  });

  return (
    <>
      <ModalTitle>{initialMonth ? 'Editar café de boas-vindas' : 'Novo café de boas-vindas'}</ModalTitle>
      <Form onSubmit={submit}>
        <MonthPicker label="Mês" control={control} name="month" />
        {previewDate && <Hint>Agendado para {formatDate(previewDate)}, 17h30 — 1º domingo do mês.</Hint>}

        <ModalActions>
          <Button type="button" variant="secondary" onClick={close}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : initialMonth ? 'Salvar' : 'Criar'}
          </Button>
        </ModalActions>
      </Form>
    </>
  );
}
