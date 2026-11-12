// React
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
// Libs
import { Button, Empty, LinkButton, Skeleton, Tab, useAuthCtx } from 'bp-kit';
import { Check, Save, UserRound } from 'lucide-react';
// Components
import { Callout, CalloutContent } from '../../../components/Callout';
import { PageHeader } from '../../../components/PageHeader';
// Local
import { communityDeclines } from '../../../domain/membership';
import { AppRoute, confirmMemberPath } from '../../../routes/paths';
import { hasRole, LEADERSHIP_ROLES, TEACHING_ROLES, UserRole } from '../../../types/enums';
import { generalDetailRows, useVisitorProfile } from '../../../features/visitors';
import { CommunityFields } from '../components/CommunityFields';
import { communitySchema, CommunityFormValues } from '../validators';
import { useMemberProfile, usePersonMakeups, usePersonSensitive } from '../../../queries/person';
import { useMinistries, useSmallGroups } from '../../../queries/reference';
import {
  DetailLabel,
  DetailRow,
  DetailsList,
  DetailValue,
  Form,
  InfoTabBar,
  SectionStack,
} from '../Detail/styles';
import {
  DetailContent,
  EndActions,
  FieldGrid,
  Section,
  SectionDivider,
  Sections,
} from '../../../components/FormLayout';
import { PanelTitle } from '../../../components/Panel';
import { EntryList } from './EntryList';
import { integrationEntries, makeupEntries, membershipSections } from './sensitive';

type InfoTab = 'general' | 'integration' | 'membership' | 'makeup';

export function VisitorInfoPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthCtx();
  const {
    person,
    loading,
    error,
    profile,
    updateCommunity,
  } = useVisitorProfile(id ?? '');

  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState<InfoTab>(() => (searchParams.get('tab') as InfoTab | null) ?? 'general');
  const fromMembershipQueue = searchParams.get('from') === 'membership';

  const canSeeSensitive = hasRole(user?.role, LEADERSHIP_ROLES);
  const canSeeMakeups = hasRole(user?.role, TEACHING_ROLES);
  const sensitive = usePersonSensitive(id ?? '', canSeeSensitive).data ?? null;
  const makeups = usePersonMakeups(id ?? '', canSeeMakeups).data ?? [];
  const declines = communityDeclines(sensitive);
  const reachedMembership = !!person && ['membership_pending', 'member'].includes(person.status);
  const memberProfile = useMemberProfile(id ?? '', canSeeSensitive && reachedMembership).data ?? null;

  const canEditCommunity = user?.role === UserRole.Pastor && person?.status === 'member';
  const smallGroups = useSmallGroups(canEditCommunity).data ?? [];
  const ministries = useMinistries(canEditCommunity).data ?? [];

  const {
    control,
    handleSubmit,
    formState: { isSubmitting, isDirty },
  } = useForm<CommunityFormValues>({
    resolver: zodResolver(communitySchema),
    values: { smallGroupIds: profile.smallGroupIds, ministryIds: profile.ministryIds },
  });

  if (loading) return <Skeleton $h="240px" />;
  if (error || !person) return <Empty title="Visitante não encontrado" description={error ?? ''} />;

  const reachedIntegration = ['integration', 'membership_pending', 'member'].includes(person.status);

  const tabs: { key: InfoTab; label: string }[] = [
    { key: 'general', label: 'Geral' },
    ...(canSeeSensitive && reachedIntegration ? [{ key: 'integration' as InfoTab, label: 'Integração' }] : []),
    ...(canSeeSensitive && reachedMembership ? [{ key: 'membership' as InfoTab, label: 'Membresia' }] : []),
    ...(canSeeMakeups && makeups.length > 0 ? [{ key: 'makeup' as InfoTab, label: 'Reposição' }] : []),
  ];

  const current = tabs.some((t) => t.key === tab) ? tab : 'general';

  const rows = generalDetailRows(person, profile, !canEditCommunity);

  const submit = handleSubmit((values) => updateCommunity(values.smallGroupIds, values.ministryIds));

  const showConfirmMember =
    fromMembershipQueue && user?.role === UserRole.Pastor && person.status === 'membership_pending';
  const openConfirmMember = () => navigate(confirmMemberPath(person.id));

  return (
    <DetailContent>
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

      {showConfirmMember && (
        <Callout>
          <CalloutContent>
            <span>Aguardando sua confirmação como membro.</span>
            <Button variant="primary" onClick={openConfirmMember}>
              <Check size={16} />
              Confirmar como membro
            </Button>
          </CalloutContent>
        </Callout>
      )}

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

      {current === 'integration' && <EntryList entries={integrationEntries(sensitive)} />}

      {current === 'membership' && (
        <Sections>
          {membershipSections(person, sensitive, memberProfile, profile.smallGroupNames).map((section) => (
            <Section key={section.title} aria-label={section.title}>
              <PanelTitle>{section.title}</PanelTitle>
              <EntryList entries={section.entries} />
            </Section>
          ))}
        </Sections>
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
          <FieldGrid>
            <CommunityFields control={control} declines={declines} smallGroups={smallGroups} ministries={ministries} />
          </FieldGrid>

          <EndActions>
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
          </EndActions>
        </Form>
      )}
    </DetailContent>
  );
}
