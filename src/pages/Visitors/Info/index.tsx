// React
import { useEffect, useRef, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
// Libs
import { Button, Empty, LinkButton, PageHeader, Skeleton, Tab, useAuthCtx, useModal } from 'bp-kit';
import { Check, Save, UserRound } from 'lucide-react';
// Local
import { formatDate } from '../../../domain/dates';
import { CommunityGroup, getPersonMinistryIds, listMinistries, listSmallGroups } from '../../../domain/communityGroups';
import { LessonMakeup, getPersonLessonMakeups } from '../../../domain/lessonMakeups';
import { communityRequirements } from '../../../domain/membershipCommunity';
import { PersonSensitive, getPersonSensitive } from '../../../domain/personSensitive';
import { AppRoute } from '../../../routes/paths';
import { UserRole } from '../../../types/enums';
import { useVisitorDetail } from '../../../features/visitors';
import { CommunityFields } from '../components/CommunityFields';
import { ConfirmMemberModal } from '../Detail/components/ConfirmMemberModal';
import { CommunityFormValues, buildCommunitySchema } from '../validators';
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
    profileMinistryNames,
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
  const [ministryIds, setMinistryIds] = useState<string[]>([]);

  const canConfirmMembership = user?.role === UserRole.Admin || user?.role === UserRole.Pastor;
  const canSeeSensitive = canConfirmMembership || user?.role === UserRole.Teacher;
  const [sensitive, setSensitive] = useState<PersonSensitive | null>(null);
  const [makeups, setMakeups] = useState<LessonMakeup[]>([]);
  const requirements = communityRequirements(sensitive);
  const requirementsRef = useRef(requirements);
  requirementsRef.current = requirements;

  useEffect(() => {
    if (canSeeSensitive && id) {
      getPersonSensitive(id).then(setSensitive);
      getPersonLessonMakeups(id).then(setMakeups);
    }
  }, [canSeeSensitive, id]);
  const canEditCommunity = user?.role === UserRole.Pastor && person?.status === 'member';

  useEffect(() => {
    if (canEditCommunity) {
      listSmallGroups().then(setSmallGroups);
      listMinistries().then(setMinistries);
      if (id) getPersonMinistryIds(id).then(setMinistryIds);
    }
  }, [canEditCommunity]);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting, isDirty },
  } = useForm<CommunityFormValues>({
    resolver: (values, context, options) =>
      zodResolver(buildCommunitySchema(requirementsRef.current))(values, context, options),
    values: { smallGroupIds: person?.small_group_id ? [person.small_group_id] : [], ministryIds },
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
    !canEditCommunity && profileMinistryNames.length > 0 && { label: 'Ministérios', value: profileMinistryNames.join(', ') },
  ].filter((row): row is { label: string; value: string } => !!row);

  const submit = handleSubmit((values) => updateCommunity(values.smallGroupIds[0] ?? null, values.ministryIds));

  const showConfirmMember =
    fromMembershipQueue && user?.role === UserRole.Pastor && person.status === 'membership_pending';
  const openConfirmMember = () =>
    open(
      <ConfirmMemberModal
        person={person}
        close={close}
        onConfirm={async (smallGroupId, ministryIds) => {
          await confirmMember(smallGroupId, ministryIds);
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
          <CommunityFields
            control={control}
            requirements={requirements}
            smallGroups={smallGroups}
            ministries={ministries}
          />

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
