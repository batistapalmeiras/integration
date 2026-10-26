// React
import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
// Libs
import { Button, Empty, LinkButton, PageHeader, Select, Skeleton, Tab, text, useAuthCtx, useModal } from 'bp-kit';
import { Check, Save, UserRound } from 'lucide-react';
import { z } from 'zod';
// Local
import { formatDate } from '../../../domain/dates';
import { CommunityGroup, listMinistries, listSmallGroups } from '../../../domain/communityGroups';
import { LessonMakeup, getPersonLessonMakeups } from '../../../domain/lessonMakeups';
import { PersonSensitive, getPersonSensitive } from '../../../domain/personSensitive';
import { AppRoute } from '../../../routes/paths';
import { UserRole } from '../../../types/enums';
import { useVisitorDetail } from '../../../features/visitors';
import { ConfirmMemberModal } from '../Detail/components/ConfirmMemberModal';
import {
  Actions,
  Content,
  DetailLabel,
  DetailRow,
  DetailsList,
  DetailValue,
  Form,
  InfoTabBar,
  SectionDivider,
  SectionStack,
  SensitiveBlock,
  SensitiveValue,
} from '../Detail/styles';
import { InfoEntry, integrationEntries, makeupEntries, membershipEntries } from './sensitive';

type InfoTab = 'general' | 'integration' | 'membership' | 'makeup';

const communitySchema = z.object({
  smallGroupId: z.string().min(1, text.validation.selectRequired('o Pequeno Grupo')),
  ministryId: z.string().min(1, text.validation.selectRequired('o ministério')),
});
type CommunityFormValues = z.infer<typeof communitySchema>;

export function VisitorInfoPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
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
    confirmMember,
  } = useVisitorDetail(id ?? '');
  const { open, close, modal } = useModal('drawer');

  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState<InfoTab>(() => (searchParams.get('tab') as InfoTab | null) ?? 'general');
  const fromMembershipQueue = searchParams.get('from') === 'membership';
  const [smallGroups, setSmallGroups] = useState<CommunityGroup[]>([]);
  const [ministries, setMinistries] = useState<CommunityGroup[]>([]);

  const canConfirmMembership = user?.role === UserRole.Admin || user?.role === UserRole.Pastor;
  const canSeeSensitive = canConfirmMembership || user?.role === UserRole.Teacher;
  const [sensitive, setSensitive] = useState<PersonSensitive | null>(null);
  const [makeups, setMakeups] = useState<LessonMakeup[]>([]);

  useEffect(() => {
    if (canSeeSensitive && id) {
      getPersonSensitive(id).then(setSensitive);
      getPersonLessonMakeups(id).then(setMakeups);
    }
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
    { key: 'general', label: 'Geral' },
    ...(canSeeSensitive && reachedIntegration ? [{ key: 'integration' as InfoTab, label: 'Integração' }] : []),
    ...(canSeeSensitive && reachedMembership ? [{ key: 'membership' as InfoTab, label: 'Membresia' }] : []),
    ...(canSeeSensitive && makeups.length > 0 ? [{ key: 'makeup' as InfoTab, label: 'Reposição' }] : []),
  ];

  const current = tabs.some((t) => t.key === tab) ? tab : 'general';

  const entriesFor = (key: InfoTab): InfoEntry[] =>
    key === 'integration' ? integrationEntries(sensitive) : key === 'membership' ? membershipEntries(person, sensitive) : [];

  const rows = [
    profileCohortName && { label: 'Turma', value: profileCohortName },
    profileCoffeeDate && { label: 'Café', value: formatDate(profileCoffeeDate) },
    !canEditCommunity && profileSmallGroupName && { label: 'Pequeno Grupo', value: profileSmallGroupName },
    !canEditCommunity && profileMinistryName && { label: 'Ministério', value: profileMinistryName },
  ].filter((row): row is { label: string; value: string } => !!row);

  const submit = handleSubmit((values) => updateCommunity(values.smallGroupId, values.ministryId));

  const showConfirmMember =
    fromMembershipQueue && user?.role === UserRole.Pastor && person.status === 'membership_pending';
  const openConfirmMember = () =>
    open(
      <ConfirmMemberModal
        person={person}
        close={close}
        onConfirm={async (smallGroupId, ministryId) => {
          await confirmMember(smallGroupId, ministryId);
          navigate(AppRoute.Membership);
        }}
      />,
    );

  return (
    <Content>
      <PageHeader
        title="Detalhes"
        subtitle={person.name}
        back
        actionAlign="end"
        action={
          fromMembershipQueue && (
            <LinkButton icon={<UserRound size={16} />} onClick={() => navigate(`${AppRoute.Visitors}/${person.id}`)}>
              Ver perfil
            </LinkButton>
          )
        }
      />

      {tabs.length > 1 && (
        <InfoTabBar>
          {tabs.map((item) => (
            <Tab key={item.key} $active={current === item.key} onClick={() => setTab(item.key)}>
              {item.label}
            </Tab>
          ))}
        </InfoTabBar>
      )}

      {current === 'general' && rows.length > 0 && (
        <DetailsList>
          {rows.map((row) => (
            <DetailRow key={row.label}>
              <DetailLabel>{row.label}</DetailLabel>
              <DetailValue>{row.value}</DetailValue>
            </DetailRow>
          ))}
        </DetailsList>
      )}

      {(current === 'integration' || current === 'membership') && <EntryList entries={entriesFor(current)} />}

      {current === 'membership' && showConfirmMember && (
        <Actions>
          <Button variant="primary" onClick={openConfirmMember}>
            <Check size={16} />
            Confirmar como membro
          </Button>
        </Actions>
      )}

      {current === 'makeup' && (
        <SectionStack>
          {makeups.map((makeup, index) =>
            index === 0 ? (
              <EntryList key={makeup.lessonNumber} entries={makeupEntries(makeup)} />
            ) : (
              <SectionDivider key={makeup.lessonNumber}>
                <EntryList entries={makeupEntries(makeup)} />
              </SectionDivider>
            ),
          )}
        </SectionStack>
      )}

      {current === 'general' && canEditCommunity && (
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

      {modal}
    </Content>
  );
}

function EntryList({ entries }: { entries: InfoEntry[] }) {
  return (
    <DetailsList>
      {entries.map((item) => (
        <SensitiveBlock key={item.label}>
          <DetailLabel>{item.label}</DetailLabel>
          <SensitiveValue $muted={!item.answered}>{item.value}</SensitiveValue>
        </SensitiveBlock>
      ))}
    </DetailsList>
  );
}
