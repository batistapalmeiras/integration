// React
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
// Libs
import { Button, Form, InfoBox, ModalActions, ModalTitle, Select, Skeleton, useToast } from 'bp-kit';
import { UserPlus } from 'lucide-react';
// Local
import { defaultVolunteerPassword } from '../../../domain/volunteers';
import { errorMessage, useQuery } from '../../../lib/queryCache';
import { queryKeys } from '../../../lib/queryKeys';
import { listVolunteerCandidates } from '../../../repositories/volunteers';
import { UserRole } from '../../../types/enums';
import { AddVolunteerFormValues, addVolunteerSchema } from '../validators';
import { RoleOptions } from './RoleOptions';

interface Props {
  close: () => void;
  onAdd: (personId: string, role: UserRole) => Promise<void>;
  allowedRoles: UserRole[];
}

export function AddVolunteerModal({ close, onAdd, allowedRoles }: Props) {
  const { show: showToast, toast } = useToast();
  const candidates = useQuery(queryKeys.volunteerCandidates, listVolunteerCandidates);
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<AddVolunteerFormValues>({
    resolver: zodResolver(addVolunteerSchema),
    defaultValues: { personId: '' },
  });
  const personId = useWatch({ control, name: 'personId' });
  const chosen = (candidates.data ?? []).find((person) => person.id === personId);

  const submit = handleSubmit(async (values) => {
    try {
      await onAdd(values.personId, values.role);
      close();
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Não foi possível adicionar o voluntário.');
    }
  });

  return (
    <>
      <ModalTitle onClose={close}>Adicionar voluntário</ModalTitle>
      {candidates.loading && <Skeleton $h="160px" />}
      {candidates.error && <InfoBox variant="warning">{errorMessage(candidates.error)}</InfoBox>}
      {candidates.data && (
        <Form onSubmit={submit}>
          <InfoBox variant="info">
            O voluntário entra com o e-mail do cadastro de membro. A senha inicial será {defaultVolunteerPassword()}{' '}
            — repasse ao voluntário.
          </InfoBox>
          <Select label="Membro" control={control} name="personId" searchable>
            <option value="">Selecione…</option>
            {candidates.data.map((person) => (
              <option key={person.id} value={person.id}>
                {person.name}
              </option>
            ))}
          </Select>
          {chosen && !chosen.email && (
            <InfoBox variant="warning">
              Esse membro não tem e-mail no cadastro. Cadastre o e-mail na ficha dele antes, porque ele será o login.
            </InfoBox>
          )}
          <Select label="Cargo" control={control} name="role">
            <option value="">Selecione…</option>
            <RoleOptions roles={allowedRoles} />
          </Select>

          <ModalActions>
            <Button type="submit" variant="primary" disabled={isSubmitting || (!!chosen && !chosen.email)}>
              {isSubmitting ? (
                'Salvando...'
              ) : (
                <>
                  <UserPlus size={16} />
                  Adicionar
                </>
              )}
            </Button>
          </ModalActions>
        </Form>
      )}
      {toast}
    </>
  );
}
