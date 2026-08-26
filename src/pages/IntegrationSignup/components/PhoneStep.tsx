// React
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
// Libs
import { Button, text, TextInput, Typography } from 'bp-kit';
// Local
import { PHONE_PLACEHOLDER } from '../../../domain/text';
import { useCheckPhone } from '../hooks/useCheckPhone';
import { ErrorMsg, Form } from '../../../components/PublicPage/styles';
import { PhoneStepFormValues, phoneStepSchema } from '../validators/schema';

interface Props {
  onFound: (phone: string, name: string) => void;
}

export function PhoneStep({ onFound }: Props) {
  const { control, handleSubmit } = useForm<PhoneStepFormValues>({
    resolver: zodResolver(phoneStepSchema),
    defaultValues: { phone: '' },
  });
  const { check, checking, error } = useCheckPhone();

  const onSubmit = handleSubmit(async ({ phone }) => {
    const name = await check(phone);
    if (name) onFound(phone, name);
  });

  return (
    <Form onSubmit={onSubmit}>
      <Typography type="p">
        Para começar, digite o número de WhatsApp que você usou no café de boas-vindas.
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
