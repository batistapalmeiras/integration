// React
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
// Libs
import { Archive } from 'lucide-react';
import { Button, Empty, ModalActions, ModalTitle, PageHeader, Skeleton, text, TextInput, Typography, useAuthCtx, useModal, useToast } from 'bp-kit';
// Local
import { PHONE_PLACEHOLDER } from '../../../domain/text';
import { AppRoute } from '../../../routes/paths';
import { UserRole } from '../../../types/enums';
import { useVisitorDetail } from '../Detail/hooks';
import { Actions, DangerLink, Form } from '../Detail/styles';
import { CreateVisitorFormValues, createVisitorSchema } from '../validators';

export function VisitorEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthCtx();
  const { person, loading, error, updatePerson, archive, reactivate, deletePerson } = useVisitorDetail(id ?? '');
  const { open, close, modal } = useModal('drawer');
  const { show: showToast, toast } = useToast();

  const canManage =
    user?.role === UserRole.IntegrationTeam || user?.role === UserRole.Admin || user?.role === UserRole.Pastor;

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<CreateVisitorFormValues>({
    resolver: zodResolver(createVisitorSchema),
    values: person
      ? {
          name: person.name,
          phone: person.phone,
          age: person.age ? String(person.age) : '',
          email: person.email ?? '',
        }
      : undefined,
  });

  if (loading) return <Skeleton $h="320px" />;
  if (error || !person) return <Empty title="Visitante não encontrado" description={error ?? ''} />;

  const isClosedOut = person.status === 'archived' || person.status === 'member';

  // Each role can only touch this person's data while they're at that
  // role's own step — integration_team owns contact/café, teacher owns the
  // integration classes. admin/pastor are unrestricted.
  const inIntegrationTeamStep =
    person.status === 'initial_contact' || person.status === 'retry_contact' || person.status === 'welcome_coffee';
  const inTeacherStep = person.status === 'integration';
  const canEditFields =
    user?.role === UserRole.Admin ||
    user?.role === UserRole.Pastor ||
    (user?.role === UserRole.IntegrationTeam && inIntegrationTeamStep) ||
    (user?.role === UserRole.Teacher && inTeacherStep);

  const submit = handleSubmit(async (values) => {
    await updatePerson(values);
    navigate(`${AppRoute.Visitors}/${id}`);
  });

  const canDelete = canManage && person.status === 'initial_contact';

  const confirmDelete = () =>
    open(
      <>
        <ModalTitle>Excluir {person.name}?</ModalTitle>
        <Typography type="p">
          Só é possível excluir enquanto a pessoa ainda está no contato inicial. Essa ação não pode ser desfeita.
        </Typography>
        <ModalActions>
          <Button type="button" variant="secondary" onClick={close}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={async () => {
              try {
                await deletePerson();
                close();
                navigate(AppRoute.Visitors);
              } catch (e) {
                showToast(e instanceof Error ? e.message : 'Não foi possível excluir.');
              }
            }}
          >
            Excluir
          </Button>
        </ModalActions>
      </>,
    );

  return (
    <div>
      <PageHeader
        title="Editar visitante"
        subtitle={person.name}
        back
        action={
          canManage ? (
            person.status === 'archived' ? (
              <Button variant="secondary" onClick={() => reactivate()}>
                Reativar
              </Button>
            ) : (
              !isClosedOut && (
                <Button variant="danger" onClick={() => archive().then(() => navigate(AppRoute.Visitors))}>
                  <Archive size={16} />
                  Arquivar
                </Button>
              )
            )
          ) : undefined
        }
      />

      <Form onSubmit={submit}>
        <TextInput
          label={text.fields.name}
          control={control}
          name="name"
          placeholder={text.fields.fullName}
          disabled={!canEditFields}
        />
        <TextInput
          label={text.fields.phone}
          control={control}
          name="phone"
          mask="phone"
          placeholder={PHONE_PLACEHOLDER}
          disabled={!canEditFields}
        />
        <TextInput
          label={text.fields.email}
          control={control}
          name="email"
          type="email"
          placeholder={text.fields.emailPlaceholder}
          disabled={!canEditFields}
        />
        <TextInput label="Idade" control={control} name="age" type="text" inputMode="numeric" placeholder="Idade" disabled={!canEditFields} />

        {canEditFields && (
          <Actions>
            <Button type="submit" variant="primary" disabled={isSubmitting || person.status === 'archived'}>
              {isSubmitting ? 'Salvando...' : 'Salvar alterações'}
            </Button>
          </Actions>
        )}

        {canDelete && (
          <DangerLink type="button" onClick={confirmDelete}>
            Excluir cadastro
          </DangerLink>
        )}
      </Form>
      {modal}
      {toast}
    </div>
  );
}
