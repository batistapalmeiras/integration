// React
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
// Libs
import { Button, Form, InfoBox, ModalActions, ModalTitle, Select, text, TextInput, useToast } from 'bp-kit';
// Local
import { UserRole, ROLE_LABELS } from '../../../types/enums';
import { getDefaultVolunteerPassword } from '../domain';
import { AddVolunteerFormValues, addVolunteerSchema } from '../validators';

interface Props {
  close: () => void;
  onAdd: (email: string, name: string, role: UserRole) => Promise<void>;
}

export function AddVolunteerModal({ close, onAdd }: Props) {
  const { show: showToast, toast } = useToast();
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<AddVolunteerFormValues>({ resolver: zodResolver(addVolunteerSchema) });

  const submit = handleSubmit(async (values) => {
    try {
      await onAdd(values.email, values.name, values.role);
      close();
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Não foi possível adicionar o voluntário.');
    }
  });

  return (
    <>
      <ModalTitle>Adicionar voluntário</ModalTitle>
      <Form onSubmit={submit}>
        <InfoBox variant="info">A senha inicial será {getDefaultVolunteerPassword()} — repasse ao voluntário.</InfoBox>
        <TextInput label={text.fields.name} control={control} name="name" placeholder={text.fields.fullName} />
        <TextInput label={text.fields.email} control={control} name="email" type="email" placeholder="nome@exemplo.com" />
        <Select label="Cargo" control={control} name="role">
          <option value="">Selecione…</option>
          {Object.entries(ROLE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>

        <ModalActions>
          <Button type="button" variant="secondary" onClick={close}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : 'Adicionar'}
          </Button>
        </ModalActions>
      </Form>
      {toast}
    </>
  );
}
