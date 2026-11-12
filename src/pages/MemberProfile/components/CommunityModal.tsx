// React
import { useForm } from 'react-hook-form';
// Libs
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Form, ModalActions, ModalTitle, useToast } from 'bp-kit';
import { Save } from 'lucide-react';
// Local
import { communityDeclines } from '../../../domain/membership';
import { invalidateQueries, markPipelineStale } from '../../../lib/queryCache';
import { queryKeys } from '../../../lib/queryKeys';
import { usePersonSensitive } from '../../../queries/person';
import { useMinistries, useSmallGroups } from '../../../queries/reference';
import { savePersonCommunity } from '../../../repositories/communityGroups';
import { MemberCommunity } from '../../../repositories/memberRecords';
import { CommunityFields } from '../../Visitors/components/CommunityFields';
import { CommunityFormValues, communitySchema } from '../../Visitors/validators';

interface Props {
  personId: string;
  community: Pick<MemberCommunity, 'smallGroupId' | 'ministryIds'>;
  close: () => void;
}

export function CommunityModal({ personId, community, close }: Props) {
  const { show: showToast, toast } = useToast();
  const smallGroups = useSmallGroups().data ?? [];
  const ministries = useMinistries().data ?? [];
  const sensitive = usePersonSensitive(personId).data ?? null;
  const {
    control,
    handleSubmit,
    formState: { isSubmitting, isDirty },
  } = useForm<CommunityFormValues>({
    resolver: zodResolver(communitySchema),
    defaultValues: { smallGroupId: community.smallGroupId ?? '', ministryIds: community.ministryIds },
  });

  const submit = handleSubmit(async (values) => {
    try {
      await savePersonCommunity(personId, values.smallGroupId || null, values.ministryIds);
      await markPipelineStale();
      await invalidateQueries(queryKeys.memberPage(personId));
      close();
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Não foi possível salvar.');
    }
  });

  return (
    <>
      <ModalTitle onClose={close}>PG e ministérios</ModalTitle>
      <Form onSubmit={submit}>
        <CommunityFields
          control={control}
          declines={communityDeclines(sensitive)}
          smallGroups={smallGroups}
          ministries={ministries}
        />
        <ModalActions>
          <Button type="submit" variant="primary" disabled={isSubmitting || !isDirty}>
            {isSubmitting ? (
              'Salvando...'
            ) : (
              <>
                <Save size={16} />
                Salvar
              </>
            )}
          </Button>
        </ModalActions>
      </Form>
      {toast}
    </>
  );
}
