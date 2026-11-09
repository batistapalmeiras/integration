// React
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
// Libs
import { Button, maskPhone } from 'bp-kit';
import { ArrowLeft } from 'lucide-react';
// Local
import { useCheckPhone } from '../hooks/useCheckPhone';
import { ActionBar, Form } from '../../../components/PublicPage/styles';
import { TeamContactError } from '../../../components/PublicPage/TeamContactError';
import { NotYouLink, useKnownVisitor, VisitorPhoneField } from '../../../components/PublicPage/VisitorPhoneField';
import { PhoneStepFormValues, phoneStepSchema } from '../validators/schema';

interface Props {
  onFound: (phone: string, name: string) => void;
  onBack: () => void;
}

export function PhoneStep({ onFound, onBack }: Props) {
  const { known, forget } = useKnownVisitor();
  const { control, handleSubmit, setValue } = useForm<PhoneStepFormValues>({
    resolver: zodResolver(phoneStepSchema),
    defaultValues: { phone: known ? maskPhone(known.phone) : '' },
  });
  const { check, checking, error } = useCheckPhone();

  const onSubmit = handleSubmit(async ({ phone }) => {
    const name = await check(phone);
    if (name) onFound(phone, name);
  });

  return (
    <Form onSubmit={onSubmit}>
      <VisitorPhoneField
        control={control}
        known={known}
        prompt="Para começar, digite o número de WhatsApp que você usou no café de boas-vindas."
        knownPrompt="Que bom ter você de volta! Toque em Continuar para seguir com sua inscrição."
      />

      {error && <TeamContactError message={error} />}

      <ActionBar>
        <Button type="button" variant="secondary" size="lg" onClick={onBack}>
          <ArrowLeft size={16} />
          Voltar
        </Button>
        <Button type="submit" variant="primary" size="lg" disabled={checking}>
          {checking ? 'Verificando...' : 'Continuar'}
        </Button>
      </ActionBar>
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
