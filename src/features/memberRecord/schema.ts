// Libs
import { isCompletePhone, isSamePhone, isValidCpf, text } from 'bp-kit';
import { z } from 'zod';
// Local
import { MemberRecord } from '../../domain/memberRecords';

const optional = z.string();

export const memberRecordSchema = (optionalPhone: boolean) =>
  z
    .object({
      name: z.string().trim().min(1, text.validation.required('o nome')),
      phone: z
        .string()
        .refine(
          (value) => (optionalPhone && value === '') || isCompletePhone(value),
          optionalPhone ? text.validation.phoneIncomplete : text.validation.required('o celular'),
        ),
      email: z.union([z.string().email(text.validation.emailInvalid), z.literal('')]),
      membershipStatus: z.enum(['active', 'pending_review', 'inactive', 'transferred', 'removed', 'deceased']),
      birthDate: optional,
      gender: z.enum(['male', 'female', '']),
      maritalStatus: z.enum(['single', 'married', 'widowed', 'divorced', 'stable_union', '']),
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
      fatherName: optional,
      motherName: optional,
      spouseName: optional,
      childrenNames: optional,
      childrenCount: z
        .string()
        .refine((value) => value.trim() === '' || /^\d{1,2}$/.test(value.trim()), 'Informe um número'),
      baptismDate: optional,
      baptismChurch: optional,
      entryType: z.enum(['baptism', 'transfer_letter', 'acclamation', 'reconciliation', '']),
      originChurch: optional,
    })
    .refine((record) => !isSamePhone(record.otherPhone, record.phone), {
      path: ['otherPhone'],
      message: 'Informe um número diferente do celular',
    }) satisfies z.ZodType<MemberRecord>;
