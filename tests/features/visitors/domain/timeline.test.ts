// Local
import { previewTimeline, visitTimeline } from '../../../../src/features/visitors/domain/timeline';

const base = {
  visitedOn: '2026-10-04',
  changes: [],
  upcomingCoffeeDate: null,
  cohortName: null,
  membershipInterestSentAt: null,
};

const change = (toStatus: string, changedAt: string, overrides = {}) => ({
  fromStatus: null,
  toStatus,
  note: null,
  changedAt,
  authorName: null,
  ...overrides,
});

describe('visitTimeline', () => {
  it('tells the whole story of the visitor from the oldest event to the newest', () => {
    const entries = visitTimeline({
      ...base,
      cohortName: 'Turma 15/11/2026',
      changes: [
        change('retry_contact', '2026-10-05T13:00:00Z', { fromStatus: 'initial_contact', authorName: 'Ana Souza' }),
        change('welcome_coffee', '2026-10-07T13:00:00Z', { fromStatus: 'retry_contact' }),
        change('pending_signup', '2026-10-11T15:00:00Z', {
          fromStatus: 'welcome_coffee',
          note: 'Compareceu ao Café de boas-vindas',
        }),
        change('integration', '2026-10-12T15:00:00Z', {
          fromStatus: 'pending_signup',
          note: 'Inscrição via formulário público',
        }),
      ],
    });

    expect(entries.map((entry) => entry.label)).toEqual([
      'Primeira visita à igreja',
      'Contato sem resposta',
      'Aceitou o convite para o café',
      'Compareceu ao Café de boas-vindas',
      'Inscrito na Turma 15/11/2026',
    ]);
    expect(entries[4].detail).toBe('Inscrição via formulário público');
  });

  it('says the first name of who did each change, and that the system did the ones without an author', () => {
    const [, byPerson, bySystem] = visitTimeline({
      ...base,
      changes: [
        change('retry_contact', '2026-10-05T13:00:00Z', { fromStatus: 'initial_contact', authorName: 'Ana Souza' }),
        change('archived', '2026-10-06T13:00:00Z', { fromStatus: 'retry_contact' }),
      ],
    });

    expect(byPerson.actor).toBe('Ana');
    expect(bySystem.actor).toBe('Sistema');
  });

  it('calls a coffee no-show by its name and not as a contact without answer', () => {
    const [, entry] = visitTimeline({
      ...base,
      changes: [change('retry_contact', '2026-10-12T13:00:00Z', { fromStatus: 'welcome_coffee' })],
    });

    expect(entry.label).toBe('Não compareceu ao café');
  });

  it('keeps the note of an archiving as extra detail', () => {
    const [, archived] = visitTimeline({
      ...base,
      changes: [
        change('archived', '2026-10-20T15:00:00Z', {
          fromStatus: 'pending_signup',
          note: 'Recusou o convite para as aulas de Integração',
        }),
      ],
    });

    expect(archived.label).toBe('Arquivado');
    expect(archived.detail).toBe('Recusou o convite para as aulas de Integração');
  });

  it('shows the coffee that is still to come', () => {
    const entries = visitTimeline({ ...base, upcomingCoffeeDate: '2026-12-06' });

    expect(entries.at(-1)?.label).toBe('Café de boas-vindas agendado');
  });

  it('is empty when nothing is known yet', () => {
    expect(visitTimeline({ ...base, visitedOn: null })).toEqual([]);
  });
});

describe('previewTimeline', () => {
  const entries = (count: number) =>
    Array.from({ length: count }, (_, index) => ({
      date: `2026-10-${String(index + 1).padStart(2, '0')}`,
      at: null,
      label: `Evento ${index + 1}`,
      detail: null,
      actor: null,
    }));

  it('shows everything while it still fits', () => {
    expect(previewTimeline(entries(4)).map((item) => item.kind)).toEqual(['entry', 'entry', 'entry', 'entry']);
  });

  it('shows the first three, the gap and the most recent one when there is more', () => {
    const preview = previewTimeline(entries(9));

    expect(preview.map((item) => (item.kind === 'gap' ? 'gap' : item.entry.label))).toEqual([
      'Evento 1',
      'Evento 2',
      'Evento 3',
      'gap',
      'Evento 9',
    ]);
  });
});
