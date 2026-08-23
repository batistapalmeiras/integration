// Libs
import { z } from 'zod';

export const makeupAttendanceSchema = z.object({
  declaration: z.literal(true, 'Confirme que você assistiu a aula até o final.'),
  notes: z.string().optional(),
});

export type MakeupAttendanceFormValues = z.infer<typeof makeupAttendanceSchema>;
