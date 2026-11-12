// Local
import { listRecentMakeupNotes } from '../../src/repositories/lessonMakeups';

const row = (name: string, number: number, date: string, notes: string) => ({
  notes,
  attendance: {
    enrollment: { person: { id: name, name } },
    lesson: { number, date, cohort: { name: 'Turma 20/09/2026' } },
  },
});

const { supabase } = vi.hoisted(() => {
  const builder = {
    select: () => builder,
    not: () => builder,
    neq: () =>
      Promise.resolve({
        data: [
          row('Ana', 1, '2026-09-20', 'dúvida da aula 1'),
          row('Bruno', 2, '2026-09-27', 'dúvida da aula 2'),
          row('Carla', 3, '2026-10-04', 'dúvida da aula 3'),
        ],
        error: null,
      }),
  };
  return { supabase: { from: () => builder } };
});

vi.mock('../../src/lib/supabase', () => ({ supabase }));

describe('listRecentMakeupNotes', () => {
  it('lists the doubts from the latest lessons first and keeps only the asked amount', async () => {
    const notes = await listRecentMakeupNotes(2);

    expect(notes.map((note) => note.personName)).toEqual(['Carla', 'Bruno']);
    expect(notes[0]).toEqual({
      personId: 'Carla',
      personName: 'Carla',
      lessonNumber: 3,
      cohortName: 'Turma 20/09/2026',
      notes: 'dúvida da aula 3',
    });
  });
});
