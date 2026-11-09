// Libs
import { isCompletePhone, isSamePhone, isValidCpf, text } from 'bp-kit';
import { z } from 'zod';
// Local
import { MemberRecord } from '../../domain/memberRecords';

const optional = z.string();

export const memberRecordSchema = z
  .object({
    name: z.string().trim().min(1, text.validation.required('o nome')),
    phone: z.string().refine((value) => value === '' || isCompletePhone(value), text.validation.phoneIncomplete),
    email: z.union([z.string().email(text.validation.emailInvalid), z.literal('')]),
    membershipStatus: z.enum(['active', 'pending_review', 'inactive', 'transferred', 'removed', 'deceased']),
    birthDate: optional,
    gender: z.enum(['male', 'female', '']),
    maritalStatus: z.enum(['single', 'married', 'widowed', 'divorced', '']),
    nationality: optional,
    otherPhone: z.string().refine((value) => value === '' || isCompletePhone(value), text.validation.phoneIncomplete),
    addressZip: optional,
    addressStreet: optional,
    addressNumber: optional,
    addressComplement: optional,
    addressNeighborhood: optional,
    addressCity: optional,
    addressState: optional,
    addressReference: optional,
    cpf: z.string().refine((value) => value === '' || isValidCpf(value), text.validation.cpfInvalid),
    birthplace: optional,
    birthState: z
      .string()
      .refine((value) => value.trim() === '' || /^[A-Za-z]{2}$/.test(value.trim()), 'Use a sigla, ex.: MG'),
    education: optional,
    profession: optional,
    workplace: optional,
    fatherName: optional,
    motherName: optional,
    spouseName: optional,
    weddingDate: optional,
    childrenNames: optional,
    childrenCount: z
      .string()
      .refine((value) => value.trim() === '' || /^\d{1,2}$/.test(value.trim()), 'Informe um número'),
    baptismDate: optional,
    baptismChurch: optional,
  })
  .refine((record) => !isSamePhone(record.otherPhone, record.phone), {
    path: ['otherPhone'],
    message: 'Informe um número diferente do celular',
  }) satisfies z.ZodType<MemberRecord>;
