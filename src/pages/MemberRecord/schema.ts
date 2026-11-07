// Libs
import { text } from 'bp-kit';
import { z } from 'zod';
// Local
import { MemberRecord } from '../../domain/memberRecords';
import { INCOMPLETE_PHONE_MESSAGE, isCompletePhone, isSamePhone } from '../../domain/phone';

const optional = z.string();

export const memberRecordSchema = z.object({
  name: z.string().trim().min(1, text.validation.required('o nome')),
  phone: z.string().refine((value) => value === '' || value.replace(/\D/g, '').length >= 10, 'Telefone incompleto'),
  email: z.union([z.string().email(text.validation.emailInvalid), z.literal('')]),
  membershipStatus: z.enum(['active', 'pending_review', 'inactive', 'transferred', 'removed', 'deceased']),
  birthDate: optional,
  gender: z.enum(['male', 'female', '']),
  maritalStatus: z.enum(['single', 'married', 'widowed', 'divorced', '']),
  nationality: optional,
  otherPhone: z.string().refine((value) => value === '' || isCompletePhone(value), INCOMPLETE_PHONE_MESSAGE),
  addressZip: optional,
  addressStreet: optional,
  addressNumber: optional,
  addressComplement: optional,
  addressNeighborhood: optional,
  addressCity: optional,
  addressState: optional,
  addressReference: optional,
  cpf: z.string().refine((value) => value === '' || value.replace(/\D/g, '').length === 11, 'O CPF tem 11 dígitos'),
  rg: optional,
})
  .refine((record) => !isSamePhone(record.otherPhone, record.phone), {
    path: ['otherPhone'],
    message: 'Informe um número diferente do celular',
  }) satisfies z.ZodType<MemberRecord>;
