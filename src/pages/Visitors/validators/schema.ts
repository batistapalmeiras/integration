// Libs
import { z } from 'zod';

export const createVisitorSchema = z.object({
  name: z.string().min(1, 'Informe o nome'),
  phone: z.string().min(8, 'Informe um telefone válido'),
  age: z.string().optional(),
  email: z.union([z.string().email('E-mail inválido'), z.literal('')]).optional(),
});

export type CreateVisitorFormValues = z.infer<typeof createVisitorSchema>;

export const contactAttemptSchema = z.object({
  channel: z.enum(['video', 'audio', 'text']),
  result: z.enum(['accepted', 'declined', 'no_response']),
  note: z.string().optional(),
});

export type ContactAttemptFormValues = z.infer<typeof contactAttemptSchema>;
