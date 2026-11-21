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
  Select,
  Skeleton,
  text,
  TextInput,
  Typography,
  isCompletePhone,
  maskPhone,
  onlyDigits,
  useAuthCtx,
  useModal,
  useToast,
} from 'bp-kit';
import { Save, Trash2 } from 'lucide-react';
import { z } from 'zod';
// Components
import { PageHeader } from '../../../components/PageHeader';
import { SwitchRow } from '../../../components/SwitchRow';
// Local
import { useRole } from '../../../features/access/useRole';
import { AppRoute } from '../../../routes/paths';
import { canLeavePhoneEmpty } from '../../../domain/memberRecords';
import { assignableRoles } from '../../../domain/volunteers';
import { useLatest } from '../../../lib/useLatest';
import { hasRole, PRIVILEGED_ACCOUNT_ROLES, UserRole } from '../../../types/enums';
import { FormContent } from '../../../components/FormLayout';
import { RoleOptions } from '../components/RoleOptions';
import { useVolunteerDetail } from '../hooks/useVolunteerDetail';

const volunteerSchema = (optionalPhone: boolean) =>
  z.object({
    name: z.string().min(1, text.validation.required('o nome')),
    email: z.string().email(text.validation.emailInvalid),
    phone: z
      .string()
      .refine(
        (value) => (optionalPhone && onlyDigits(value) === '') || isCompletePhone(value),
        optionalPhone ? text.validation.phoneIncomplete : text.validation.required('o telefone'),
      ),
    role: z.nativeEnum(UserRole, { message: text.validation.selectRequired('o cargo') }),
  });

type FormValues = z.infer<ReturnType<typeof volunteerSchema>>;

export function VolunteerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthCtx();
  const role = useRole();
  const { show: showToast, toast } = useToast();
  const { open, close, modal } = useModal('drawer');
  const { volunteer, loading, error, saveVolunteer, setActive, removeVolunteer } = useVolunteerDetail(id ?? '');

  const isGeneralAdmin = role === UserRole.GeneralAdmin;
  const roleOptions = Array.from(new Set([...assignableRoles(role), ...(volunteer ? [volunteer.role] : [])]));

  const isSelf = volunteer?.id === user?.id;
  const isTargetPrivileged = hasRole(volunteer?.role, PRIVILEGED_ACCOUNT_ROLES);
  const canEdit = isGeneralAdmin || isSelf || !isTargetPrivileged;
  const canManage = canEdit && !isSelf;
  const visibleRoleOptions = canManage ? roleOptions : volunteer ? [volunteer.role] : [];
  const optionalPhoneRef = useLatest(canLeavePhoneEmpty(volunteer?.origin));

  const {
    control,
    handleSubmit,
    formState: { isSubmitting, isDirty },
  } = useForm<FormValues>({
    resolver: (values, context, options) =>
      zodResolver(volunteerSchema(optionalPhoneRef.current))(values, context, options),
    values: volunteer
      ? {
          name: volunteer.name,
          role: volunteer.role,
          email: volunteer.email ?? '',
          phone: maskPhone(volunteer.phone ?? ''),
        }
      : undefined,
  });

  if (loading) return <Skeleton $h="320px" />;
  if (error || !volunteer) return <Empty title="Usuário não encontrado" description={error ?? ''} />;

  const submit = handleSubmit(async (values) => {
    try {
      await saveVolunteer({ name: values.name, email: values.email, phone: values.phone }, values.role);
      showToast('Dados salvos.');
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Não foi possível salvar.');
    }
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
        <ModalTitle onClose={close}>Remover {volunteer.name}?</ModalTitle>
        <Typography type="p">
          Isso apaga o login dessa pessoa por completo — ela não conseguirá mais entrar no sistema.
        </Typography>
        <ModalActions>
          <Button
            type="button"
            variant="danger"
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
            <Trash2 size={16} />
            Remover
          </Button>
        </ModalActions>
      </>,
    );

  return (
    <FormContent>
      <PageHeader title={volunteer.name} subtitle="Editar usuário" back />

      {!canEdit && <InfoBox variant="info">Só o Administrador Geral pode editar contas de Administrador ou Administrador Geral.</InfoBox>}

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
        <TextInput
          label={text.fields.phone}
          control={control}
          name="phone"
          mask="phone"
          inputMode="tel"
          placeholder="(31) 99999-9999"
          disabled={!canEdit}
        />
        <Select label="Cargo" control={control} name="role">
          <RoleOptions roles={visibleRoleOptions} />
        </Select>
        <SwitchRow
          title="Conta ativa"
          hint="Desativada, a pessoa perde o acesso ao sistema."
          checked={volunteer.active}
          onChange={toggleActive}
          disabled={!canManage}
        />

        {canEdit && (
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

            {canManage && (
              <Button type="button" variant="danger" fullWidth onClick={confirmRemove}>
                <Trash2 size={16} />
                Remover usuário
              </Button>
            )}
          </>
        )}
      </Form>

      {toast}
      {modal}
    </FormContent>
  );
}
