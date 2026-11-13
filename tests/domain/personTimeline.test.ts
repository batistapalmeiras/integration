// Local
import { membershipTimeline, visitTimeline } from '../../src/domain/personTimeline';

const base = {
  visitedOn: '2026-10-04',
  changes: [],
  events: [],
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

  it('says the first name of who did each change and nothing when no one is recorded', () => {
    const [, byPerson, bySystem] = visitTimeline({
      ...base,
      changes: [
        change('retry_contact', '2026-10-05T13:00:00Z', { fromStatus: 'initial_contact', authorName: 'Ana Souza' }),
        change('archived', '2026-10-06T13:00:00Z', { fromStatus: 'retry_contact' }),
      ],
    });

    expect(byPerson.actor).toBe('Ana');
    expect(bySystem.actor).toBeNull();
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

describe('visitor events', () => {
  const visitorEvent = (kind: string, at: string, overrides = {}) => ({
    event: kind,
    at,
    authorName: 'Ana Souza',
    fields: [],
    lesson: null,
    cohort: null,
    ...overrides,
  });

  it('adds what the volunteers did with the visitor, with who did it', () => {
    const entries = visitTimeline({
      ...base,
      events: [
        visitorEvent('whatsapp_opened', '2026-10-05T13:00:00Z'),
        visitorEvent('class_invite_sent', '2026-10-12T13:00:00Z'),
        visitorEvent('lesson_attended', '2026-10-20T13:00:00Z', {
          authorName: 'Bruno Lima',
          lesson: 2,
          cohort: 'Turma 15/11/2026',
        }),
        visitorEvent('lesson_unmarked', '2026-10-21T13:00:00Z', { lesson: 2, cohort: 'Turma 15/11/2026' }),
      ],
    });

    expect(entries.slice(1).map((entry) => [entry.label, entry.actor])).toEqual([
      ['WhatsApp aberto para o contato', 'Ana'],
      ['Convite para a turma enviado', 'Ana'],
      ['Presença na aula 2 marcada', 'Bruno'],
      ['Presença na aula 2 desmarcada', 'Ana'],
    ]);
    expect(entries[3].detail).toBe('Turma 15/11/2026');
  });

  it('joins the edits of one save in a single entry with the names of the fields', () => {
    const entries = visitTimeline({
      ...base,
      events: [
        visitorEvent('record_updated', '2026-10-05T13:00:00Z', { fields: ['name'] }),
        visitorEvent('record_updated', '2026-10-05T13:00:03Z', { fields: ['phone', 'email'] }),
      ],
    });

    expect(entries).toHaveLength(2);
    expect(entries[1].label).toBe('Dados alterados: Nome, Celular, E-mail');
    expect(entries[1].detail).toBeNull();
  });

  it('does not repeat the ficha sent when the event was recorded', () => {
    const entries = visitTimeline({
      ...base,
      membershipInterestSentAt: '2026-10-30T13:00:00Z',
      events: [visitorEvent('membership_interest_sent', '2026-10-30T13:00:00Z')],
    });

    expect(entries.filter((entry) => entry.label === 'Ficha de Interesse enviada')).toHaveLength(1);
  });
});

describe('actor of a change without an author', () => {
  it('says the system did it when an automatic routine moved the person', () => {
    const [, entry] = visitTimeline({
      ...base,
      changes: [
        change('archived', '2026-10-20T13:00:00Z', {
          fromStatus: 'pending_signup',
          note: 'Não se inscreveu na turma até o início da primeira aula',
        }),
      ],
    });

    expect(entry.actor).toBe('Sistema');
  });

  it('shows no one when the person filled in the public form', () => {
    const [, entry] = visitTimeline({
      ...base,
      changes: [
        change('membership_pending', '2026-11-12T01:11:00Z', {
          fromStatus: 'integration',
          note: 'Ficha de Interesse de Membresia preenchida',
        }),
      ],
    });

    expect(entry.actor).toBeNull();
  });
});

describe('membershipTimeline', () => {
  const source = {
    origin: 'integration',
    createdAt: '2026-09-06T12:00:00Z',
    membershipInterestSentAt: null,
    councilDate: null,
    changes: [],
    events: [],
    communityJoins: [],
    fieldLabel: (column: string) => column,
  };

  it('tells the story of the membership: ficha, confirmation by whom, council and community', () => {
    const entries = membershipTimeline({
      ...source,
      membershipInterestSentAt: '2026-10-20T15:00:00Z',
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
    relation: null,
    gender: null,
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

  it('says which relative was added or removed and by whom', () => {
    const entries = membershipTimeline({
      ...source,
      events: [
        event('family_added', '2026-11-12T10:00:00Z', { relation: 'child', gender: 'male', name: 'Pedro Souza' }),
        event('family_added', '2026-11-12T10:00:01Z', { relation: 'parent_in_law', gender: null, name: 'Ana Lima' }),
        event('family_removed', '2026-11-13T10:00:00Z', { relation: 'sibling', gender: 'female', name: 'Lia Souza' }),
      ],
    });

    expect(entries.map((entry) => [entry.label, entry.actor])).toEqual([
      ['Adicionou Filho: Pedro Souza', 'Pastor'],
      ['Adicionou Sogro(a): Ana Lima', 'Pastor'],
      ['Removeu Irmã: Lia Souza', 'Pastor'],
    ]);
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
    expect(entries[0].label).toBe('Dados alterados: CPF, Estado civil');
    expect(entries[0].detail).toBeNull();
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

  it('shows when the person filled in the direct signup, with no author', () => {
    const entries = membershipTimeline({
      ...source,
      origin: 'membership_signup',
      changes: [
        {
          fromStatus: null,
          toStatus: 'membership_pending',
          note: 'Cadastro direto de membresia',
          changedAt: '2026-11-10T20:47:00Z',
          authorName: null,
        },
      ],
    });

    expect(entries.map((entry) => [entry.label, entry.actor])).toEqual([
      ['Preencheu o cadastro de membresia', null],
    ]);
  });

  it('shows the groups joined on the day of the signup and says the pastor placed the person', () => {
    const entries = membershipTimeline({
      ...source,
      origin: 'membership_signup',
      createdAt: '2026-11-10T20:47:00Z',
      communityJoins: [{ kind: 'ministry', name: 'Kids Palmeiras', joinedAt: '2026-11-10T21:00:28Z' }],
    });

    expect(entries.map((entry) => [entry.label, entry.actor])).toEqual([['Passou a servir em Kids Palmeiras', 'Pastor']]);
  });
});
