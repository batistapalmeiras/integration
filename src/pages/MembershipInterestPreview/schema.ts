// Libs
import { isCompletePhone, isSamePhone, isValidCpf, onlyDigits, text } from 'bp-kit';
import { z } from 'zod';
// Local
import { parseTypedDate, todayKey } from '../../domain/dates';
import { MaritalStatusOption } from '../../domain/memberRecords';

export type MembershipFormValues = {
  name: string;
  gender: 'male' | 'female' | '';
  cpf: string;
  birthDate: string;
  maritalStatus: MaritalStatusOption | '';
  motherName: string;
  fatherName: string;
  email: string;
  otherPhone: string;
  zip: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  entryType: 'baptism' | 'transfer_letter' | 'acclamation' | 'reconciliation' | '';
  baptismChurch: string;
  baptismDate: string;
  lastChurch: string;
  statuteAgreed: boolean;
  ministryInterests: string[];
  noMinistryInterest: boolean;
  wantsSmallGroup: 'yes' | 'not_now' | 'already' | '';
  smallGroupId: string;
  secretSociety: 'yes' | 'no' | '';
  secretSocietyName: string;
  membershipNote: string;
};

export const EMPTY_MEMBERSHIP_FORM: MembershipFormValues = {
  name: '',
  gender: '',
  cpf: '',
  birthDate: '',
  maritalStatus: '',
  motherName: '',
  fatherName: '',
  email: '',
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
  lastChurch: '',
  statuteAgreed: false,
  ministryInterests: [],
  noMinistryInterest: false,
  wantsSmallGroup: '',
  smallGroupId: '',
  secretSociety: '',
  secretSocietyName: '',
  membershipNote: '',
};

export const ENFORCE_REQUIRED = true;

const required = (what: string) =>
  z.string().refine((value) => !ENFORCE_REQUIRED || value.trim() !== '', text.validation.required(what));
const whenFilled = (check: (value: string) => boolean) => (value: string) => value.trim() === '' || check(value);
const choice = <T extends string>(values: readonly [T, ...T[]], message: string) =>
  z
    .string()
    .refine((value) => (!ENFORCE_REQUIRED && value === '') || (values as readonly string[]).includes(value), message);

function pastDate(value: string): boolean {
  const key = parseTypedDate(value);
  return !!key && key >= '1900-01-01' && key <= todayKey();
}

const personalSchema = z.object({
  name: required('seu nome completo').refine(
    whenFilled((value) => value.trim().split(/\s+/).length >= 2),
    'Informe seu nome completo, com sobrenome',
  ),
  gender: choice(['male', 'female'], 'Selecione o sexo'),
  cpf: required('seu CPF').refine(whenFilled(isValidCpf), text.validation.cpfInvalid),
  birthDate: required('sua data de nascimento').refine(
    whenFilled(pastDate),
    'Data inválida. Use o formato dd/mm/aaaa.',
  ),
  maritalStatus: choice(['single', 'married', 'divorced', 'widowed', 'stable_union'], 'Selecione o estado civil'),
  motherName: z.string(),
  fatherName: z.string(),
});

function addressSchema(identificationPhone: string) {
  return z.object({
    email: required('seu e-mail').refine(
      whenFilled((value) => z.string().email().safeParse(value.trim()).success),
      text.validation.emailInvalid,
    ),
    otherPhone: z
      .string()
      .refine((value) => value === '' || isCompletePhone(value), text.validation.phoneIncomplete)
      .refine(
        (value) => !isSamePhone(value, identificationPhone),
        'Informe um número diferente do que você usou para entrar',
      ),
    zip: required('o CEP').refine(
      whenFilled((value) => onlyDigits(value).length === 8),
      'O CEP tem 8 dígitos',
    ),
    street: required('a rua'),
    number: required('o número'),
    complement: z.string(),
    neighborhood: required('o bairro'),
    city: required('a cidade'),
    state: required('o estado').refine(
      whenFilled((value) => /^[A-Za-z]{2}$/.test(value.trim())),
      'Use a sigla, ex.: MG',
    ),
  });
}

const journeySchema = z.object({
  entryType: choice(['baptism', 'transfer_letter', 'acclamation', 'reconciliation'], 'Selecione uma das formas'),
  baptismChurch: z.string(),
  baptismDate: z.string().refine(whenFilled(pastDate), 'Data inválida. Use o formato dd/mm/aaaa.'),
  lastChurch: required('o nome da igreja'),
});

const statuteSchema = z.object({
  statuteAgreed: z
    .boolean()
    .refine((agreed) => !ENFORCE_REQUIRED || agreed, 'É necessário concordar com o Estatuto para continuar.'),
});

const serveSchema = z
  .object({
    ministryInterests: z.array(z.string()),
    noMinistryInterest: z.boolean(),
    wantsSmallGroup: choice(['yes', 'not_now', 'already'], 'Selecione uma opção'),
    smallGroupId: z.string(),
    secretSociety: choice(['yes', 'no'], 'Selecione uma opção'),
    secretSocietyName: z.string(),
    membershipNote: z.string(),
  })
  .refine((values) => values.ministryInterests.length <= 3, {
    message: 'Selecione no máximo 3 ministérios',
    path: ['ministryInterests'],
    when: () => true,
  })
  .refine((values) => !ENFORCE_REQUIRED || values.noMinistryInterest || values.ministryInterests.length > 0, {
    message: 'Selecione ao menos 1 ministério, ou marque que não deseja servir agora',
    path: ['ministryInterests'],
    when: () => true,
  })
  .refine((values) => !ENFORCE_REQUIRED || values.wantsSmallGroup !== 'already' || values.smallGroupId !== '', {
    message: 'Selecione o PG que você frequenta',
    path: ['smallGroupId'],
    when: () => true,
  })
  .refine((values) => !ENFORCE_REQUIRED || values.secretSociety !== 'yes' || values.secretSocietyName.trim() !== '', {
    message: 'Conte qual é',
    path: ['secretSocietyName'],
    when: () => true,
  });

type StepSchema = z.ZodType<Record<string, unknown>, Record<string, unknown>>;

export function stepSchemas(identificationPhone: string): StepSchema[] {
  return [personalSchema, addressSchema(identificationPhone), journeySchema, statuteSchema, serveSchema];
}
