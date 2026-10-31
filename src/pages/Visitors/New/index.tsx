// React
import { useEffect, useRef } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
// Libs
import { Button, PageHeader, parsePhone, text, TextInput, useAuthCtx, useModal } from 'bp-kit';
import { Save } from 'lucide-react';
// Local
import { PHONE_PLACEHOLDER } from '../../../domain/text';
import { findPersonByPhone, reactivatePerson } from '../../../features/visitors';
import { AppRoute } from '../../../routes/paths';
import { useCreatePerson } from '../hooks';
import { CreateVisitorFormValues, createVisitorSchema } from '../validators';
import { ExistingPersonModal } from './components/ExistingPersonModal';
import { Actions, Form, InlineFields, Intro } from './styles';

const MIN_PHONE_DIGITS = 10;

export function NewVisitorPage() {
  const navigate = useNavigate();
  const { user } = useAuthCtx();
  const { createPerson } = useCreatePerson();
  const { open, close, modal } = useModal('drawer');
  const checkedPhone = useRef('');

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<CreateVisitorFormValues>({
    resolver: zodResolver(createVisitorSchema),
    defaultValues: { name: '', phone: '', age: '', email: '' },
  });

  const phone = useWatch({ control, name: 'phone' });

  useEffect(() => {
    const digits = parsePhone(phone ?? '');
    if (digits.length < MIN_PHONE_DIGITS || digits === checkedPhone.current) return;
    checkedPhone.current = digits;

    findPersonByPhone(digits).then((person) => {
      if (!person) return;
      const profile = `${AppRoute.Visitors}/${person.id}`;
      open(
        <ExistingPersonModal
          person={person}
          close={close}
          onOpen={() => navigate(profile)}
          onReactivate={async () => {
            await reactivatePerson(person, user?.id);
            navigate(profile);
          }}
        />,
      );
    });
  }, [phone, open, close, navigate, user?.id]);

  const submit = handleSubmit(async (values) => {
    await createPerson(values);
    navigate(AppRoute.Visitors);
  });

  return (
    <div>
      <PageHeader title="Novo visitante" back />
      <Intro>Só nome e WhatsApp são obrigatórios. O resto a pessoa completa na inscrição.</Intro>

      <Form onSubmit={submit}>
        <TextInput label="WhatsApp" control={control} name="phone" mask="phone" placeholder={PHONE_PLACEHOLDER} />
        <TextInput label={text.fields.name} control={control} name="name" placeholder={text.fields.fullName} />
        <InlineFields>
          <TextInput label="Idade" control={control} name="age" type="text" inputMode="numeric" placeholder="Idade" />
          <TextInput
            label={text.fields.email}
            control={control}
            name="email"
            type="email"
            placeholder={text.fields.emailPlaceholder}
          />
        </InlineFields>

        <Actions>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? (
              'Salvando...'
            ) : (
              <>
                <Save size={16} />
                Salvar
              </>
            )}
          </Button>
        </Actions>
      </Form>

      {modal}
    </div>
  );
}
