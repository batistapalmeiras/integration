// React
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
// Libs
import { Archive, RotateCcw, Save, Trash2 } from 'lucide-react';
import { Button, Empty, maskPhone, ModalActions, ModalTitle, PageHeader, Skeleton, Typography, useAuthCtx, useModal, useToast } from 'bp-kit';
// Local
import { AppRoute } from '../../../routes/paths';
import { hasRole, INTEGRATION_TEAM_ROLES, UserRole } from '../../../types/enums';
import { useVisitorDetail } from '../../../features/visitors';
import { VisitorForm, VisitorFormActions } from '../components/VisitorForm';
import { CreateVisitorFormValues, createVisitorSchema } from '../validators';

export function VisitorEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthCtx();
  const { person, loading, error, updatePerson, archive, reactivate, deletePerson } = useVisitorDetail(id ?? '');
  const { open, close, modal } = useModal('drawer');
  const { show: showToast, toast } = useToast();

  const canManage = hasRole(user?.role, INTEGRATION_TEAM_ROLES);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<CreateVisitorFormValues>({
    resolver: zodResolver(createVisitorSchema),
    values: person
      ? {
          name: person.name,
          phone: person.phone ? maskPhone(person.phone) : '',
          age: person.age ? String(person.age) : '',
          email: person.email ?? '',
        }
      : undefined,
  });

  if (loading) return <Skeleton $h="320px" />;
  if (error || !person) return <Empty title="Visitante não encontrado" description={error ?? ''} />;

  const isClosedOut = person.status === 'archived' || person.status === 'member';

  const inIntegrationTeamStep =
    person.status === 'initial_contact' ||
    person.status === 'retry_contact' ||
    person.status === 'welcome_coffee' ||
    person.status === 'pending_signup';
  const inTeacherStep = person.status === 'integration';
  const canEditFields =
    (user?.role === UserRole.Admin && person.status !== 'member') ||
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
        <ModalTitle onClose={close}>Excluir {person.name}?</ModalTitle>
        <Typography type="p">
          Só é possível excluir enquanto a pessoa ainda está no contato inicial. Essa ação não pode ser desfeita.
        </Typography>
        <ModalActions>
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
            <Trash2 size={16} />
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
                <RotateCcw size={16} />
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

      <VisitorForm control={control} onSubmit={submit} disabled={!canEditFields}>
        <VisitorFormActions>
          {canEditFields && (
            <Button type="submit" variant="primary" disabled={isSubmitting || person.status === 'archived'}>
              {isSubmitting ? (
                'Salvando...'
              ) : (
                <>
                  <Save size={16} />
                  Salvar alterações
                </>
              )}
            </Button>
          )}
          {canDelete && (
            <Button type="button" variant="danger" onClick={confirmDelete}>
              <Trash2 size={16} />
              Excluir cadastro
            </Button>
          )}
        </VisitorFormActions>
      </VisitorForm>
      {modal}
      {toast}
    </div>
  );
}
