// React
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
// Libs
import { Button, text, TextInput, Typography } from 'bp-kit';
import { z } from 'zod';
// Local
import { PHONE_PLACEHOLDER } from '../../../domain/text';
import { ErrorMsg, Form } from '../../../components/PublicPage/styles';
import { useCheckPhone } from '../hooks/useCheckPhone';

const phoneStepSchema = z.object({
  phone: z.string().min(8, text.validation.required('um WhatsApp válido')),
});
type PhoneStepFormValues = z.infer<typeof phoneStepSchema>;

interface Props {
  onFound: (phone: string, name: string, alreadySubmitted: boolean) => void;
}

export function PhoneStep({ onFound }: Props) {
  const { control, handleSubmit } = useForm<PhoneStepFormValues>({
    resolver: zodResolver(phoneStepSchema),
    defaultValues: { phone: '' },
  });
  const { check, checking, error } = useCheckPhone();

  const onSubmit = handleSubmit(async ({ phone }) => {
    const result = await check(phone);
    if (result) onFound(phone, result.name, result.alreadySubmitted);
  });

  return (
    <Form onSubmit={onSubmit}>
      <Typography type="p">
        Para começar, digite o número de WhatsApp que você usou no cadastro — usamos ele pra confirmar que você já
        concluiu as 4 aulas de Integração.
      </Typography>

      <TextInput
        label={text.fields.phone}
        control={control}
        name="phone"
        mask="phone"
        inputMode="numeric"
        placeholder={PHONE_PLACEHOLDER}
        autoFocus
      />

      {error && <ErrorMsg>{error}</ErrorMsg>}

      <Button type="submit" variant="primary" size="lg" fullWidth disabled={checking}>
        {checking ? 'Verificando...' : 'Continuar'}
      </Button>
    </Form>
  );
}
