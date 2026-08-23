// Libs
import { z } from 'zod';
import { text } from 'bp-kit';
// Local
import { UserRole } from '../../types/enums';

export const addVolunteerSchema = z.object({
  email: z.string().email(text.validation.emailInvalid),
  name: z.string().min(1, text.validation.required('o nome')),
  role: z.nativeEnum(UserRole, { message: text.validation.selectRequired('o papel') }),
});

export type AddVolunteerFormValues = z.infer<typeof addVolunteerSchema>;
