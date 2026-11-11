// React
import { FormEvent, ReactNode, useEffect, useRef, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Resolver, useForm } from 'react-hook-form';
// Libs
import { Button } from 'bp-kit';
import { ArrowLeft, ArrowRight, Send } from 'lucide-react';
// Components
import { PublicPage } from '../../components/PublicPage';
// Local
import { ActionBar, Form, PageHeading, PageLead, PageTitle } from '../../components/PublicPage/styles';
import { StoredValue } from '../../lib/storage';
import { AddressStep } from './components/AddressStep';
import { JourneyStep } from './components/JourneyStep';
import { PersonalStep } from './components/PersonalStep';
import { ReviewStep } from './components/ReviewStep';
import { ServeStep } from './components/ServeStep';
import { StatuteStep } from './components/StatuteStep';
import { usePublicGroups } from './hooks/usePublicGroups';
import { STEP_TITLES } from './options';
import { MembershipFormValues, stepSchemas } from './schema';

const LAST_STEP = STEP_TITLES.length - 1;

export type FlowStep = number | 'review';

export interface MembershipFlowProgress {
  step: FlowStep;
  values: MembershipFormValues;
  readChapters: string[];
  returnToReview: boolean;
}

interface Props {
  barTitle: string;
  progress: StoredValue<MembershipFlowProgress>;
  initialValues: MembershipFormValues;
  optionalPhone: boolean;
  onLeave: () => void;
  onSubmit: (values: MembershipFormValues) => Promise<void>;
  submitting: boolean;
  submitError: ReactNode;
  notice?: ReactNode;
}

export function MembershipFormFlow({
  barTitle,
  progress,
  initialValues,
  optionalPhone,
  onLeave,
  onSubmit,
  submitting,
  submitError,
  notice,
}: Props) {
  const [saved] = useState(() => progress.load());
  const [step, setStep] = useState<FlowStep>(saved?.step ?? 0);
  const [readChapters, setReadChapters] = useState<string[]>(saved?.readChapters ?? []);
  const [returnToReview, setReturnToReview] = useState(saved?.returnToReview ?? false);
  const { ministries, smallGroups, loadError } = usePublicGroups();

  const stepRef = useRef(typeof saved?.step === 'number' ? saved.step : 0);
  const resolver: Resolver<MembershipFormValues> = async (values, context, options) => {
    const { criteriaMode, fields, names, shouldUseNativeValidation } = options;
    const { errors } = await zodResolver(stepSchemas(optionalPhone)[stepRef.current], undefined, { raw: true })(
      values,
      context,
      {
        criteriaMode,
        fields,
        names,
        shouldUseNativeValidation,
      },
    );
    return Object.keys(errors).length > 0 ? { values: {}, errors } : { values, errors: {} };
  };

  const { control, setValue, handleSubmit, getValues, reset, watch } = useForm<MembershipFormValues>({
    resolver,
    defaultValues: saved?.values ?? initialValues,
  });

  useEffect(() => {
    const current = () => ({ step, values: getValues(), readChapters, returnToReview });
    progress.save(current());
    const subscription = watch(() => progress.save(current()));
    return () => subscription.unsubscribe();
  }, [progress, step, readChapters, returnToReview, getValues, watch]);

  const go = (next: FlowStep) => {
    if (typeof next === 'number') stepRef.current = next;
    reset(undefined, { keepValues: true, keepDefaultValues: true });
    setStep(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submitStep = (current: number) =>
    handleSubmit(() => {
      window.setTimeout(() => go(returnToReview || current === LAST_STEP ? 'review' : current + 1));
    });

  const edit = (target: number) => {
    setReturnToReview(true);
    go(target);
  };

  const submitReview = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit(getValues());
  };

  return (
    <PublicPage
      barTitle={barTitle}
      title={typeof step === 'number' ? STEP_TITLES[step] : undefined}
      progress={typeof step === 'number' ? { current: step + 1, total: STEP_TITLES.length } : undefined}
    >
      {typeof step === 'number' && (
        <Form onSubmit={(event: FormEvent<HTMLFormElement>) => submitStep(step)(event)} noValidate>
          {step === 0 && notice}
          {step === 0 && <PersonalStep control={control} />}
          {step === 1 && <AddressStep control={control} setValue={setValue} optionalPhone={optionalPhone} />}
          {step === 2 && <JourneyStep control={control} />}
          {step === 3 && (
            <StatuteStep
              control={control}
              readChapters={readChapters}
              onChapterRead={(id) => setReadChapters((current) => (current.includes(id) ? current : [...current, id]))}
            />
          )}
          {step === 4 && (
            <ServeStep control={control} ministries={ministries} smallGroups={smallGroups} loadError={loadError} />
          )}

          <ActionBar>
            {!returnToReview && (
              <Button type="button" variant="secondary" size="lg" onClick={() => (step > 0 ? go(step - 1) : onLeave())}>
                <ArrowLeft size={16} />
                Voltar
              </Button>
            )}
            <Button type="submit" variant="primary" size="lg">
              {returnToReview ? 'Salvar e revisar' : step === LAST_STEP ? 'Revisar ficha' : 'Continuar'}
              {!returnToReview && <ArrowRight size={16} />}
            </Button>
          </ActionBar>
        </Form>
      )}

      {step === 'review' && (
        <Form onSubmit={submitReview}>
          <PageHeading>
            <PageTitle>Revise suas respostas</PageTitle>
            <PageLead>Confira se está tudo certo antes de enviar. Se precisar, toque em Corrigir.</PageLead>
          </PageHeading>
          <ReviewStep values={getValues()} smallGroups={smallGroups} onEdit={edit} />
          {submitError}
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
    </PublicPage>
  );
}
