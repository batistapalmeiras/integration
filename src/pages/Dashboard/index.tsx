// Libs
import {
  Empty,
  Skeleton,
  StatCard,
  StatLabel,
  StatValue,
  text,
  useAuthCtx,
} from 'bp-kit';
// Components
import { DateBadge } from '../../components/DateBadge';
import { PageHeader } from '../../components/PageHeader';
import { List, ListItem, ListName } from '../../components/List';
import { IconBadge } from '../../components/MenuOptions';
import { birthdayAgeLabel, birthdayMonth, birthdaysInMonth, isBirthdayToday, MemberBirthday, upcomingBirthdaysThisMonth } from '../../domain/birthdays';
import { formatTimestampDate, monthName, todayKey, weekdayLabel } from '../../domain/dates';
import { useMemberBirthdays } from '../../queries/person';
import { findPastorAreaById, NAV_ITEMS } from '../../routes/navigation';
import { PersonStatus, STATUS_META } from '../../types/person';
// Local
import { usePastorDashboard } from './hooks/usePastorDashboard';
import {
  AgendaItem,
  AgendaTitle,
  BirthdayHeading,
  BirthdaysPanel,
  CardLink,
  Columns,
  Detail,
  HighlightValue,
  Highlights,
  MainColumn,
  Page,
  Panel,
  PanelText,
  PanelTitle,
  Section,
  SideColumn,
  AgendaList,
  StageGrid,
  StatRow,
  StatText,
} from './styles';

const FUNNEL: { status: PersonStatus; owner: string }[] = [
  { status: 'initial_contact', owner: 'Equipe de Integração' },
  { status: 'retry_contact', owner: 'Equipe de Integração' },
  { status: 'welcome_coffee', owner: 'Equipe de Integração' },
  { status: 'pending_signup', owner: 'A própria pessoa' },
  { status: 'integration', owner: 'Professor' },
  { status: 'membership_pending', owner: 'Conselho Administrativo' },
];

const INTEGRATION_ICON = findPastorAreaById('integration')!.icon;

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

function StageIcon({ status }: { status: PersonStatus }) {
  const Icon = STATUS_META[status].icon;
  return <Icon size={22} />;
}

const UPCOMING_BIRTHDAYS_LIMIT = 5;

function birthdayDetail(birthday: MemberBirthday, today: string): string {
  const day = isBirthdayToday(birthday.birthDate, today) ? 'Hoje' : weekdayLabel(`${today.slice(0, 4)}${birthday.birthDate.slice(4)}`);
  const age = birthdayAgeLabel(birthday.birthDate, Number(today.slice(0, 4)), today);
  return age ? `${day} · ${age.toLowerCase()}` : day;
}

function BirthdaysHighlight() {
  const { data, loading, error } = useMemberBirthdays();
  const today = todayKey();
  const month = monthName(birthdayMonth(today)).toLowerCase();
  const monthTotal = birthdaysInMonth(data ?? [], birthdayMonth(today)).length;
  const upcoming = upcomingBirthdaysThisMonth(data ?? [], today);
  const shown = upcoming.slice(0, UPCOMING_BIRTHDAYS_LIMIT);

  return (
    <BirthdaysPanel aria-labelledby="birthdays">
      <BirthdayHeading>
        <PanelTitle id="birthdays">Aniversariantes de {month}</PanelTitle>
        {monthTotal > 0 && <CardLink to={NAV_ITEMS.birthdays.path}>Ver todos os {monthTotal}</CardLink>}
      </BirthdayHeading>
      {loading && <Skeleton $h="120px" />}
      {!loading && !!error && <PanelText>{text.feedback.loadError}</PanelText>}
      {!loading && !error && monthTotal === 0 && <PanelText>Nenhum membro faz aniversário em {month}.</PanelText>}
      {!loading && !error && monthTotal > 0 && upcoming.length === 0 && (
        <PanelText>Os aniversários de {month} já passaram.</PanelText>
      )}
      {shown.length > 0 && (
        <AgendaList>
          {shown.map((birthday) => (
            <AgendaItem key={birthday.personId}>
              <DateBadge date={birthday.birthDate} strong={isBirthdayToday(birthday.birthDate, today)} />
              <span>
                <AgendaTitle>{birthday.name}</AgendaTitle>
                <Detail>{birthdayDetail(birthday, today)}</Detail>
              </span>
            </AgendaItem>
          ))}
        </AgendaList>
      )}
    </BirthdaysPanel>
  );
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
  const inIntegration = FUNNEL.filter((stage) => stage.status !== 'membership_pending').reduce(
    (sum, stage) => sum + (funnel[stage.status] ?? 0),
    0,
  );

  const highlights = [
    { label: 'Membros', value: totalMembers, icon: NAV_ITEMS.members.icon, link: 'Ver membros', path: NAV_ITEMS.members.path },
    { label: 'Na Integração', value: inIntegration, icon: INTEGRATION_ICON, link: 'Ver pessoas', path: NAV_ITEMS.people.path },
    {
      label: 'Em processo de membresia',
      value: funnel.membership_pending ?? 0,
      icon: NAV_ITEMS.membership.icon,
      link: 'Ver membresia',
      path: NAV_ITEMS.membership.path,
    },
    { label: 'Pequenos Grupos', value: community.smallGroups, icon: NAV_ITEMS.smallGroups.icon, link: 'Ver PGs', path: NAV_ITEMS.smallGroups.path },
    { label: 'Ministérios', value: community.ministries, icon: NAV_ITEMS.ministries.icon, link: 'Ver ministérios', path: NAV_ITEMS.ministries.path },
  ];

  return (
    <Page>
      <PageHeader title={title} subtitle={todayLabel()} />

      <Panel aria-labelledby="agenda">
        <PanelTitle id="agenda">Próximos dias</PanelTitle>
        {!coffee && !cohort && <PanelText>Nenhum café ou turma agendado.</PanelText>}
        <AgendaList>
          {coffee && (
            <AgendaItem>
              <DateBadge date={coffee.eventDate} />
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
              <DateBadge date={cohort.firstLesson} />
              <span>
                <AgendaTitle>1ª aula da {cohort.name}</AgendaTitle>
                <Detail>As inscrições fecham às 17:30</Detail>
              </span>
            </AgendaItem>
          )}
        </AgendaList>
      </Panel>

      <BirthdaysHighlight />

      <Highlights aria-label="Números da igreja">
        {highlights.map((highlight) => (
          <StatCard key={highlight.label}>
            <StatRow>
              <IconBadge>
                <highlight.icon size={22} />
              </IconBadge>
              <StatText>
                <StatLabel>{highlight.label}</StatLabel>
                <HighlightValue>{highlight.value}</HighlightValue>
                <CardLink to={highlight.path}>{highlight.link}</CardLink>
              </StatText>
            </StatRow>
          </StatCard>
        ))}
      </Highlights>

      <Columns>
        <MainColumn>
          <Section aria-labelledby="integration">
            <PanelTitle id="integration">Integração</PanelTitle>
            <StageGrid>
              {FUNNEL.map((stage) => (
                <StatCard key={stage.status}>
                  <StatRow>
                    <IconBadge>
                      <StageIcon status={stage.status} />
                    </IconBadge>
                    <StatText>
                      <StatLabel>{STATUS_META[stage.status].label}</StatLabel>
                      <StatValue>{funnel[stage.status] ?? 0}</StatValue>
                      <Detail>{stage.owner}</Detail>
                    </StatText>
                  </StatRow>
                </StatCard>
              ))}
            </StageGrid>
          </Section>
        </MainColumn>

        {makeupNotes.length > 0 && (
          <SideColumn>
            <Panel aria-labelledby="makeups">
              <PanelTitle id="makeups">Dúvidas das reposições</PanelTitle>
              <List>
                {makeupNotes.map((note) => (
                  <ListItem key={`${note.personId}-${note.cohortName}-${note.lessonNumber}`}>
                    <ListName>{note.personName}</ListName>
                    <Detail>
                      Aula {note.lessonNumber}
                      {note.confirmedAt && ` · ${formatTimestampDate(note.confirmedAt)}`}
                    </Detail>
                    <PanelText>{note.notes}</PanelText>
                  </ListItem>
                ))}
              </List>
            </Panel>
          </SideColumn>
        )}
      </Columns>
    </Page>
  );
}
