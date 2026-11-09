// React
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
// Libs
import { Button, isCompletePhone, maskPhone, text, Typography } from 'bp-kit';
import { z } from 'zod';
// Local
import { Form } from '../../../components/PublicPage/styles';
import { TeamContactError } from '../../../components/PublicPage/TeamContactError';
import { NotYouLink, useKnownVisitor, VisitorPhoneField } from '../../../components/PublicPage/VisitorPhoneField';
import { MembershipInterestCheck } from '../../../repositories/publicForms';
import { useCheckPhone } from '../hooks/useCheckPhone';

const identificationSchema = z.object({
  phone: z.string().refine(isCompletePhone, text.validation.required('um WhatsApp válido')),
});

interface Props {
  onFound: (phone: string, check: MembershipInterestCheck) => void;
}

export function IdentificationStep({ onFound }: Props) {
  const { known, forget } = useKnownVisitor();
  const { control, handleSubmit, setValue } = useForm<z.infer<typeof identificationSchema>>({
    resolver: zodResolver(identificationSchema),
    defaultValues: { phone: known ? maskPhone(known.phone) : '' },
  });
  const { check, checking, error } = useCheckPhone();

  const onSubmit = handleSubmit(async ({ phone }) => {
    const result = await check(phone);
    if (result) onFound(phone, result);
  });

  return (
    <Form onSubmit={onSubmit}>
      <Typography type="p">
        Louvamos a Deus por seu interesse em se tornar membro da Batista Palmeiras. Esta ficha existe para que você
        demonstre seu desejo de fazer parte da nossa família. Ela será analisada e aprovada pelo nosso Conselho
        Administrativo.
      </Typography>
      <VisitorPhoneField
        control={control}
        known={known}
        prompt="Para começar, digite o número de WhatsApp que você usou na inscrição da Integração. É por ele que a gente encontra o seu cadastro."
        knownPrompt="Que bom ter você de volta! Toque em Começar para preencher sua ficha."
      />
      {error && <TeamContactError message={error} stage="class" />}
      <Button type="submit" variant="primary" size="lg" fullWidth disabled={checking}>
        {checking ? 'Verificando...' : 'Começar'}
      </Button>
      {known && (
        <NotYouLink
          onClick={() => {
            forget();
            setValue('phone', '');
          }}
        />
      )}
    </Form>
  );
}
