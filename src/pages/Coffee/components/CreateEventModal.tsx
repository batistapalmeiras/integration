// React
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
// Libs
import { Button, DatePicker, Form, ModalActions, ModalTitle, Typography, text } from 'bp-kit';
import { Save, Trash2 } from 'lucide-react';
import { z } from 'zod';
// Local
import { formatDate } from '../../../domain/dates';
import { FormButtons } from '../styles';

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
    handleSubmit,
    formState: { isSubmitting, isDirty },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { eventDate: initialDate ?? '' } });

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
        <ModalTitle onClose={close}>Cancelar café?</ModalTitle>
        <Typography type="p">
          O café agendado para {initialDate && formatDate(initialDate)} será removido, junto com as confirmações de
          presença já registradas. As pessoas continuam aguardando um novo café ser agendado. Essa ação não pode ser
          desfeita.
        </Typography>
        <ModalActions>
          <Button type="button" variant="danger" onClick={confirmDelete} disabled={deleting}>
            {deleting ? (
              'Cancelando...'
            ) : (
              <>
                <Trash2 size={16} />
                Cancelar
              </>
            )}
          </Button>
          <Button type="button" variant="secondary" onClick={() => setConfirmingDelete(false)}>
            Voltar
          </Button>
        </ModalActions>
      </>
    );
  }

  return (
    <>
      <ModalTitle onClose={close}>{initialDate ? 'Editar café de boas-vindas' : 'Novo café de boas-vindas'}</ModalTitle>
      <Form onSubmit={submit}>
        <DatePicker
          label="Data"
          control={control}
          name="eventDate"
          isDateDisabled={(date) => date.getDay() !== 0}
          calendar
        />

        <FormButtons>
          <Button type="submit" variant="primary" disabled={isSubmitting || (!!initialDate && !isDirty)}>
            {isSubmitting ? (
              'Salvando...'
            ) : (
              <>
                <Save size={16} />
                {initialDate ? 'Salvar' : 'Criar'}
              </>
            )}
          </Button>
          {onDelete && (
            <Button type="button" variant="danger" onClick={() => setConfirmingDelete(true)}>
              <Trash2 size={16} />
              Cancelar
            </Button>
          )}
        </FormButtons>
      </Form>
    </>
  );
}
