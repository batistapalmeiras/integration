// React
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
// Libs
import { Button, Empty, LinkButton, Skeleton, Tab, useAuthCtx, useModal } from 'bp-kit';
import { Check, Save, UserRound } from 'lucide-react';
// Components
import { PageHeader } from '../../../components/PageHeader';
// Local
import { formatDate } from '../../../domain/dates';
import { communityRequirements } from '../../../domain/membership';
import { AppRoute } from '../../../routes/paths';
import { hasRole, LEADERSHIP_ROLES, TEACHING_ROLES, UserRole } from '../../../types/enums';
import { useVisitorProfile } from '../../../features/visitors';
import { CommunityFields } from '../components/CommunityFields';
import { ConfirmMemberModal } from '../Detail/components/ConfirmMemberModal';
import { buildCommunitySchema, CommunityFormValues } from '../validators';
import { usePersonMakeups, usePersonSensitive } from '../../../queries/person';
import { useMinistries, useSmallGroups } from '../../../queries/reference';
import {
  DetailLabel,
  DetailRow,
  DetailsList,
  DetailValue,
  Form,
  InfoTabBar,
  SectionStack,
  SensitiveBlock,
  SensitiveValue,
} from '../Detail/styles';
import { FormActions, FormContent, SectionDivider } from '../../../components/FormLayout';
import { useLatest } from '../../../lib/useLatest';
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
    profileMinistryIds,
    updateCommunity,
    confirmMember,
  } = useVisitorProfile(id ?? '');
  const { open, close, modal } = useModal('drawer');

  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState<InfoTab>(() => (searchParams.get('tab') as InfoTab | null) ?? 'general');
  const fromMembershipQueue = searchParams.get('from') === 'membership';

  const canSeeSensitive = hasRole(user?.role, LEADERSHIP_ROLES);
  const canSeeMakeups = hasRole(user?.role, TEACHING_ROLES);
  const sensitive = usePersonSensitive(id ?? '', canSeeSensitive).data ?? null;
  const makeups = usePersonMakeups(id ?? '', canSeeMakeups).data ?? [];
  const requirements = communityRequirements(sensitive);
  const requirementsRef = useLatest(requirements);

  const canEditCommunity = user?.role === UserRole.Pastor && person?.status === 'member';
  const smallGroups = useSmallGroups(canEditCommunity).data ?? [];
  const ministries = useMinistries(canEditCommunity).data ?? [];

  const {
    control,
    handleSubmit,
    formState: { isSubmitting, isDirty },
  } = useForm<CommunityFormValues>({
    resolver: (values, context, options) =>
      zodResolver(buildCommunitySchema(requirementsRef.current))(values, context, options),
    values: { smallGroupIds: person?.small_group_id ? [person.small_group_id] : [], ministryIds: profileMinistryIds },
  });

  if (loading) return <Skeleton $h="240px" />;
  if (error || !person) return <Empty title="Visitante não encontrado" description={error ?? ''} />;

  const reachedIntegration = ['integration', 'membership_pending', 'member'].includes(person.status);
  const reachedMembership = ['membership_pending', 'member'].includes(person.status);

  const tabs: { key: InfoTab; label: string }[] = [
    { key: 'general', label: 'Geral' },
    ...(canSeeSensitive && reachedIntegration ? [{ key: 'integration' as InfoTab, label: 'Integração' }] : []),
    ...(canSeeSensitive && reachedMembership ? [{ key: 'membership' as InfoTab, label: 'Membresia' }] : []),
    ...(canSeeMakeups && makeups.length > 0 ? [{ key: 'makeup' as InfoTab, label: 'Reposição' }] : []),
  ];

  const current = tabs.some((t) => t.key === tab) ? tab : 'general';

  const entriesFor = (key: InfoTab): InfoEntry[] =>
    key === 'integration'
      ? integrationEntries(sensitive)
      : key === 'membership'
        ? membershipEntries(person, sensitive)
        : [];

  const rows = [
    profileCohortName && { label: 'Turma', value: profileCohortName },
    profileCoffeeDate && { label: 'Café', value: formatDate(profileCoffeeDate) },
    !canEditCommunity && profileSmallGroupName && { label: 'Pequeno Grupo', value: profileSmallGroupName },
    !canEditCommunity &&
      profileMinistryNames.length > 0 && { label: 'Ministérios', value: profileMinistryNames.join(', ') },
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
    <FormContent>
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
        <FormActions>
          <Button variant="primary" onClick={openConfirmMember}>
            <Check size={16} />
            Confirmar como membro
          </Button>
        </FormActions>
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

          <FormActions>
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
          </FormActions>
        </Form>
      )}

      {modal}
    </FormContent>
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
