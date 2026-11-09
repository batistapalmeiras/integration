// Local
import { MemberRecord } from '../../../src/domain/memberRecords';
import {
  displayValue,
  LEGACY_FAMILY_FIELDS,
  MEMBER_RECORD_SECTIONS,
  sectionResolver,
  WEDDING_DATE_FIELD,
} from '../../../src/features/memberRecord';

const blank: MemberRecord = {
  name: 'Ana',
  phone: '',
  email: '',
  membershipStatus: 'active',
  birthDate: '',
  gender: '',
  maritalStatus: '',
  nationality: '',
  otherPhone: '',
  addressZip: '',
  addressStreet: '',
  addressNumber: '',
  addressComplement: '',
  addressNeighborhood: '',
  addressCity: '',
  addressState: '',
  addressReference: '',
  cpf: '',
  publicNotes: '',
  birthplace: '',
  birthState: '',
  education: '',
  profession: '',
  workplace: '',
  fatherName: '',
  motherName: '',
  spouseName: '',
  weddingDate: '',
  childrenNames: '',
  childrenCount: '',
  baptismDate: '',
  baptismChurch: '',
  ministryBackground: '',
  preferredContact: '',
  readsEmail: '',
  acceptsVisits: '',
  legacyStatus: '',
};

const section = (id: string) => MEMBER_RECORD_SECTIONS.find((item) => item.id === id)!;
const field = (name: keyof MemberRecord) =>
  MEMBER_RECORD_SECTIONS.flatMap((item) => item.fields).find((item) => item.name === name)!;

describe('member record sections', () => {
  it('lists every field of the record exactly once, with the family ones in the family panel', () => {
    const names = [
      ...MEMBER_RECORD_SECTIONS.flatMap((item) => item.fields.map((f) => f.name)),
      WEDDING_DATE_FIELD.name,
      ...Object.values(LEGACY_FAMILY_FIELDS).map((f) => f.name),
    ];
    expect(new Set(names).size).toBe(names.length);
    expect([...names].sort()).toEqual(Object.keys(blank).sort());
  });

  it('keeps the CPF with the personal data', () => {
    expect(section('personal').fields.map((f) => f.name)).toContain('cpf');
  });
});

describe('displayValue', () => {
  it('shows labels instead of codes and dates in the Brazilian format', () => {
    const record: MemberRecord = { ...blank, birthDate: '1990-03-07', gender: 'female', readsEmail: 'no' };
    expect(displayValue(record, field('birthDate'))).toBe('07/03/1990');
    expect(displayValue(record, field('gender'))).toBe('Feminino');
    expect(displayValue(record, field('readsEmail'))).toBe('Não');
    expect(displayValue(record, field('membershipStatus'))).toBe('Ativo');
  });

  it('leaves missing data blank', () => {
    expect(displayValue(blank, field('birthDate'))).toBe('');
  });
});

describe('sectionResolver', () => {
  const resolve = (id: string, record: MemberRecord) =>
    sectionResolver(section(id))(record, undefined, { fields: {}, shouldUseNativeValidation: false });

  it('ignores invalid data saved in other sections', async () => {
    const result = await resolve('contact', { ...blank, cpf: '111.111.111-11' });
    expect(result.errors).toEqual({});
  });

  it('blocks the save when a field of the section is invalid', async () => {
    const result = await resolve('personal', { ...blank, cpf: '111.111.111-11' });
    expect(Object.keys(result.errors)).toEqual(['cpf']);
  });
});
