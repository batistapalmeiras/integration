// React
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
// Libs
import { Button, DatePicker, Form, ModalActions, ModalTitle, text, Typography, useToast } from 'bp-kit';
import { Save, Trash2 } from 'lucide-react';
import { z } from 'zod';
// Local
import { Council } from '../../domain/councils';
import { formatDate, todayKey } from '../../domain/dates';
import { errorMessage, invalidateQueries } from '../../lib/queryCache';
import { queryKeys } from '../../lib/queryKeys';
import { createCouncil, deleteCouncil, updateCouncil } from '../../repositories/councils';

const schema = z.object({ meetingDate: z.string().min(1, text.validation.required('a data')) });
type FormValues = z.infer<typeof schema>;

interface Props {
  council?: Council;
  close: () => void;
  onDeleted?: () => void;
}

const refreshCouncils = () =>
  Promise.all([
    invalidateQueries(queryKeys.councils),
    invalidateQueries((key) => key[0] === 'person' && key[2] === 'record-info'),
  ]);

export function CouncilModal({ council, close, onDeleted }: Props) {
  const { show: showToast, toast } = useToast();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { isSubmitting, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { meetingDate: council?.meetingDate ?? todayKey() },
  });

  const submit = handleSubmit(async (values) => {
    try {
      if (council) await updateCouncil(council.id, values.meetingDate);
      else await createCouncil(values.meetingDate);
      await refreshCouncils();
      close();
    } catch (e) {
      showToast(errorMessage(e) ?? 'Não foi possível salvar o conselho.');
    }
  });

  const remove = async () => {
    if (!council) return;
    setDeleting(true);
    try {
      await deleteCouncil(council.id);
      await refreshCouncils();
      close();
      onDeleted?.();
    } catch (e) {
      setDeleting(false);
      showToast(errorMessage(e) ?? 'Não foi possível excluir o conselho.');
    }
  };

  if (council && confirmingDelete) {
    const approved = council.members.length;
    return (
      <>
        <ModalTitle onClose={close}>Excluir conselho?</ModalTitle>
        <Typography type="p">
          O Conselho de {formatDate(council.meetingDate)} será excluído.
          {approved > 0 &&
            ` ${approved} ${approved === 1 ? 'membro aprovado nele continua' : 'membros aprovados nele continuam'} membro, mas sem conselho.`}{' '}
          Essa ação não pode ser desfeita.
        </Typography>
        <ModalActions>
          <Button type="button" variant="danger" onClick={remove} disabled={deleting}>
            {deleting ? (
              'Excluindo...'
            ) : (
              <>
                <Trash2 size={16} />
                Excluir conselho
              </>
            )}
          </Button>
          <Button type="button" variant="secondary" onClick={() => setConfirmingDelete(false)}>
            Voltar
          </Button>
        </ModalActions>
        {toast}
      </>
    );
  }

  return (
    <>
      <ModalTitle onClose={close}>{council ? 'Editar conselho' : 'Novo conselho'}</ModalTitle>
      <Form onSubmit={submit}>
        <DatePicker label="Data da reunião" control={control} name="meetingDate" />
        <ModalActions>
          <Button type="submit" variant="primary" disabled={isSubmitting || (!!council && !isDirty)}>
            {isSubmitting ? (
              'Salvando...'
            ) : (
              <>
                <Save size={16} />
                {council ? 'Salvar' : 'Criar'}
              </>
            )}
          </Button>
        </ModalActions>

        {council && (
          <Button type="button" variant="danger" fullWidth onClick={() => setConfirmingDelete(true)}>
            <Trash2 size={16} />
            Excluir conselho
          </Button>
        )}
      </Form>
      {toast}
    </>
  );
}
