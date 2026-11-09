// React
import { FormEvent, useEffect, useRef, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Resolver, useForm } from 'react-hook-form';
// Libs
import { Button, LinkButton, Skeleton } from 'bp-kit';
import { ArrowLeft, ArrowRight, Send } from 'lucide-react';
// Local
import { PublicPage } from '../../components/PublicPage';
import { ActionBar, Form, PageHeading, PageLead, PageTitle } from '../../components/PublicPage/styles';
import { TeamContactError } from '../../components/PublicPage/TeamContactError';
import { useLatest } from '../../lib/useLatest';
import { clearVisitorIdentity, loadVisitorIdentity, saveVisitorIdentity } from '../../lib/visitorIdentity';
import { MembershipEligibility, MembershipInterestCheck } from '../../repositories/publicForms';
import { prefilledForm } from './answers';
import { AddressStep } from './components/AddressStep';
import { ConfirmationStep } from './components/ConfirmationStep';
import { IdentificationStep } from './components/IdentificationStep';
import { JourneyStep } from './components/JourneyStep';
import { PersonalStep } from './components/PersonalStep';
import { ReviewStep } from './components/ReviewStep';
import { ServeStep } from './components/ServeStep';
import { StatuteStep } from './components/StatuteStep';
import { useCheckPhone } from './hooks/useCheckPhone';
import { usePublicGroups } from './hooks/usePublicGroups';
import { useSubmitMembershipForm } from './hooks/useSubmitMembershipForm';
import { STEP_TITLES } from './options';
import { EMPTY_MEMBERSHIP_FORM, MembershipFormValues, stepSchemas } from './schema';

type Screen = 'checking' | 'identification' | 'ineligible' | number | 'review' | 'done';

const LAST_STEP = STEP_TITLES.length - 1;

export function MembershipInterestPage() {
  const [savedIdentity] = useState(() => loadVisitorIdentity());
  const [screen, setScreen] = useState<Screen>(savedIdentity ? 'checking' : 'identification');
  const [phone, setPhone] = useState('');
  const [eligibility, setEligibility] = useState<MembershipEligibility | null>(null);
  const [readChapters, setReadChapters] = useState<string[]>([]);
  const [returnToReview, setReturnToReview] = useState(false);
  const { ministries, smallGroups, loadError } = usePublicGroups();
  const { check, error: autoCheckError } = useCheckPhone();
  const { submit, submitting, submitError } = useSubmitMembershipForm();

  const stepRef = useRef(0);
  const phoneRef = useLatest(phone);
  const resolver: Resolver<MembershipFormValues> = async (values, context, options) => {
    const stepSchema = stepSchemas(phoneRef.current)[stepRef.current];
    const { criteriaMode, fields, names, shouldUseNativeValidation } = options;
    const { errors } = await zodResolver(stepSchema, undefined, { raw: true })(values, context, {
      criteriaMode,
      fields,
      names,
      shouldUseNativeValidation,
    });
    return Object.keys(errors).length > 0 ? { values: {}, errors } : { values, errors: {} };
  };

  const { control, setValue, handleSubmit, getValues, reset } = useForm<MembershipFormValues>({
    resolver,
    defaultValues: EMPTY_MEMBERSHIP_FORM,
  });

  const go = (next: Screen) => {
    if (typeof next === 'number') stepRef.current = next;
    reset(undefined, { keepValues: true, keepDefaultValues: true });
    setScreen(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submitStep = (step: number) =>
    handleSubmit(() => {
      window.setTimeout(() => go(returnToReview || step === LAST_STEP ? 'review' : step + 1));
    });

  const open = (foundPhone: string, found: MembershipInterestCheck) => {
    saveVisitorIdentity({ phone: foundPhone, name: found.name });
    setPhone(foundPhone);
    setEligibility(found);
    if (found.alreadySubmitted) {
      go('done');
      return;
    }
    reset(prefilledForm(found));
    stepRef.current = 0;
    setScreen(0);
  };

  useEffect(() => {
    if (!savedIdentity) return;
    check(savedIdentity.phone).then((found) => {
      if (found) open(savedIdentity.phone, found);
      else setScreen('ineligible');
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const useAnotherPhone = () => {
    clearVisitorIdentity();
    setScreen('identification');
  };

  const submitReview = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const submitted = await submit(phone, getValues());
    if (!submitted) return;
    setEligibility(submitted);
    go('done');
  };

  const edit = (step: number) => {
    setReturnToReview(true);
    go(step);
  };

  const title =
    typeof screen === 'number'
      ? STEP_TITLES[screen]
      : screen === 'review'
        ? undefined
        : 'Ficha de Interesse de Membresia';

  return (
    <PublicPage
      barTitle="Ficha de Membresia"
      title={title}
      progress={typeof screen === 'number' ? { current: screen + 1, total: STEP_TITLES.length } : undefined}
    >
      {screen === 'checking' && <Skeleton $h="120px" />}

      {screen === 'ineligible' && (
        <>
          <TeamContactError message={autoCheckError} stage="class" />
          <LinkButton type="button" onClick={useAnotherPhone}>
            Usar outro número
          </LinkButton>
        </>
      )}

      {screen === 'identification' && <IdentificationStep onFound={open} />}

      {typeof screen === 'number' && (
        <Form onSubmit={(event: FormEvent<HTMLFormElement>) => submitStep(screen)(event)} noValidate>
          {screen === 0 && <PersonalStep control={control} />}
          {screen === 1 && <AddressStep control={control} setValue={setValue} />}
          {screen === 2 && <JourneyStep control={control} />}
          {screen === 3 && (
            <StatuteStep
              control={control}
              readChapters={readChapters}
              onChapterRead={(id) => setReadChapters((current) => (current.includes(id) ? current : [...current, id]))}
            />
          )}
          {screen === 4 && (
            <ServeStep control={control} ministries={ministries} smallGroups={smallGroups} loadError={loadError} />
          )}

          <ActionBar>
            {screen > 0 && !returnToReview && (
              <Button type="button" variant="secondary" size="lg" onClick={() => go(screen - 1)}>
                <ArrowLeft size={16} />
                Voltar
              </Button>
            )}
            <Button type="submit" variant="primary" size="lg">
              {returnToReview ? 'Salvar e revisar' : screen === LAST_STEP ? 'Revisar ficha' : 'Continuar'}
              {!returnToReview && <ArrowRight size={16} />}
            </Button>
          </ActionBar>
        </Form>
      )}

      {screen === 'review' && (
        <Form onSubmit={submitReview}>
          <PageHeading>
            <PageTitle>Revise suas respostas</PageTitle>
            <PageLead>Confira se está tudo certo antes de enviar. Se precisar, toque em Corrigir.</PageLead>
          </PageHeading>
          <ReviewStep values={getValues()} smallGroups={smallGroups} onEdit={edit} />
          {submitError && <TeamContactError message={submitError} stage="class" />}
          <ActionBar>
            <Button type="submit" variant="primary" size="lg" disabled={submitting}>
              {submitting ? (
                'Enviando...'
              ) : (
                <>
                  <Send size={16} />
                  Enviar ficha
                </>
              )}
            </Button>
          </ActionBar>
        </Form>
      )}

      {screen === 'done' && <ConfirmationStep eligibility={eligibility} />}
    </PublicPage>
  );
}
