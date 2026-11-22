// Components
import { DateBadge } from '../../../components/DateBadge';
import { UpcomingLesson } from '../../../domain/cohortSchedule';
import { todayKey, weekdayLabel } from '../../../domain/dates';
// Local
import { AgendaItem, AgendaList, AgendaTitle, Detail, Panel, PanelText, PanelTitle } from '../styles';

export interface AgendaEntry {
  date: string;
  title: string;
  detail: string;
}

export interface UpcomingCoffee {
  eventDate: string;
  rosterCount: number;
}

export interface UpcomingCohort {
  name: string;
  firstLesson: string;
}

export function plural(count: number, singular: string, pluralForm: string): string {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

export function dayLabel(date: string): string {
  return date === todayKey() ? 'Hoje' : weekdayLabel(date);
}

export function coffeeEntry(coffee: UpcomingCoffee): AgendaEntry {
  return {
    date: coffee.eventDate,
    title: 'Café de Boas-vindas',
    detail: `${dayLabel(coffee.eventDate)}, 17:30 · ${plural(coffee.rosterCount, 'pessoa na lista', 'pessoas na lista')}`,
  };
}

function cohortEntry(cohort: UpcomingCohort): AgendaEntry {
  return {
    date: cohort.firstLesson,
    title: `1ª aula da ${cohort.name}`,
    detail: 'As inscrições fecham às 17:30',
  };
}

function lessonEntry(lesson: UpcomingLesson): AgendaEntry {
  return {
    date: lesson.date,
    title: `Aula ${lesson.number}`,
    detail: dayLabel(lesson.date),
  };
}

export function agendaEntries({
  coffee,
  cohort,
  lessons,
}: {
  coffee: UpcomingCoffee | null;
  cohort: UpcomingCohort | null;
  lessons: UpcomingLesson[];
}): AgendaEntry[] {
  return [
    ...(coffee ? [coffeeEntry(coffee)] : []),
    ...(cohort ? [cohortEntry(cohort)] : []),
    ...lessons.map(lessonEntry),
  ].sort((a, b) => a.date.localeCompare(b.date));
}

export const AGENDA_TITLE = 'Próximos dias';

interface Props {
  entries: AgendaEntry[];
  emptyText: string;
  titled?: boolean;
}

export function AgendaPanel({ entries, emptyText, titled = true }: Props) {
  return (
    <Panel aria-labelledby="agenda">
      {titled && <PanelTitle id="agenda">{AGENDA_TITLE}</PanelTitle>}
      {entries.length === 0 && <PanelText>{emptyText}</PanelText>}
      <AgendaList>
        {entries.map((entry) => (
          <AgendaItem key={`${entry.date}-${entry.title}`}>
            <DateBadge date={entry.date} />
            <span>
              <AgendaTitle>{entry.title}</AgendaTitle>
              <Detail>{entry.detail}</Detail>
            </span>
          </AgendaItem>
        ))}
      </AgendaList>
    </Panel>
  );
}
