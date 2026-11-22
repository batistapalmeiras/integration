// React
import { useEffect, useRef, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
// Libs
import { Button, onlyDigits, useAuthCtx, useToast, ModalTitle } from 'bp-kit';
import { Save } from 'lucide-react';
// Local
import { reactivatePerson } from '../../../features/visitors';
import { invalidateQueries, markPipelineStale } from '../../../lib/queryCache';
import { queryKeys } from '../../../lib/queryKeys';
import { findPersonByPhone } from '../../../repositories/people';
import { AppRoute } from '../../../routes/paths';
import { useCreatePerson } from '../hooks/useCreatePerson';
import { CreateVisitorFormValues, createVisitorSchema } from '../validators';
import { VisitorForm, VisitorFormActions } from '../components/VisitorForm';
import { ExistingPersonModal } from './components/ExistingPersonModal';
import { Intro } from './styles';

const MIN_PHONE_DIGITS = 10;
const PHONE_LOOKUP_DEBOUNCE_MS = 400;

type ExistingPerson = NonNullable<Awaited<ReturnType<typeof findPersonByPhone>>>;

interface Props {
  close: () => void;
}

export function NewVisitorModal({ close }: Props) {
  const navigate = useNavigate();
  const { user } = useAuthCtx();
  const { createPerson } = useCreatePerson();
  const { show: showToast, toast } = useToast();
  const [existing, setExisting] = useState<ExistingPerson | null>(null);
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
    const digits = onlyDigits(phone ?? '');
    if (digits.length < MIN_PHONE_DIGITS || digits === checkedPhone.current) return;

    const timeout = setTimeout(() => {
      checkedPhone.current = digits;
      findPersonByPhone(digits).then((person) => person && setExisting(person));
    }, PHONE_LOOKUP_DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [phone]);

  const openProfile = (personId: string) => {
    close();
    navigate(`${AppRoute.Visitors}/${personId}`);
  };

  const submit = handleSubmit(async (values) => {
    try {
      await createPerson(values);
      await markPipelineStale();
      await invalidateQueries(queryKeys.visitors);
      close();
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Não foi possível salvar.');
    }
  });

  if (existing) {
    return (
      <ExistingPersonModal
        person={existing}
        close={() => setExisting(null)}
        onOpen={() => openProfile(existing.id)}
        onReactivate={async () => {
          await reactivatePerson(existing, user?.id);
          openProfile(existing.id);
        }}
      />
    );
  }

  return (
    <>
      <ModalTitle onClose={close}>Novo visitante</ModalTitle>
      <Intro type="p">Informe os dados de contato de quem visitou a igreja.</Intro>

      <VisitorForm control={control} onSubmit={submit}>
        <VisitorFormActions>
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
        </VisitorFormActions>
      </VisitorForm>
      {toast}
    </>
  );
}
