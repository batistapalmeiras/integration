// React
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
// Libs
import { Button, maskPhone, useAuthCtx } from 'bp-kit';
import { Save } from 'lucide-react';
// Local
import { Person } from '../../../../features/visitors';
import { UserRole } from '../../../../types/enums';
import { VisitorForm, VisitorFormActions } from '../../components/VisitorForm';
import { CreateVisitorFormValues, createVisitorSchema } from '../../validators';

interface Props {
  person: Person;
  onSave: (values: CreateVisitorFormValues) => Promise<unknown>;
  onBack: () => void;
}

const INTEGRATION_TEAM_STATUSES: Person['status'][] = [
  'initial_contact',
  'retry_contact',
  'welcome_coffee',
  'pending_signup',
];

export function EditVisitorForm({ person, onSave, onBack }: Props) {
  const { user } = useAuthCtx();

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<CreateVisitorFormValues>({
    resolver: zodResolver(createVisitorSchema),
    defaultValues: {
      name: person.name,
      phone: person.phone ? maskPhone(person.phone) : '',
      age: person.age ? String(person.age) : '',
      email: person.email ?? '',
    },
  });

  const canEditFields =
    (user?.role === UserRole.Admin && person.status !== 'member') ||
    user?.role === UserRole.Pastor ||
    (user?.role === UserRole.IntegrationTeam && INTEGRATION_TEAM_STATUSES.includes(person.status)) ||
    (user?.role === UserRole.Teacher && person.status === 'integration');

  return (
    <VisitorForm control={control} onSubmit={handleSubmit(onSave)} disabled={!canEditFields}>
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
        <Button type="button" variant="secondary" onClick={onBack} disabled={isSubmitting}>
          Voltar
        </Button>
      </VisitorFormActions>
    </VisitorForm>
  );
}
