// Local
import { membershipTimeline, visitTimeline } from '../../src/domain/personTimeline';

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

describe('membershipTimeline', () => {
  const source = {
    origin: 'integration',
    createdAt: '2026-09-06T12:00:00Z',
    statuteAgreedAt: null,
    membershipInterestSentAt: null,
    councilDate: null,
    changes: [],
    events: [],
    communityJoins: [],
    fieldLabel: (column: string) => column,
  };

  it('tells the story of the membership: ficha, statute, confirmation by whom, council and community', () => {
    const entries = membershipTimeline({
      ...source,
      membershipInterestSentAt: '2026-10-20T15:00:00Z',
      statuteAgreedAt: '2026-10-21T15:00:00Z',
      councilDate: '2026-11-10',
      changes: [
        {
          fromStatus: 'membership_pending',
          toStatus: 'member',
          note: null,
          changedAt: '2026-11-11T15:00:00Z',
          authorName: 'Pastor Silva Souza',
        },
      ],
      communityJoins: [{ kind: 'small_group', name: 'PG Centro', joinedAt: '2026-11-11T15:01:00Z' }],
    });

    expect(entries.map((entry) => entry.label)).toEqual([
      'Ficha de Interesse enviada',
      'Aceitou o estatuto',
      'Aprovado no Conselho Administrativo',
      'Confirmado como membro',
      'Entrou no Pequeno Grupo PG Centro',
    ]);
    expect(entries[3].actor).toBe('Pastor');
  });

  it('marks an imported member and ignores the groups that came along with the import', () => {
    const entries = membershipTimeline({
      ...source,
      origin: 'imported',
      communityJoins: [
        { kind: 'small_group', name: 'PG Centro', joinedAt: '2026-09-06T12:00:05Z' },
        { kind: 'ministry', name: 'Louvor', joinedAt: '2026-10-30T12:00:00Z' },
      ],
    });

    expect(entries.map((entry) => entry.label)).toEqual([
      'Cadastro importado do sistema antigo',
      'Passou a servir em Louvor',
    ]);
  });

  const event = (kind: string, at: string, overrides = {}) => ({
    event: kind,
    at,
    authorName: 'Pastor Silva Souza',
    name: null,
    role: null,
    from: null,
    to: null,
    fields: [],
    ...overrides,
  });

  it('turns the recorded events into entries with who did them', () => {
    const entries = membershipTimeline({
      ...source,
      events: [
        event('small_group_joined', '2026-11-12T10:00:00Z', { name: 'PG Centro' }),
        event('small_group_role_added', '2026-11-12T10:05:00Z', { name: 'PG Centro', role: 'leader' }),
        event('membership_status_changed', '2026-11-13T10:00:00Z', { from: 'active', to: 'transferred' }),
        event('ministry_left', '2026-11-13T10:00:01Z', { name: 'Louvor' }),
      ],
    });

    expect(entries.map((entry) => entry.label)).toEqual([
      'Entrou no Pequeno Grupo PG Centro',
      'Passou a ser Líder do Pequeno Grupo PG Centro',
      'Situação alterada de Ativo para Transferido',
      'Deixou de servir em Louvor',
    ]);
    expect(entries[0].actor).toBe('Pastor');
  });

  it('joins the edits of one save into a single entry and names the fields', () => {
    const entries = membershipTimeline({
      ...source,
      fieldLabel: (column) => ({ cpf: 'CPF', marital_status: 'Estado civil' })[column] ?? column,
      events: [
        event('record_updated', '2026-11-12T10:00:00Z', { fields: ['cpf'] }),
        event('record_updated', '2026-11-12T10:00:02Z', { fields: ['marital_status'] }),
      ],
    });

    expect(entries).toHaveLength(1);
    expect(entries[0].label).toBe('Ficha atualizada');
    expect(entries[0].detail).toBe('Campos: CPF, Estado civil');
  });

  it('does not repeat a join that was already recorded as an event', () => {
    const entries = membershipTimeline({
      ...source,
      events: [event('small_group_joined', '2026-11-12T10:00:00Z', { name: 'PG Centro' })],
      communityJoins: [{ kind: 'small_group', name: 'PG Centro', joinedAt: '2026-11-12T10:00:00Z' }],
    });

    expect(entries.map((entry) => entry.label)).toEqual(['Entrou no Pequeno Grupo PG Centro']);
  });

  it('prefers the council event over the council date of the record', () => {
    const entries = membershipTimeline({
      ...source,
      councilDate: '2026-11-10',
      events: [event('council_changed', '2026-11-11T10:00:00Z', { from: null, to: '2026-11-10' })],
    });

    expect(entries.map((entry) => entry.label)).toEqual(['Aprovado no Conselho Administrativo de 10/11/2026']);
  });
});
