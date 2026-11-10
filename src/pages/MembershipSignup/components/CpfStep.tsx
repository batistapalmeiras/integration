// React
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
// Libs
import { Button, isValidCpf, text, TextInput, Typography } from 'bp-kit';
import { z } from 'zod';
// Local
import { Form } from '../../../components/PublicPage/styles';
import { TeamContactError } from '../../../components/PublicPage/TeamContactError';
import { errorMessage } from '../../../lib/queryCache';
import { checkMembershipSignupCpf } from '../../../repositories/publicForms';

const cpfSchema = z.object({
  cpf: z.string().refine(isValidCpf, text.validation.cpfInvalid),
});

interface Props {
  initialCpf: string;
  onAvailable: (cpf: string) => void;
}

export function CpfStep({ initialCpf, onAvailable }: Props) {
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { control, handleSubmit } = useForm<z.infer<typeof cpfSchema>>({
    resolver: zodResolver(cpfSchema),
    defaultValues: { cpf: initialCpf },
  });

  const onSubmit = handleSubmit(async ({ cpf }) => {
    setChecking(true);
    setError(null);
    try {
      await checkMembershipSignupCpf(cpf);
      onAvailable(cpf);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setChecking(false);
    }
  });

  return (
    <Form onSubmit={onSubmit}>
      <Typography type="p">
        Louvamos a Deus por seu interesse em se tornar membro da Batista Palmeiras. Esta ficha existe para que você
        demonstre seu desejo de fazer parte da nossa família. Ela será analisada e aprovada pelo nosso Conselho
        Administrativo.
      </Typography>
      <TextInput
        label="Para começar, digite seu CPF"
        control={control}
        name="cpf"
        mask="cpf"
        inputMode="numeric"
        placeholder="000.000.000-00"
        autoFocus
      />
      {error && <TeamContactError message={error} stage="class" />}
      <Button type="submit" variant="primary" size="lg" fullWidth disabled={checking}>
        {checking ? 'Verificando...' : 'Começar'}
      </Button>
    </Form>
  );
}
