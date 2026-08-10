// React
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
// Libs
import { Button, Textarea, TextInput } from 'bp-kit';
// Local
import { ErrorMsg, Form } from '../styles';
import { SignupFormValues, signupFormSchema } from '../validators/schema';

interface Props {
  name: string;
  submitting: boolean;
  error: string | null;
  onSubmit: (values: SignupFormValues) => void;
}

export function SignupFormStep({ name, submitting, error, onSubmit }: Props) {
  const { control, handleSubmit } = useForm<SignupFormValues>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: { name },
  });

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <TextInput label="Nome completo" control={control} name="name" placeholder="Nome completo" />
      <TextInput label="Desde quando você frequenta a nossa igreja?" control={control} name="attendingSince" />
      <TextInput label="Você veio de qual igreja ou comunidade religiosa?" control={control} name="previousChurch" />
      <Textarea
        label="Você é batizado? Em qual igreja ou comunidade religiosa?"
        control={control}
        name="baptismInfo"
        rows={3}
      />
      <Textarea
        label="Nos conte como foi sua experiência de conversão. Pode ser com detalhes."
        control={control}
        name="conversionTestimony"
        rows={4}
      />
      <Textarea
        label="Qual seu estado civil? Nos conte um pouco a história do seu relacionamento, caso haja."
        control={control}
        name="maritalStatusStory"
        rows={4}
      />

      {error && <ErrorMsg>{error}</ErrorMsg>}

      <Button type="submit" variant="primary" size="lg" fullWidth disabled={submitting}>
        {submitting ? 'Enviando...' : 'Confirmar inscrição'}
      </Button>
    </Form>
  );
}
