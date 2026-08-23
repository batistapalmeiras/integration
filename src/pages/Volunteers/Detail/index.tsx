// React
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
// Libs
import {
  Button,
  Empty,
  Form,
  ModalActions,
  ModalTitle,
  PageHeader,
  Select,
  Skeleton,
  Switch,
  text,
  TextInput,
  Typography,
  useModal,
  useToast,
} from 'bp-kit';
import { z } from 'zod';
// Local
import { AppRoute } from '../../../routes/paths';
import { ROLE_LABELS, UserRole } from '../../../types/enums';
import { DangerLink } from '../../Visitors/Detail/styles';
import { useVolunteerDetail } from '../hooks/useVolunteerDetail';

const schema = z.object({
  name: z.string().min(1, text.validation.required('o nome')),
  role: z.nativeEnum(UserRole, { message: text.validation.selectRequired('o cargo') }),
});

type FormValues = z.infer<typeof schema>;

export function VolunteerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { show: showToast, toast } = useToast();
  const { open, close, modal } = useModal();
  const { volunteer, loading, error, updateVolunteer, setActive, removeVolunteer } = useVolunteerDetail(id ?? '');

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: volunteer ? { name: volunteer.name, role: volunteer.role } : undefined,
  });

  if (loading) return <Skeleton $h="320px" />;
  if (error || !volunteer) return <Empty title="Voluntário não encontrado" description={error ?? ''} />;

  const submit = handleSubmit(async (values) => {
    await updateVolunteer(values.name, values.role);
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
    <div>
      <PageHeader title={volunteer.name} subtitle="Editar voluntário" back />

      <Form onSubmit={submit}>
        <TextInput label={text.fields.name} control={control} name="name" placeholder={text.fields.fullName} />
        <Select label="Cargo" control={control} name="role">
          {Object.entries(ROLE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
        <Switch label="Conta ativa" checked={volunteer.active} onChange={toggleActive} />

        <Button type="submit" variant="primary" size="lg" fullWidth disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : 'Salvar'}
        </Button>

        <DangerLink type="button" onClick={confirmRemove}>
          Remover voluntário
        </DangerLink>
      </Form>

      {toast}
      {modal}
    </div>
  );
}
