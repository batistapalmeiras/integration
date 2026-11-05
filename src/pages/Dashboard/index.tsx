// Libs
import {
  Empty,
  PageHeader,
  Skeleton,
  StatCard,
  StatLabel,
  StatValue,
  text,
  useAuthCtx,
} from 'bp-kit';
// Components
import { List, ListItem, ListName } from '../../components/List';
import { formatTimestampDate, todayKey, weekdayLabel } from '../../domain/dates';
import { AppRoute } from '../../routes/paths';
import { PersonStatus, STATUS_META } from '../../types/person';
// Local
import { usePastorDashboard } from './hooks/usePastorDashboard';
import {
  AgendaDate,
  AgendaItem,
  AgendaTitle,
  Columns,
  Detail,
  HighlightValue,
  Highlights,
  ListLink,
  MainColumn,
  Panel,
  PanelHeader,
  PanelLink,
  PanelText,
  PanelTitle,
  SideColumn,
  AgendaCell,
  StageGrid,
} from './styles';

const FUNNEL: { status: PersonStatus; owner: string }[] = [
  { status: 'initial_contact', owner: 'Equipe de Integração' },
  { status: 'retry_contact', owner: 'Equipe de Integração' },
  { status: 'welcome_coffee', owner: 'Equipe de Integração' },
  { status: 'pending_signup', owner: 'A própria pessoa' },
  { status: 'integration', owner: 'Professor' },
  { status: 'membership_pending', owner: 'Conselho Administrativo' },
];

const SAO_PAULO = { timeZone: 'America/Sao_Paulo' } as const;

function greeting(): string {
  const hour = Number(new Date().toLocaleString('en-US', { ...SAO_PAULO, hour: 'numeric', hour12: false }));
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

function todayLabel(): string {
  const label = new Date().toLocaleDateString('pt-BR', { ...SAO_PAULO, weekday: 'long', day: 'numeric', month: 'long' });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function shortMonth(dateKey: string): string {
  return new Date(`${dateKey}T12:00:00`).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
}

function plural(count: number, singular: string, pluralForm: string): string {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

export function DashboardPage() {
  const { user } = useAuthCtx();
  const { overview, loading, error } = usePastorDashboard();

  const firstName = user?.name?.trim().split(' ')[0];
  const title = firstName ? `${greeting()}, ${firstName}` : greeting();

  if (error) {
    return (
      <div>
        <PageHeader title={title} subtitle={todayLabel()} />
        <Empty title={text.feedback.loadError} description={error} />
      </div>
    );
  }

  if (loading || !overview) {
    return (
      <div>
        <PageHeader title={title} subtitle={todayLabel()} />
        <Skeleton $h="480px" />
      </div>
    );
  }

  const { funnel, totalMembers, community, coffee, cohort, makeupNotes } = overview;
  const inIntegration = FUNNEL.reduce((sum, stage) => sum + (funnel[stage.status] ?? 0), 0);

  return (
    <div>
      <PageHeader title={title} subtitle={todayLabel()} />

      <Highlights>
        <AgendaCell>
          <Panel aria-labelledby="agenda">
            <PanelTitle id="agenda">Próximos dias</PanelTitle>
            {!coffee && !cohort && <PanelText>Nenhum café ou turma agendado.</PanelText>}
            {coffee && (
              <AgendaItem>
                <AgendaDate>
                  {coffee.eventDate.slice(8, 10)}
                  <small>{shortMonth(coffee.eventDate)}</small>
                </AgendaDate>
                <span>
                  <AgendaTitle>Café de Boas-vindas</AgendaTitle>
                  <Detail>
                    {coffee.eventDate === todayKey() ? 'Hoje' : weekdayLabel(coffee.eventDate)}, 17:30 ·{' '}
                    {plural(coffee.rosterCount, 'pessoa na lista', 'pessoas na lista')}
                  </Detail>
                </span>
              </AgendaItem>
            )}
            {cohort && (
              <AgendaItem>
                <AgendaDate>
                  {cohort.firstLesson.slice(8, 10)}
                  <small>{shortMonth(cohort.firstLesson)}</small>
                </AgendaDate>
                <span>
                  <AgendaTitle>1ª aula da {cohort.name}</AgendaTitle>
                  <Detail>As inscrições fecham às 17:30</Detail>
                </span>
              </AgendaItem>
            )}
          </Panel>
        </AgendaCell>
        <StatCard>
          <PanelHeader>
            <StatLabel>Membros</StatLabel>
            <PanelLink to={AppRoute.Members}>Ver membros</PanelLink>
          </PanelHeader>
          <HighlightValue>{totalMembers}</HighlightValue>
        </StatCard>
        <StatCard>
          <PanelHeader>
            <StatLabel>Na Integração</StatLabel>
            <PanelLink to={AppRoute.People}>Ver pessoas</PanelLink>
          </PanelHeader>
          <HighlightValue>{inIntegration}</HighlightValue>
        </StatCard>
        <StatCard>
          <PanelHeader>
            <StatLabel>Membresia</StatLabel>
            <PanelLink to={AppRoute.Membership}>Ver membresia</PanelLink>
          </PanelHeader>
          <HighlightValue>{funnel.membership_pending ?? 0}</HighlightValue>
        </StatCard>
        <StatCard>
          <PanelHeader>
            <StatLabel>Pequenos Grupos</StatLabel>
            <PanelLink to={AppRoute.SmallGroups}>Ver PGs</PanelLink>
          </PanelHeader>
          <HighlightValue>{community.smallGroups}</HighlightValue>
        </StatCard>
        <StatCard>
          <PanelHeader>
            <StatLabel>Ministérios</StatLabel>
            <PanelLink to={AppRoute.Ministries}>Ver ministérios</PanelLink>
          </PanelHeader>
          <HighlightValue>{community.ministries}</HighlightValue>
        </StatCard>
      </Highlights>

      <Columns>
        <MainColumn>
          <Panel aria-labelledby="integration">
            <PanelHeader>
              <PanelTitle id="integration">Integração</PanelTitle>
              <PanelLink to={AppRoute.Visitors}>Ver visitantes</PanelLink>
            </PanelHeader>
            <StageGrid>
              {FUNNEL.map((stage) => (
                <StatCard key={stage.status}>
                  <StatLabel>{STATUS_META[stage.status].label}</StatLabel>
                  <StatValue>{funnel[stage.status] ?? 0}</StatValue>
                  <Detail>{stage.owner}</Detail>
                </StatCard>
              ))}
            </StageGrid>
          </Panel>
        </MainColumn>

        {makeupNotes.length > 0 && (
          <SideColumn>
            <Panel aria-labelledby="makeups">
              <PanelTitle id="makeups">Dúvidas das reposições</PanelTitle>
              <List>
                {makeupNotes.map((note) => (
                  <ListItem key={`${note.personId}-${note.cohortName}-${note.lessonNumber}`}>
                    <ListLink to={`${AppRoute.Visitors}/${note.personId}/detalhes?tab=makeup`}>
                      <ListName>{note.personName}</ListName>
                      <Detail>
                        Aula {note.lessonNumber}
                        {note.confirmedAt && ` · ${formatTimestampDate(note.confirmedAt)}`}
                      </Detail>
                      <PanelText>{note.notes}</PanelText>
                    </ListLink>
                  </ListItem>
                ))}
              </List>
            </Panel>
          </SideColumn>
        )}
      </Columns>
    </div>
  );
}
