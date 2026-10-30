// Libs
import { z } from 'zod';
import { text } from 'bp-kit';
// Components
import { CommunityRequirements } from '../../../domain/membershipCommunity';

export const createVisitorSchema = z.object({
  name: z.string().min(1, text.validation.required('o nome')),
  phone: z.string().min(8, text.validation.required('um telefone válido')),
  age: z.string().optional(),
  email: z.union([z.string().email(text.validation.emailInvalid), z.literal('')]).optional(),
});

export type CreateVisitorFormValues = z.infer<typeof createVisitorSchema>;

export const contactAttemptSchema = z.object({
  result: z.enum(['accepted', 'declined', 'no_response']),
});

export type ContactAttemptFormValues = z.infer<typeof contactAttemptSchema>;

export function buildCommunitySchema({ smallGroupRequired, ministryRequired }: CommunityRequirements) {
  return z.object({
    smallGroupId: smallGroupRequired ? z.string().min(1, text.validation.selectRequired('o Pequeno Grupo')) : z.string(),
    ministryId: ministryRequired ? z.string().min(1, text.validation.selectRequired('o ministério')) : z.string(),
  });
}

export type CommunityFormValues = z.infer<ReturnType<typeof buildCommunitySchema>>;
