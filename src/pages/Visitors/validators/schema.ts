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
    smallGroupIds: smallGroupRequired
      ? z.array(z.string()).min(1, text.validation.selectRequired('o Pequeno Grupo'))
      : z.array(z.string()),
    ministryIds: ministryRequired
      ? z.array(z.string()).min(1, text.validation.selectRequired('pelo menos um ministério'))
      : z.array(z.string()),
  });
}

export type CommunityFormValues = z.infer<ReturnType<typeof buildCommunitySchema>>;
