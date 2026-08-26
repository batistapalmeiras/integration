// React
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
// Libs
import {
  Button,
  Empty,
  Form,
  InfoBox,
  ModalActions,
  ModalTitle,
  PageHeader,
  Select,
  Skeleton,
  Switch,
  text,
  TextInput,
  Typography,
  useAuthCtx,
  useModal,
  useToast,
} from 'bp-kit';
import { z } from 'zod';
// Local
import { AppRoute } from '../../../routes/paths';
import { ADMIN_MANAGEABLE_ROLES, ROLE_LABELS, UserRole } from '../../../types/enums';
import { Content, DangerLink } from '../../Visitors/Detail/styles';
import { useVolunteerDetail } from '../hooks/useVolunteerDetail';

const schema = z.object({
  name: z.string().min(1, text.validation.required('o nome')),
  email: z.string().email(text.validation.emailInvalid),
  role: z.nativeEnum(UserRole, { message: text.validation.selectRequired('o cargo') }),
});

type FormValues = z.infer<typeof schema>;

export function VolunteerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthCtx();
  const { show: showToast, toast } = useToast();
  const { open, close, modal } = useModal('drawer');
  const { volunteer, email, loading, error, updateVolunteer, updateEmail, setActive, removeVolunteer } =
    useVolunteerDetail(id ?? '');

  const isPastor = user?.role === UserRole.Pastor;
  // Admin can still see this volunteer's current role even if it's outside
  // what they're allowed to set (e.g. viewing their own Admin account) —
  // the option just won't be offered as something new to switch to.
  const roleOptions = isPastor
    ? Object.values(UserRole)
    : Array.from(new Set([...ADMIN_MANAGEABLE_ROLES, ...(volunteer ? [volunteer.role] : [])]));

  // Admin can see every volunteer (matches the list), but can only edit
  // integration_team/teacher ones (or their own account) — Admin/Pastor
  // accounts are Pastor's to manage. Enforced server-side too (RLS +
  // Edge Functions); this just keeps the form from offering an action
  // that would fail silently.
  const isSelf = volunteer?.id === user?.id;
  const isTargetPrivileged = volunteer?.role === UserRole.Admin || volunteer?.role === UserRole.Pastor;
  const canEdit = isPastor || isSelf || !isTargetPrivileged;
  // bp-kit's Select has no disabled prop — lock it to a single option
  // (the current role) instead when the form is read-only.
  const visibleRoleOptions = canEdit ? roleOptions : volunteer ? [volunteer.role] : [];

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: volunteer ? { name: volunteer.name, role: volunteer.role, email: email ?? '' } : undefined,
  });

  if (loading) return <Skeleton $h="320px" />;
  if (error || !volunteer) return <Empty title="Voluntário não encontrado" description={error ?? ''} />;

  const submit = handleSubmit(async (values) => {
    await updateVolunteer(values.name, values.role);
    if (values.email !== email) {
      try {
        await updateEmail(values.email);
      } catch (e) {
        showToast(e instanceof Error ? e.message : 'Não foi possível alterar o e-mail.');
        return;
      }
    }
    showToast('Dados salvos.');
  });

  const toggleActive = async () => {
    try {
      await setActive(!volunteer.active);
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Não foi possível atualizar.');
    }
  };

  const confirmRemove = () =>
    open(
      <>
        <ModalTitle>Remover {volunteer.name}?</ModalTitle>
        <Typography type="p">
          Isso apaga o login dessa pessoa por completo — ela não conseguirá mais entrar no sistema.
        </Typography>
        <ModalActions>
          <Button type="button" variant="secondary" onClick={close}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={async () => {
              try {
                await removeVolunteer();
                close();
                navigate(AppRoute.Volunteers);
              } catch (e) {
                showToast(e instanceof Error ? e.message : 'Não foi possível remover.');
              }
            }}
          >
            Remover
          </Button>
        </ModalActions>
      </>,
    );

  return (
    <Content>
      <PageHeader title={volunteer.name} subtitle="Editar voluntário" back />

      {!canEdit && (
        <InfoBox variant="info">Só o Pastor pode editar contas de Administrador ou Pastor.</InfoBox>
      )}

      <Form onSubmit={submit}>
        <TextInput
          label={text.fields.name}
          control={control}
          name="name"
          placeholder={text.fields.fullName}
          disabled={!canEdit}
        />
        <TextInput
          label={text.fields.email}
          control={control}
          name="email"
          type="email"
          placeholder={text.fields.emailPlaceholder}
          disabled={!canEdit}
        />
        <Select label="Cargo" control={control} name="role">
          {visibleRoleOptions.map((role) => (
            <option key={role} value={role}>
              {ROLE_LABELS[role]}
            </option>
          ))}
        </Select>
        <Switch label="Conta ativa" checked={volunteer.active} onChange={toggleActive} disabled={!canEdit} />

        {canEdit && (
          <>
            <Button type="submit" variant="primary" size="lg" fullWidth disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </Button>

            <DangerLink type="button" onClick={confirmRemove}>
              Remover voluntário
            </DangerLink>
          </>
        )}
      </Form>

      {toast}
      {modal}
    </Content>
  );
}
