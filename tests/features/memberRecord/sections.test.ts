// Local
import { MemberRecord } from '../../../src/domain/memberRecords';
import {
  addressLines,
  displayValue,
  FAMILY_NAME_FIELDS,
  MEMBER_RECORD_SECTIONS,
  sectionResolver,
} from '../../../src/features/memberRecord';

const blank: MemberRecord = {
  name: 'Ana',
  phone: '',
  email: '',
  membershipStatus: 'active',
  birthDate: '',
  gender: '',
  maritalStatus: '',
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
  fatherName: '',
  motherName: '',
  spouseName: '',
  childrenNames: '',
  childrenCount: '',
  baptismDate: '',
  baptismChurch: '',
  entryType: '',
  originChurch: '',
};

const section = (id: string) => MEMBER_RECORD_SECTIONS.find((item) => item.id === id)!;
const field = (name: keyof MemberRecord) =>
  MEMBER_RECORD_SECTIONS.flatMap((item) => item.fields).find((item) => item.name === name)!;

describe('member record sections', () => {
  it('lists every field of the record exactly once, with the family ones in the family panel', () => {
    const names = [
      ...MEMBER_RECORD_SECTIONS.flatMap((item) => item.fields.map((f) => f.name)),
      ...Object.values(FAMILY_NAME_FIELDS).map((f) => f.name),
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
    const record: MemberRecord = { ...blank, birthDate: '1990-03-07', gender: 'female', maritalStatus: 'married' };
    expect(displayValue(record, field('birthDate'))).toBe('07/03/1990');
    expect(displayValue(record, field('gender'))).toBe('Feminino');
    expect(displayValue(record, field('maritalStatus'))).toBe('Casado(a)');
    expect(displayValue(record, field('membershipStatus'))).toBe('Ativo');
  });

  it('leaves missing data blank', () => {
    expect(displayValue(blank, field('birthDate'))).toBe('');
  });
});

describe('sectionResolver', () => {
  const resolve = (id: string, record: MemberRecord, optionalPhone = false) =>
    sectionResolver(section(id), optionalPhone)(record, undefined, { fields: {}, shouldUseNativeValidation: false });

  it('ignores invalid data saved in other sections', async () => {
    const result = await resolve('contact', { ...blank, phone: '(31) 99999-8888', cpf: '111.111.111-11' });
    expect(result.errors).toEqual({});
  });

  it('blocks the save when a field of the section is invalid', async () => {
    const result = await resolve('personal', { ...blank, cpf: '111.111.111-11' });
    expect(Object.keys(result.errors)).toEqual(['cpf']);
  });

  it('asks for the phone unless the person came from the membership signup', async () => {
    expect(Object.keys((await resolve('contact', blank)).errors)).toEqual(['phone']);
    expect((await resolve('contact', blank, true)).errors).toEqual({});
  });

  it('summarizes the address in a few lines, skipping what is empty', () => {
    const address = {
      ...blank,
      addressZip: '30550300',
      addressStreet: 'Rua Dias de Carvalho',
      addressNumber: '103',
      addressComplement: 'Casa',
      addressNeighborhood: 'Salgado Filho',
      addressCity: 'Belo Horizonte',
      addressState: 'MG',
    };
    expect(addressLines(address)).toEqual([
      'Rua Dias de Carvalho, 103 – Casa',
      'Salgado Filho · Belo Horizonte/MG',
      'CEP 30550-300',
    ]);
    expect(addressLines({ ...blank, addressCity: 'Contagem', addressReference: 'Perto da praça' })).toEqual([
      'Contagem',
      'Referência: Perto da praça',
    ]);
    expect(addressLines(blank)).toEqual([]);
  });
});
