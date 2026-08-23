// React
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
// Libs
import { Archive } from 'lucide-react';
import { Button, Empty, PageHeader, Skeleton, text, TextInput, useAuthCtx } from 'bp-kit';
// Local
import { PHONE_PLACEHOLDER } from '../../../domain/text';
import { AppRoute } from '../../../routes/paths';
import { UserRole } from '../../../types/enums';
import { useVisitorDetail } from '../Detail/hooks';
import { Actions, Form } from '../Detail/styles';
import { CreateVisitorFormValues, createVisitorSchema } from '../validators';

export function VisitorEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthCtx();
  const { person, loading, error, updatePerson, archive, reactivate } = useVisitorDetail(id ?? '');

  const canManage = user?.role === UserRole.IntegrationTeam || user?.role === UserRole.Admin;

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
  // integration classes. admin is unrestricted.
  const inIntegrationTeamStep =
    person.status === 'initial_contact' || person.status === 'retry_contact' || person.status === 'welcome_coffee';
  const inTeacherStep = person.status === 'integration';
  const canEditFields =
    user?.role === UserRole.Admin ||
    (user?.role === UserRole.IntegrationTeam && inIntegrationTeamStep) ||
    (user?.role === UserRole.Teacher && inTeacherStep);

  const submit = handleSubmit(async (values) => {
    await updatePerson(values);
    navigate(`${AppRoute.Visitors}/${id}`);
  });

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
                <Button variant="secondary" onClick={() => archive().then(() => navigate(AppRoute.Visitors))}>
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
          label={text.fields.email}
          control={control}
          name="email"
          type="email"
          placeholder={text.fields.emailPlaceholder}
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
        <TextInput label="Idade" control={control} name="age" type="text" inputMode="numeric" placeholder="Idade" disabled={!canEditFields} />

        {canEditFields && (
          <Actions>
            <Button type="submit" variant="primary" disabled={isSubmitting || person.status === 'archived'}>
              {isSubmitting ? 'Salvando...' : 'Salvar alterações'}
            </Button>
          </Actions>
        )}
      </Form>
    </div>
  );
}
