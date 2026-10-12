// React
import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
// Libs
import { Button, Empty, PageHeader, Select, Skeleton, Tab, text, useAuthCtx } from 'bp-kit';
import { Save } from 'lucide-react';
import { z } from 'zod';
// Local
import { formatDate } from '../../../domain/dates';
import { CommunityGroup, listMinistries, listSmallGroups } from '../../../domain/communityGroups';
import { PersonSensitive, getPersonSensitive } from '../../../domain/personSensitive';
import { UserRole } from '../../../types/enums';
import { useVisitorDetail } from '../../../features/visitors';
import {
  Actions,
  Content,
  DetailLabel,
  DetailRow,
  DetailsList,
  DetailValue,
  Form,
  InfoTabBar,
  SensitiveBlock,
  SensitiveValue,
} from '../Detail/styles';
import { InfoEntry, integrationEntries, membershipEntries } from './sensitive';

type InfoTab = 'geral' | 'integracao' | 'membresia';

const communitySchema = z.object({
  smallGroupId: z.string().min(1, text.validation.selectRequired('o Pequeno Grupo')),
  ministryId: z.string().min(1, text.validation.selectRequired('o ministério')),
});
type CommunityFormValues = z.infer<typeof communitySchema>;

export function VisitorInfoPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthCtx();
  const {
    person,
    loading,
    error,
    profileCoffeeDate,
    profileCohortName,
    profileMinistryName,
    profileSmallGroupName,
    updateCommunity,
  } = useVisitorDetail(id ?? '');

  const [tab, setTab] = useState<InfoTab>('geral');
  const [smallGroups, setSmallGroups] = useState<CommunityGroup[]>([]);
  const [ministries, setMinistries] = useState<CommunityGroup[]>([]);

  const canConfirmMembership = user?.role === UserRole.Admin || user?.role === UserRole.Pastor;
  const canSeeSensitive = canConfirmMembership || user?.role === UserRole.Teacher;
  const [sensitive, setSensitive] = useState<PersonSensitive | null>(null);

  useEffect(() => {
    if (canSeeSensitive && id) getPersonSensitive(id).then(setSensitive);
  }, [canSeeSensitive, id]);
  const canEditCommunity = canConfirmMembership && person?.status === 'member';

  useEffect(() => {
    if (canEditCommunity) {
      listSmallGroups().then(setSmallGroups);
      listMinistries().then(setMinistries);
    }
  }, [canEditCommunity]);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting, isDirty },
  } = useForm<CommunityFormValues>({
    resolver: zodResolver(communitySchema),
    values: { smallGroupId: person?.small_group_id ?? '', ministryId: person?.ministry_id ?? '' },
  });

  if (loading) return <Skeleton $h="240px" />;
  if (error || !person) return <Empty title="Visitante não encontrado" description={error ?? ''} />;

  const reachedIntegration = ['integration', 'membership_pending', 'member'].includes(person.status);
  const reachedMembership = ['membership_pending', 'member'].includes(person.status);

  const tabs: { key: InfoTab; label: string }[] = [
    { key: 'geral', label: 'Geral' },
    ...(canSeeSensitive && reachedIntegration ? [{ key: 'integracao' as InfoTab, label: 'Integração' }] : []),
    ...(canSeeSensitive && reachedMembership ? [{ key: 'membresia' as InfoTab, label: 'Membresia' }] : []),
  ];

  const current = tabs.some((t) => t.key === tab) ? tab : 'geral';

  const entriesFor = (key: InfoTab): InfoEntry[] =>
    key === 'integracao' ? integrationEntries(sensitive) : key === 'membresia' ? membershipEntries(person, sensitive) : [];

  const rows = [
    profileCohortName && { label: 'Turma', value: profileCohortName },
    profileCoffeeDate && { label: 'Café', value: formatDate(profileCoffeeDate) },
    !canEditCommunity && profileSmallGroupName && { label: 'Pequeno Grupo', value: profileSmallGroupName },
    !canEditCommunity && profileMinistryName && { label: 'Ministério', value: profileMinistryName },
  ].filter((row): row is { label: string; value: string } => !!row);

  const submit = handleSubmit((values) => updateCommunity(values.smallGroupId, values.ministryId));

  return (
    <Content>
      <PageHeader title="Detalhes" subtitle={person.name} back />

      {tabs.length > 1 && (
        <InfoTabBar>
          {tabs.map((item) => (
            <Tab key={item.key} $active={current === item.key} onClick={() => setTab(item.key)}>
              {item.label}
            </Tab>
          ))}
        </InfoTabBar>
      )}

      {current === 'geral' && rows.length > 0 && (
        <DetailsList>
          {rows.map((row) => (
            <DetailRow key={row.label}>
              <DetailLabel>{row.label}</DetailLabel>
              <DetailValue>{row.value}</DetailValue>
            </DetailRow>
          ))}
        </DetailsList>
      )}

      {current !== 'geral' && (
        <DetailsList>
          {entriesFor(current).map((item) => (
            <SensitiveBlock key={item.label}>
              <DetailLabel>{item.label}</DetailLabel>
              <SensitiveValue>{item.value}</SensitiveValue>
            </SensitiveBlock>
          ))}
        </DetailsList>
      )}

      {current === 'geral' && canEditCommunity && (
        <Form onSubmit={submit}>
          <Select label="Pequeno Grupo" control={control} name="smallGroupId">
            <option value="">Selecione…</option>
            {smallGroups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </Select>
          <Select label="Ministério" control={control} name="ministryId">
            <option value="">Selecione…</option>
            {ministries.map((ministry) => (
              <option key={ministry.id} value={ministry.id}>
                {ministry.name}
              </option>
            ))}
          </Select>

          <Actions>
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
          </Actions>
        </Form>
      )}
    </Content>
  );
}
