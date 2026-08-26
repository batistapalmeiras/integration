// React
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
// Libs
import { Button, Form, PageHeader, TextInput, text, useAuthCtx, useToast } from 'bp-kit';
import { z } from 'zod';
// Local
import { Content } from '../Visitors/Detail/styles';
import { supabase } from '../../lib/supabase';

const schema = z
  .object({
    password: z.string().min(6, text.validation.passwordMin),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: text.validation.passwordMismatch,
    path: ['confirmPassword'],
  });

type FormValues = z.infer<typeof schema>;

interface Props {
  onDone: () => void;
}

export function ForcedChangePasswordPage({ onDone }: Props) {
  const { user, updatePassword } = useAuthCtx();
  const { toast } = useToast();
  const {
    control,
    handleSubmit,
    setError,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const submit = handleSubmit(async (values) => {
    const err = await updatePassword(values.password);
    if (err) {
      setError('password', { message: err });
      return;
    }
    if (user) await supabase.from('profiles').update({ must_change_password: false }).eq('id', user.id);
    onDone();
  });

  return (
    <Content>
      <PageHeader title="Troque sua senha" subtitle="Por segurança, defina uma senha só sua antes de continuar." />
      <Form onSubmit={submit}>
        <TextInput label="Nova senha" control={control} name="password" type="password" placeholder="Mínimo 6 caracteres" />
        <TextInput
          label="Confirmar nova senha"
          control={control}
          name="confirmPassword"
          type="password"
          placeholder="Repita a nova senha"
        />
        <Button type="submit" variant="primary" size="lg" fullWidth disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : 'Salvar e continuar'}
        </Button>
      </Form>
      {toast}
    </Content>
  );
}
