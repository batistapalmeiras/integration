// React
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
// Libs
import { Button, Form, ModalActions, ModalTitle, Skeleton } from 'bp-kit';
import { Check } from 'lucide-react';
// Local
import { MembershipAlerts } from '../../../../components/MembershipAlerts';
import { CommunityGroup } from '../../../../domain/communityGroups';
import { CommunityRequirements, communityRequirements } from '../../../../domain/membership';
import { Person } from '../../../../features/visitors';
import { CommunityFields } from '../../components/CommunityFields';
import { CommunityFormValues, buildCommunitySchema } from '../../validators';
import { usePersonSensitive } from '../../../../queries/person';
import { useMinistries, useSmallGroups } from '../../../../queries/reference';

interface Props {
  person: Pick<Person, 'id' | 'name'>;
  close: () => void;
  onConfirm: (smallGroupId: string | null, ministryIds: string[]) => Promise<void>;
}

export function ConfirmMemberModal({ person, close, onConfirm }: Props) {
  const smallGroups = useSmallGroups().data ?? [];
  const ministries = useMinistries().data ?? [];
  const sensitive = usePersonSensitive(person.id);
  const requirements = sensitive.data !== undefined ? communityRequirements(sensitive.data) : null;

  return (
    <>
      <ModalTitle onClose={close}>Confirmar {person.name} como membro</ModalTitle>
      {requirements ? (
        <ConfirmMemberForm
          personId={person.id}
          requirements={requirements}
          smallGroups={smallGroups}
          ministries={ministries}
          close={close}
          onConfirm={onConfirm}
        />
      ) : (
        <Skeleton $h="160px" />
      )}
    </>
  );
}

interface FormProps extends Pick<Props, 'close' | 'onConfirm'> {
  personId: string;
  requirements: CommunityRequirements;
  smallGroups: CommunityGroup[];
  ministries: CommunityGroup[];
}

function ConfirmMemberForm({ personId, requirements, smallGroups, ministries, close, onConfirm }: FormProps) {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<CommunityFormValues>({
    resolver: zodResolver(buildCommunitySchema(requirements)),
    defaultValues: { smallGroupIds: [], ministryIds: [] },
  });

  const submit = handleSubmit(async (values) => {
    await onConfirm(values.smallGroupIds[0] ?? null, values.ministryIds);
    close();
  });

  return (
    <Form onSubmit={submit}>
      <CommunityFields
        control={control}
        requirements={requirements}
        smallGroups={smallGroups}
        ministries={ministries}
      />

      <MembershipAlerts personId={personId} />

      <ModalActions>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? (
            'Salvando...'
          ) : (
            <>
              <Check size={16} />
              Confirmar
            </>
          )}
        </Button>
      </ModalActions>
    </Form>
  );
}
