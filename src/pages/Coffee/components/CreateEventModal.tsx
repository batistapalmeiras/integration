// React
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
// Libs
import { Button, DatePicker, Form, ModalActions, ModalTitle, Typography, text } from 'bp-kit';
import { z } from 'zod';
// Local
import { DangerLink } from '../../Visitors/Detail/styles';
import { formatDate } from '../domain';
import { Hint } from '../styles';

const schema = z.object({ eventDate: z.string().min(1, text.validation.required('a data')) });
type FormValues = z.infer<typeof schema>;

interface Props {
  close: () => void;
  onCreate: (eventDate: string) => Promise<void>;
  onDelete?: () => Promise<void>;
  initialDate?: string;
}

export function CreateEventModal({ close, onCreate, onDelete, initialDate }: Props) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
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

  const confirmDelete = async () => {
    setDeleting(true);
    await onDelete?.();
    close();
  };

  if (confirmingDelete) {
    return (
      <>
        <ModalTitle>Cancelar café?</ModalTitle>
        <Typography type="p">
          O café agendado para {initialDate && formatDate(initialDate)} será removido, junto com as confirmações de
          presença já registradas. As pessoas continuam aguardando um novo café ser agendado. Essa ação não pode ser
          desfeita.
        </Typography>
        <ModalActions>
          <Button type="button" variant="secondary" onClick={() => setConfirmingDelete(false)}>
            Voltar
          </Button>
          <Button type="button" variant="danger" onClick={confirmDelete} disabled={deleting}>
            {deleting ? 'Cancelando...' : 'Cancelar café'}
          </Button>
        </ModalActions>
      </>
    );
  }

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

        {onDelete && (
          <DangerLink type="button" onClick={() => setConfirmingDelete(true)}>
            Cancelar café agendado
          </DangerLink>
        )}
      </Form>
    </>
  );
}
