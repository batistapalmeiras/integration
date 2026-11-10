// Libs
import { formatCPF, maskCEP, maskPhone } from 'bp-kit';
// Local
import { GENDER_LABELS, MARITAL_STATUS_LABELS } from '../../domain/memberRecords';
import { readBaptismAnswer, readMaritalStatusAnswer } from '../../domain/signupAnswers';
import { YES_NO_LABELS } from '../../domain/text';
import { MembershipFormAnswers, MembershipInterestCheck } from '../../repositories/publicForms';
import { ENTRY_TYPE_LABELS, WANTS_SMALL_GROUP_LABELS } from '../../types/church';
import { EMPTY_MEMBERSHIP_FORM, MembershipFormValues } from './schema';

function knownKey<K extends string>(labels: Record<K, string>, value: string): K | '' {
  return (Object.keys(labels) as K[]).find((key) => key === value) ?? '';
}

function isNegative(answer: string): boolean {
  const normalized = answer
    .trim()
    .toLowerCase()
    .replace(/[.!]+$/, '');
  return normalized === 'não' || normalized === 'nao';
}

export function prefilledForm(phone: string, { name, saved }: MembershipInterestCheck): MembershipFormValues {
  const baptism = readBaptismAnswer(saved.baptismInfo);
  const secretSociety = saved.secretSociety.trim();
  const smallGroupChoice = knownKey(WANTS_SMALL_GROUP_LABELS, saved.wantsSmallGroup);

  return {
    ...EMPTY_MEMBERSHIP_FORM,
    name,
    gender: knownKey(GENDER_LABELS, saved.gender),
    cpf: saved.cpf && formatCPF(saved.cpf),
    birthDate: saved.birthDate,
    maritalStatus:
      knownKey(MARITAL_STATUS_LABELS, saved.maritalStatus) || readMaritalStatusAnswer(saved.maritalStatusStory),
    motherName: saved.motherName,
    fatherName: saved.fatherName,
    phone,
    email: saved.email,
    otherPhone: saved.otherPhone && maskPhone(saved.otherPhone),
    zip: saved.zip && maskCEP(saved.zip),
    street: saved.street,
    number: saved.number,
    complement: saved.complement,
    neighborhood: saved.neighborhood,
    city: saved.city,
    state: saved.state,
    entryType: knownKey(ENTRY_TYPE_LABELS, saved.entryType) || (baptism.baptized === 'no' ? 'baptism' : ''),
    baptismChurch: saved.baptismChurch || baptism.church,
    baptismDate: saved.baptismDate,
    lastChurch: saved.originChurch || saved.previousChurch,
    wantsToServe: saved.ministryInterests.length > 0 ? 'yes' : '',
    ministryInterests: saved.ministryInterests,
    wantsSmallGroup: smallGroupChoice || (saved.smallGroupId ? 'already' : ''),
    smallGroupId: saved.smallGroupId,
    secretSociety: secretSociety === '' ? '' : isNegative(secretSociety) ? 'no' : 'yes',
    secretSocietyName: secretSociety !== '' && !isNegative(secretSociety) ? secretSociety : '',
    membershipNote: saved.membershipNote,
  };
}

export function toMembershipFormAnswers(values: MembershipFormValues): MembershipFormAnswers {
  const baptizedElsewhere = values.entryType !== 'baptism';
  return {
    name: values.name,
    gender: values.gender,
    cpf: values.cpf,
    birthDate: values.birthDate,
    maritalStatus: values.maritalStatus,
    motherName: values.motherName,
    fatherName: values.fatherName,
    phone: values.phone,
    email: values.email,
    otherPhone: values.otherPhone,
    zip: values.zip,
    street: values.street,
    number: values.number,
    complement: values.complement,
    neighborhood: values.neighborhood,
    city: values.city,
    state: values.state,
    entryType: values.entryType,
    baptismChurch: baptizedElsewhere ? values.baptismChurch : '',
    baptismDate: baptizedElsewhere && values.baptismDate ? values.baptismDate : null,
    lastChurch: values.lastChurch,
    ministryInterests: values.wantsToServe === 'yes' ? values.ministryInterests : [],
    wantsSmallGroup: values.wantsSmallGroup,
    smallGroupId: values.wantsSmallGroup === 'already' ? values.smallGroupId : null,
    secretSociety: values.secretSociety === 'yes' ? values.secretSocietyName.trim() : YES_NO_LABELS.no,
    membershipNote: values.membershipNote,
  };
}
