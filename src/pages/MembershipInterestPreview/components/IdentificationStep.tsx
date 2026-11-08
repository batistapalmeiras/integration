// React
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
// Libs
import { Button, isCompletePhone, text, TextInput, Typography } from 'bp-kit';
import { z } from 'zod';
// Local
import { Form } from '../../../components/PublicPage/styles';
import { PHONE_PLACEHOLDER } from '../../../domain/text';

const identificationSchema = z.object({
  phone: z.string().refine(isCompletePhone, text.validation.required('um WhatsApp válido')),
});

interface Props {
  onContinue: (phone: string) => void;
}

export function IdentificationStep({ onContinue }: Props) {
  const { control, handleSubmit } = useForm<z.infer<typeof identificationSchema>>({
    resolver: zodResolver(identificationSchema),
    defaultValues: { phone: '' },
  });

  return (
    <Form onSubmit={handleSubmit(({ phone }) => onContinue(phone))}>
      <Typography type="p">
        Louvamos a Deus por seu interesse em se tornar membro da Batista Palmeiras. Esta ficha existe para que você
        demonstre seu desejo de fazer parte da nossa família. Ela será analisada e aprovada pelo nosso Conselho
        Administrativo.
      </Typography>
      <Typography type="p">
        Para começar, digite o número de WhatsApp que você usou na inscrição da Integração. É por ele que a gente
        encontra o seu cadastro.
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
      <Button type="submit" variant="primary" size="lg" fullWidth>
        Começar
      </Button>
    </Form>
  );
}
