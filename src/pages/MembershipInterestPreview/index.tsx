// React
import { FormEvent, useRef, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Resolver, useForm } from 'react-hook-form';
// Libs
import { Button, InfoBox, Typography } from 'bp-kit';
import { ArrowLeft, ArrowRight, Send } from 'lucide-react';
// Local
import { PublicPage } from '../../components/PublicPage';
import { Form } from '../../components/PublicPage/styles';
import { AddressStep } from './components/AddressStep';
import { DoneStep } from './components/DoneStep';
import { IdentificationStep } from './components/IdentificationStep';
import { JourneyStep } from './components/JourneyStep';
import { PersonalStep } from './components/PersonalStep';
import { ReviewStep } from './components/ReviewStep';
import { ServeStep } from './components/ServeStep';
import { StatuteStep } from './components/StatuteStep';
import { usePublicGroups } from './hooks/usePublicGroups';
import { STEP_TITLES } from './options';
import { EMPTY_MEMBERSHIP_FORM, ENFORCE_REQUIRED, MembershipFormValues, stepSchemas } from './schema';
import { NavRow, Progress, ProgressSegment, StepCount, StepHeading } from './styles';

type Screen = 'identification' | number | 'review' | 'done';

const LAST_STEP = STEP_TITLES.length - 1;

export function MembershipInterestPreviewPage() {
  const [screen, setScreen] = useState<Screen>('identification');
  const [phone, setPhone] = useState('');
  const [readChapters, setReadChapters] = useState<string[]>([]);
  const [returnToReview, setReturnToReview] = useState(false);
  const { ministries, smallGroups } = usePublicGroups();

  const stepRef = useRef(0);
  const phoneRef = useRef('');
  phoneRef.current = phone;
  const resolver: Resolver<MembershipFormValues> = (values, context, options) =>
    zodResolver(stepSchemas(phoneRef.current)[stepRef.current] as never)(values, context, options as never) as never;

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

  const submitReview = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    go('done');
  };

  const edit = (step: number) => {
    setReturnToReview(true);
    go(step);
  };

  const restart = () => {
    reset(EMPTY_MEMBERSHIP_FORM);
    setReadChapters([]);
    setReturnToReview(false);
    setPhone('');
    go('identification');
  };

  return (
    <PublicPage title="Ficha de Interesse de Membresia">
      <InfoBox variant="warning" style={{ marginBottom: 24 }}>
        Versão de teste para validação. Nenhum dado é enviado{ENFORCE_REQUIRED ? '' : ' e nenhum campo é obrigatório'}.
      </InfoBox>

      {screen === 'identification' && (
        <IdentificationStep
          onContinue={(value) => {
            setPhone(value);
            go(0);
          }}
        />
      )}

      {typeof screen === 'number' && (
        <Form onSubmit={submitStep(screen)} noValidate>
          <StepHeading>
            <Progress aria-hidden>
              {STEP_TITLES.map((title, index) => (
                <ProgressSegment key={title} $done={index <= screen} />
              ))}
            </Progress>
            <StepCount>
              Etapa {screen + 1} de {STEP_TITLES.length}
            </StepCount>
            <Typography type="h5">{STEP_TITLES[screen]}</Typography>
          </StepHeading>

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
          {screen === 4 && <ServeStep control={control} ministries={ministries} smallGroups={smallGroups} />}

          <NavRow>
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
          </NavRow>
        </Form>
      )}

      {screen === 'review' && (
        <Form onSubmit={submitReview}>
          <StepHeading>
            <Typography type="h5">Revise suas respostas</Typography>
            <Typography type="p">Confira se está tudo certo antes de enviar. Se precisar, toque em Corrigir.</Typography>
          </StepHeading>
          <ReviewStep values={getValues()} smallGroups={smallGroups} onEdit={edit} />
          <NavRow>
            <Button type="submit" variant="primary" size="lg">
              <Send size={16} />
              Enviar ficha
            </Button>
          </NavRow>
        </Form>
      )}

      {screen === 'done' && <DoneStep onRestart={restart} />}
    </PublicPage>
  );
}
