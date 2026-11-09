// Local
import { prefilledForm, toMembershipFormAnswers } from '../../../src/pages/MembershipInterest/answers';
import { MembershipInterestCheck, SavedMembershipAnswers } from '../../../src/repositories/publicForms';

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
      check({
        previousChurch: 'Igreja Batista Central',
        baptismInfo: 'Sim — Primeira Igreja Batista',
        maritalStatusStory: 'Casado(a) — Casados há 5 anos.',
      }),
    );
    expect(form).toMatchObject({
      name: 'Ana Lima',
      lastChurch: 'Igreja Batista Central',
      baptismChurch: 'Primeira Igreja Batista',
      maritalStatus: 'married',
      entryType: '',
      statuteAgreed: false,
    });
  });

  it('suggests membership by baptism to who said they are not baptized', () => {
    expect(prefilledForm(check({ baptismInfo: 'Não' })).entryType).toBe('baptism');
  });

  it('prefers the member record over the signup answers', () => {
    const form = prefilledForm(
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
    expect(prefilledForm(check({ secretSociety: 'Não ' }))).toMatchObject({ secretSociety: 'no', secretSocietyName: '' });
    expect(prefilledForm(check({ secretSociety: 'Maçonaria' }))).toMatchObject({
      secretSociety: 'yes',
      secretSocietyName: 'Maçonaria',
    });
    expect(prefilledForm(check({ smallGroupId: 'pg-1' }))).toMatchObject({
      wantsSmallGroup: 'already',
      smallGroupId: 'pg-1',
    });
  });
});

describe('toMembershipFormAnswers', () => {
  const filled = { ...prefilledForm(check({})), entryType: 'transfer_letter' as const, baptismChurch: 'IBC' };

  it('drops what the chosen answers hide', () => {
    const answers = toMembershipFormAnswers({
      ...filled,
      entryType: 'baptism',
      baptismDate: '2001-05-06',
      ministryInterests: ['Louvor'],
      noMinistryInterest: true,
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
