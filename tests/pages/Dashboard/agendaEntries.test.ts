// Local
import { agendaEntries } from '../../../src/pages/Dashboard/components/AgendaPanel';

describe('agenda entries', () => {
  it('puts the coffee, the next turma and the classes under way in date order', () => {
    const entries = agendaEntries({
      coffee: { eventDate: '2099-12-06', rosterCount: 4 },
      cohort: { name: 'Turma 13/12', firstLesson: '2099-12-13' },
      lessons: [
        { cohortName: 'Turma 15/11', number: 3, date: '2099-11-29' },
        { cohortName: 'Turma 15/11', number: 4, date: '2099-12-06' },
      ],
    });

    expect(entries.map((entry) => [entry.date, entry.title])).toEqual([
      ['2099-11-29', 'Aula 3'],
      ['2099-12-06', 'Café de Boas-vindas'],
      ['2099-12-06', 'Aula 4'],
      ['2099-12-13', '1ª aula da Turma 13/12'],
    ]);
  });
});
