// Libs
import { z } from 'zod';
import { text } from 'bp-kit';
// Local
import { UserRole } from '../../types/enums';

export const addVolunteerSchema = z.object({
  personId: z.string().min(1, text.validation.selectRequired('o membro')),
  role: z.nativeEnum(UserRole, { message: text.validation.selectRequired('o cargo') }),
});

export type AddVolunteerFormValues = z.infer<typeof addVolunteerSchema>;
