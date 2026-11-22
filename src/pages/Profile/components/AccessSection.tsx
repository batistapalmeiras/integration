// React
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
// Libs
import {
  Button,
  Form,
  InfoBox,
  Skeleton,
  ModalActions,
  ModalTitle,
  Select,
  text,
  Typography,
  useAuthCtx,
  useModal,
  useToast,
} from 'bp-kit';
import { Save, Trash2, UserPlus } from 'lucide-react';
import { z } from 'zod';
import styled from 'styled-components';
// Components
import { PageHeader } from '../../../components/PageHeader';
// Local
import { useRole } from '../../../features/access/useRole';
import { MEMBERSHIP_STATUS_LABELS } from '../../../domain/memberRecords';
import { assignableRoles, defaultVolunteerPassword } from '../../../domain/volunteers';
import { usePersonVolunteer } from '../../../queries/person';
import { pickKeys } from '../../../lib/useListParams';
import { hasRole, PRIVILEGED_ACCOUNT_ROLES, UserRole } from '../../../types/enums';
import { RoleOptions } from '../../Volunteers/components/RoleOptions';
import { grantAccess } from '../../Volunteers/hooks/grantAccess';
import { useVolunteerDetail } from '../../Volunteers/hooks/useVolunteerDetail';

const Section = styled.section`
  max-width: 560px;

  & > [role='note'] {
    margin-block: ${({ theme }) => theme.spacing.md};
  }
`;

const accessSchema = z.object({
  role: z.nativeEnum(UserRole, { message: text.validation.selectRequired('o cargo') }),
});

type FormValues = z.infer<typeof accessSchema>;

interface ManageProps {
  volunteerId: string;
  onRemoved?: () => void;
}

function ManageAccess({ volunteerId, onRemoved }: ManageProps) {
  const { user } = useAuthCtx();
  const role = useRole();
  const { show: showToast, toast } = useToast();
  const { open, close, modal } = useModal('drawer');
  const { volunteer, saveRole, removeVolunteer } = useVolunteerDetail(volunteerId);

  const canEdit = role === UserRole.GeneralAdmin || !hasRole(volunteer?.role, PRIVILEGED_ACCOUNT_ROLES);
  const canManage = canEdit && volunteer?.id !== user?.id;
  const roleOptions = Array.from(new Set([...assignableRoles(role), ...(volunteer ? [volunteer.role] : [])]));

  const {
    control,
    handleSubmit,
    formState: { isSubmitting, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(accessSchema),
    values: volunteer ? { role: volunteer.role } : undefined,
  });

  if (!volunteer) return null;

  const statusKey = pickKeys([volunteer.membershipStatus ?? ''], MEMBERSHIP_STATUS_LABELS)[0];

  const submit = handleSubmit(async (values) => {
    try {
      await saveRole(values.role);
      showToast('Cargo salvo.');
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Não foi possível salvar.');
    }
  });

  const confirmRemove = () =>
    open(
      <>
        <ModalTitle onClose={close}>Remover o acesso de {volunteer.name}?</ModalTitle>
        <Typography type="p">
          Isso apaga o login dessa pessoa por completo — ela não conseguirá mais entrar no sistema. O cadastro dela na
          igreja continua.
        </Typography>
        <ModalActions>
          <Button
            type="button"
            variant="danger"
            onClick={async () => {
              try {
                await removeVolunteer();
                close();
                onRemoved?.();
              } catch (e) {
                showToast(e instanceof Error ? e.message : 'Não foi possível remover o acesso.');
              }
            }}
          >
            <Trash2 size={16} />
            Remover
          </Button>
        </ModalActions>
      </>,
    );

  return (
    <Section aria-label="Acesso ao sistema">
      <PageHeader title="Acesso ao sistema" />

      {statusKey !== 'active' && (
        <InfoBox variant="warning">
          Sem acesso: a situação do membro é {statusKey ? `"${MEMBERSHIP_STATUS_LABELS[statusKey]}"` : 'indefinida'}. Só
          membros ativos entram no sistema.
        </InfoBox>
      )}

      {!canEdit && (
        <InfoBox variant="info">
          Só o Administrador Geral pode editar contas de Administrador ou Administrador Geral.
        </InfoBox>
      )}

      <Form onSubmit={submit}>
        <Select label="Cargo" control={control} name="role">
          <RoleOptions roles={canManage ? roleOptions : [volunteer.role]} />
        </Select>

        {canManage && (
          <>
            <Button type="submit" variant="primary" size="lg" fullWidth disabled={isSubmitting || !isDirty}>
              {isSubmitting ? (
                'Salvando...'
              ) : (
                <>
                  <Save size={16} />
                  Salvar
                </>
              )}
            </Button>
            <Button type="button" variant="danger" fullWidth onClick={confirmRemove}>
              <Trash2 size={16} />
              Remover acesso
            </Button>
          </>
        )}
      </Form>

      {toast}
      {modal}
    </Section>
  );
}

function GrantAccess({ personId }: { personId: string }) {
  const role = useRole();
  const { show: showToast, toast } = useToast();
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(accessSchema), defaultValues: { role: undefined } });

  const submit = handleSubmit(async (values) => {
    try {
      await grantAccess(personId, values.role);
      showToast('Acesso liberado.');
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Não foi possível liberar o acesso.');
    }
  });

  return (
    <Section aria-label="Acesso ao sistema">
      <PageHeader title="Acesso ao sistema" />

      <InfoBox variant="info">
        Essa pessoa ainda não tem acesso ao sistema. Ela entra com o e-mail do cadastro, e a senha inicial será{' '}
        {defaultVolunteerPassword()} — repasse a ela.
      </InfoBox>

      <Form onSubmit={submit}>
        <Select label="Cargo" control={control} name="role">
          <option value="">Escolha o cargo…</option>
          <RoleOptions roles={assignableRoles(role)} />
        </Select>

        <Button type="submit" variant="primary" size="lg" fullWidth disabled={isSubmitting}>
          {isSubmitting ? (
            'Liberando...'
          ) : (
            <>
              <UserPlus size={16} />
              Dar acesso
            </>
          )}
        </Button>
      </Form>

      {toast}
    </Section>
  );
}

interface Props {
  personId: string;
  onRemoved?: () => void;
}

export function AccessSection({ personId, onRemoved }: Props) {
  const { data: volunteer, loading } = usePersonVolunteer(personId);

  if (loading) return <Skeleton $h="240px" />;
  if (volunteer) return <ManageAccess volunteerId={volunteer.id} onRemoved={onRemoved} />;
  return <GrantAccess personId={personId} />;
}
