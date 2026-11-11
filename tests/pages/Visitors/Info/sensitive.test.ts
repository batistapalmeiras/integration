// Local
import { MemberProfile } from '../../../../src/domain/memberRecords';
import { PersonSensitive } from '../../../../src/domain/personSensitive';
import { Person } from '../../../../src/features/visitors';
import { membershipSections } from '../../../../src/pages/Visitors/Info/sensitive';

const person: Person = {
  id: 'p1',
  name: 'Guilherme Otaviano Carmo Silva',
  phone: '31988887777',
  age: null,
  email: 'gui@example.com',
  status: 'membership_pending',
  whatsapp_opened_at: null,
  class_invite_sent_at: null,
  signup_window_from: null,
  membership_interest_sent_at: null,
  entry_type: 'transfer_letter',
  statute_agreed_at: '2026-11-11T12:00:00Z',
  coffee_retry_used: false,
  small_group_id: 'g1',
  origin: 'visitor',
  membership_status: null,
  visited_on: null,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

const sensitive: PersonSensitive = {
  attending_since: null,
  previous_church: null,
  baptism_info: null,
  conversion_testimony: null,
  marital_status_story: null,
  birth_date: '2008-06-16',
  origin_church: 'Primeira Igreja Batista',
  ministry_interests: ['Transmissão', 'Multimídia'],
  secret_society: 'Não',
  wants_small_group: 'already',
  membership_note: null,
};

const profile: MemberProfile = {
  gender: 'male',
  maritalStatus: 'single',
  otherPhone: '',
  addressZip: '30000000',
  addressStreet: 'Rua A',
  addressNumber: '10',
  addressComplement: '',
  addressNeighborhood: 'Centro',
  addressCity: 'Belo Horizonte',
  addressState: 'MG',
  addressReference: '',
  cpf: '123.456.789-09',
  baptismDate: '2015-05-10',
  baptismChurch: 'Igreja Batista do Bairro',
};

type Sections = ReturnType<typeof membershipSections>;

const valueOf = (sections: Sections, label: string) =>
  sections.flatMap((section) => section.entries).find((item) => item.label === label)?.value;

const sectionOf = (sections: Sections, title: string) => sections.find((section) => section.title === title);

describe('membership sections', () => {
  it('shows the answers the person gave on the membership form', () => {
    const sections = membershipSections(person, sensitive, profile, 'PG Centro');

    expect(valueOf(sections, 'Sexo')).toBe('Masculino');
    expect(valueOf(sections, 'CPF')).toBe('123.456.789-09');
    expect(valueOf(sections, 'Estado civil')).toBe('Solteiro(a)');
    expect(valueOf(sections, 'Celular')).toBe('(31) 98888-7777');
    expect(sectionOf(sections, 'Endereço')?.entries[0]).toMatchObject({ wide: true });
    expect(sectionOf(sections, 'Endereço')?.entries[0].value).toContain('Rua A, 10');
    expect(valueOf(sections, 'Igreja do batismo')).toBe('Igreja Batista do Bairro');
    expect(valueOf(sections, 'Data de batismo')).toBe('10/05/2015');
    expect(valueOf(sections, 'Quer participar de um PG')).toBe('Já faço — PG Centro');
  });

  it('groups the answers like the member screen, then the form-only answers', () => {
    const titles = membershipSections(person, sensitive, profile, null).map((section) => section.title);

    expect(titles).toEqual(['Contato', 'Dados pessoais', 'Vida na igreja', 'Endereço', 'Servir e comunidade']);
  });

  it('gives the e-mail the whole row', () => {
    const email = membershipSections(person, sensitive, profile, null)
      .flatMap((section) => section.entries)
      .find((item) => item.label === 'E-mail');

    expect(email?.wide).toBe(true);
  });

  it('keeps the short contact fields side by side, before the e-mail', () => {
    const contact = sectionOf(membershipSections(person, sensitive, profile, null), 'Contato');

    expect(contact?.entries.map((item) => item.label)).toEqual(['Celular', 'Outro telefone para contato', 'E-mail']);
  });

  it('leaves out the baptism questions for who is joining by baptism', () => {
    const sections = membershipSections({ ...person, entry_type: 'baptism' }, sensitive, profile, null);

    expect(valueOf(sections, 'Igreja do batismo')).toBeUndefined();
    expect(valueOf(sections, 'Data de batismo')).toBeUndefined();
  });

  it('shows no for who does not want to serve in a ministry', () => {
    const sections = membershipSections(person, { ...sensitive, ministry_interests: [] }, profile, null);

    expect(valueOf(sections, 'Interesse em ministérios')).toBe('Não');
  });

  it('marks the profile answers as unanswered while they are loading', () => {
    const gender = membershipSections(person, sensitive, null, null)
      .flatMap((section) => section.entries)
      .find((item) => item.label === 'Sexo');

    expect(gender).toMatchObject({ value: 'Sem resposta', answered: false });
  });
});
