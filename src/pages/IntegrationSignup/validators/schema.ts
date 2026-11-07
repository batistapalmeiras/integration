// Libs
import { z } from 'zod';
import { text } from 'bp-kit';
// Local
import { MARITAL_STATUS_OPTION_LABELS, MaritalStatusOption } from '../../../domain/memberRecords';
import { YES_NO_LABELS, YesNo } from '../../../domain/text';

export const phoneStepSchema = z.object({
  phone: z.string().min(8, text.validation.required('um WhatsApp válido')),
});

export type PhoneStepFormValues = z.infer<typeof phoneStepSchema>;

export interface SignupFormValues {
  name: string;
  baptized: YesNo | '';
  baptismChurch: string;
  previousChurch: string;
  conversionTestimony: string;
  maritalStatus: MaritalStatusOption | '';
  maritalStatusStory: string;
}

const filled = (value: string) => value.trim() !== '';

const choice = (labels: Record<string, string>, message: string) =>
  z.string().refine((value) => value in labels, message);

export const signupFormSchema = z
  .object({
    name: z.string().min(1, text.validation.required('o nome completo')),
    baptized: choice(YES_NO_LABELS, 'Selecione uma opção'),
    baptismChurch: z.string(),
    previousChurch: z.string().refine(filled, text.validation.required('a igreja que você frequentava')),
    conversionTestimony: z.string().min(1, text.validation.required('sua experiência de conversão')),
    maritalStatus: choice(MARITAL_STATUS_OPTION_LABELS, 'Selecione o estado civil'),
    maritalStatusStory: z.string(),
  })
  .refine((values) => values.baptized !== 'yes' || filled(values.baptismChurch), {
    message: text.validation.required('a igreja onde você foi batizado(a)'),
    path: ['baptismChurch'],
    when: () => true,
  })
  .refine(
    (values) => values.maritalStatus === '' || values.maritalStatus === 'single' || filled(values.maritalStatusStory),
    {
      message: text.validation.required('a história do seu relacionamento'),
      path: ['maritalStatusStory'],
      when: () => true,
    },
  );

interface SignupAnswers {
  previousChurch: string;
  baptismInfo: string;
  conversionTestimony: string;
  maritalStatusStory: string;
}

const withDetail = (label: string, detail: string) => (filled(detail) ? `${label} — ${detail.trim()}` : label);

export function toSignupAnswers(values: SignupFormValues): SignupAnswers {
  return {
    previousChurch: values.previousChurch.trim(),
    baptismInfo:
      values.baptized === 'yes'
        ? withDetail(YES_NO_LABELS.yes, values.baptismChurch)
        : values.baptized === 'no'
          ? YES_NO_LABELS.no
          : '',
    conversionTestimony: values.conversionTestimony.trim(),
    maritalStatusStory: values.maritalStatus
      ? withDetail(MARITAL_STATUS_OPTION_LABELS[values.maritalStatus], values.maritalStatusStory)
      : '',
  };
}
