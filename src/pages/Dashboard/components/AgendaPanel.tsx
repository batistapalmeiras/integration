// Components
import { DateBadge } from '../../../components/DateBadge';
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

export function cohortEntry(cohort: UpcomingCohort): AgendaEntry {
  return {
    date: cohort.firstLesson,
    title: `1ª aula da ${cohort.name}`,
    detail: 'As inscrições fecham às 17:30',
  };
}

interface Props {
  entries: AgendaEntry[];
  emptyText: string;
}

export function AgendaPanel({ entries, emptyText }: Props) {
  return (
    <Panel aria-labelledby="agenda">
      <PanelTitle id="agenda">Próximos dias</PanelTitle>
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
