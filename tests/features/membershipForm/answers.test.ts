// Local
import { prefilledForm, toMembershipFormAnswers } from '../../../src/features/membershipForm/answers';
import { stepSchemas } from '../../../src/features/membershipForm/schema';
import { MembershipInterestCheck, SavedMembershipAnswers } from '../../../src/repositories/publicForms';

const PHONE = '(31) 99999-8888';

const nothingSaved: SavedMembershipAnswers = {
  email: '',
  birthDate: '',
  gender: '',
  cpf: '',
  maritalStatus: '',
  motherName: '',
  fatherName: '',
  otherPhone: '',
  zip: '',
  street: '',
  number: '',
  complement: '',
  neighborhood: '',
  city: '',
  state: '',
  entryType: '',
  baptismChurch: '',
  baptismDate: '',
  originChurch: '',
  previousChurch: '',
  baptismInfo: '',
  maritalStatusStory: '',
  ministryInterests: [],
  wantsSmallGroup: '',
  smallGroupId: '',
  secretSociety: '',
  membershipNote: '',
};

const check = (saved: Partial<SavedMembershipAnswers>): MembershipInterestCheck => ({
  name: 'Ana Lima',
  alreadySubmitted: false,
  lessonsAttended: 4,
  lessonsTotal: 4,
  saved: { ...nothingSaved, ...saved },
});

describe('prefilledForm', () => {
  it('fills from the integration signup answers', () => {
    const form = prefilledForm(
      PHONE,
      check({
        previousChurch: 'Igreja Batista Central',
        baptismInfo: 'Sim — Primeira Igreja Batista',
        maritalStatusStory: 'Casado(a) — Casados há 5 anos.',
      }),
    );
    expect(form).toMatchObject({
      name: 'Ana Lima',
      phone: PHONE,
      lastChurch: 'Igreja Batista Central',
      baptismChurch: 'Primeira Igreja Batista',
      maritalStatus: 'married',
      entryType: '',
      statuteAgreed: false,
    });
  });

  it('suggests membership by baptism to who said they are not baptized', () => {
    expect(prefilledForm(PHONE, check({ baptismInfo: 'Não' })).entryType).toBe('baptism');
  });

  it('prefers the member record over the signup answers', () => {
    const form = prefilledForm(
      PHONE,
      check({
        maritalStatus: 'widowed',
        maritalStatusStory: 'Casado(a)',
        baptismChurch: 'Igreja Batista Bela Vista',
        baptismInfo: 'Sim — Outra igreja',
        originChurch: 'Igreja de origem',
        previousChurch: 'Igreja anterior',
        cpf: '52998224725',
        otherPhone: '31988887777',
        zip: '30140071',
      }),
    );
    expect(form).toMatchObject({
      maritalStatus: 'widowed',
      baptismChurch: 'Igreja Batista Bela Vista',
      lastChurch: 'Igreja de origem',
      cpf: '529.982.247-25',
      otherPhone: '(31) 98888-7777',
      zip: '30140-071',
    });
  });

  it('reads the secret society and small group answers', () => {
    expect(prefilledForm(PHONE, check({ secretSociety: 'Não ' }))).toMatchObject({
      secretSociety: 'no',
      secretSocietyName: '',
    });
    expect(prefilledForm(PHONE, check({ secretSociety: 'Maçonaria' }))).toMatchObject({
      secretSociety: 'yes',
      secretSocietyName: 'Maçonaria',
    });
    expect(prefilledForm(PHONE, check({ smallGroupId: 'pg-1' }))).toMatchObject({
      wantsSmallGroup: 'already',
      smallGroupId: 'pg-1',
    });
  });
});

describe('toMembershipFormAnswers', () => {
  const filled = { ...prefilledForm(PHONE, check({})), entryType: 'transfer_letter' as const, baptismChurch: 'IBC' };

  it('drops what the chosen answers hide', () => {
    const answers = toMembershipFormAnswers({
      ...filled,
      entryType: 'baptism',
      baptismDate: '2001-05-06',
      ministryInterests: ['Louvor'],
      wantsToServe: 'no',
      wantsSmallGroup: 'yes',
      smallGroupId: 'pg-1',
      secretSociety: 'no',
      secretSocietyName: 'Maçonaria',
    });
    expect(answers).toMatchObject({
      baptismChurch: '',
      baptismDate: null,
      ministryInterests: [],
      smallGroupId: null,
      secretSociety: 'Não',
    });
  });

  it('keeps the details of the answers that ask for them', () => {
    const answers = toMembershipFormAnswers({
      ...filled,
      wantsSmallGroup: 'already',
      smallGroupId: 'pg-1',
      secretSociety: 'yes',
      secretSocietyName: ' Maçonaria ',
    });
    expect(answers).toMatchObject({ baptismChurch: 'IBC', smallGroupId: 'pg-1', secretSociety: 'Maçonaria' });
  });
});

describe('contact step', () => {
  const valid = {
    phone: '(31) 99999-8888',
    email: 'ana@exemplo.com',
    otherPhone: '',
    zip: '30140-071',
    street: 'Rua A',
    number: '10',
    complement: '',
    neighborhood: 'Centro',
    city: 'Belo Horizonte',
    state: 'MG',
  };
  const signupContact = stepSchemas(true)[1];
  const classContact = stepSchemas(false)[1];

  it('lets only the CPF signup leave the phone empty', () => {
    expect(signupContact.safeParse({ ...valid, phone: '' }).success).toBe(true);
    expect(classContact.safeParse({ ...valid, phone: '' }).success).toBe(false);
  });

  it('wants a complete phone when one is given', () => {
    expect(signupContact.safeParse(valid).success).toBe(true);
    expect(signupContact.safeParse({ ...valid, phone: '(31) 9999' }).success).toBe(false);
  });

  it('wants the other phone to differ from the phone', () => {
    const result = signupContact.safeParse({ ...valid, otherPhone: '31999998888' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(['otherPhone']);
  });
});
