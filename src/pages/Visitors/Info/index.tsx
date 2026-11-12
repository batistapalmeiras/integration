// React
import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
// Libs
import { Button, LinkButton, Skeleton, Tab, useAuthCtx } from 'bp-kit';
import { Check, UserRound } from 'lucide-react';
// Components
import { Callout, CalloutContent } from '../../../components/Callout';
import { NotFound } from '../../../components/NotFound';
import { PageHeader } from '../../../components/PageHeader';
// Local
import { AppRoute, confirmMemberPath } from '../../../routes/paths';
import { UserRole } from '../../../types/enums';
import { DETAIL_TAB_LABELS, DetailTab, useDetailTabs, useVisitorProfile } from '../../../features/visitors';
import { usePersonRecords } from '../../../queries/person';
import { InfoTabBar, SectionStack } from '../Detail/styles';
import { DetailContent, Section, SectionDivider, Sections } from '../../../components/FormLayout';
import { PanelTitle } from '../../../components/Panel';
import { EntryList } from './EntryList';
import { integrationEntries, makeupEntries, membershipSections } from './sensitive';

const isDetailTab = (value: string | null): value is DetailTab => !!value && value in DETAIL_TAB_LABELS;

export function VisitorInfoPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthCtx();
  const { person, loading, error, profile } = useVisitorProfile(id ?? '');
  const { tabs, canSeeAnswers, makeups } = useDetailTabs(person);

  const [searchParams] = useSearchParams();
  const requestedTab = searchParams.get('tab');
  const [tab, setTab] = useState<DetailTab | null>(isDetailTab(requestedTab) ? requestedTab : null);
  const fromMembershipQueue = searchParams.get('from') === 'membership';

  const records = usePersonRecords(id ?? '', canSeeAnswers && tabs.length > 0).data;
  const sensitive = records?.sensitive ?? null;
  const memberProfile = records?.memberProfile ?? null;

  if (loading) return <Skeleton $h="240px" />;
  if (error || !person) return <NotFound title="Cadastro não encontrado" description={error ?? ''} backTo={AppRoute.Visitors} backLabel="Voltar para visitantes" />;

  const current = tab && tabs.includes(tab) ? tab : tabs[0];

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
            <Tab key={item} $active={current === item} onClick={() => setTab(item)}>
              {DETAIL_TAB_LABELS[item]}
            </Tab>
          ))}
        </InfoTabBar>
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
    </DetailContent>
  );
}
