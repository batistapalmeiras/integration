// Libs
import { z } from 'zod';
import { text } from 'bp-kit';

export const phoneStepSchema = z.object({
  phone: z.string().min(8, text.validation.required('um WhatsApp válido')),
});

export type PhoneStepFormValues = z.infer<typeof phoneStepSchema>;

export const signupFormSchema = z.object({
  name: z.string().min(1, text.validation.required('o nome completo')),
  attendingSince: z.string().min(1, text.validation.required('desde quando você frequenta a igreja')),
  previousChurch: z.string().min(1, text.validation.required('a igreja ou comunidade anterior')),
  baptismInfo: z.string().min(1, text.validation.required('se você é batizado e onde')),
  conversionTestimony: z.string().min(1, text.validation.required('sua experiência de conversão')),
  maritalStatusStory: z.string().min(1, text.validation.required('seu estado civil')),
});

export type SignupFormValues = z.infer<typeof signupFormSchema>;
