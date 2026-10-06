// React
import { useEffect, useState } from 'react';
// Libs
import { LinkButton, Skeleton } from 'bp-kit';
// Local
import { PublicPage } from '../../components/PublicPage';
import { ErrorMsg } from '../../components/PublicPage/styles';
import { clearVisitorIdentity, loadVisitorIdentity, saveVisitorIdentity } from '../../lib/visitorIdentity';
import { ConfirmationStep } from './components/ConfirmationStep';
import { IntroStep } from './components/IntroStep';
import { PhoneStep } from './components/PhoneStep';
import { SignupFormStep } from './components/SignupFormStep';
import { useCheckPhone } from './hooks/useCheckPhone';
import { useIntegrationSignup } from './hooks/useIntegrationSignup';
import { loadSignupProgress, saveSignupProgress } from './persistence';
import { SignupStep } from './types';
import { SignupFormValues } from './validators/schema';

export function IntegrationSignupPage() {
  const [saved] = useState(() => loadSignupProgress());
  const [step, setStep] = useState<SignupStep>(saved?.step ?? 'intro');
  const [phone, setPhone] = useState(saved?.phone ?? '');
  const [name, setName] = useState(saved?.name ?? '');
  const [formValues, setFormValues] = useState<Partial<SignupFormValues> | undefined>(saved?.formValues);
  const [autoChecking, setAutoChecking] = useState(false);
  const { check, error: autoCheckError } = useCheckPhone();
  const { submit, submitting, error, result } = useIntegrationSignup(saved?.result ?? null);

  useEffect(() => {
    saveSignupProgress({ step, phone, name, formValues, result: result ?? undefined });
  }, [step, phone, name, formValues, result]);

  // Quem já se identificou em qualquer página pública não digita o número de
  // novo. Se esse número não estiver elegível, a resposta é o próprio aviso
  // — pedir o telefone outra vez só faria a pessoa redigitar o mesmo número
  // para ler o mesmo erro.
  const continueFromIntro = async () => {
    const identity = loadVisitorIdentity();
    if (!identity) {
      setStep('phone');
      return;
    }

    setAutoChecking(true);
    const foundName = await check(identity.phone);
    setAutoChecking(false);

    if (!foundName) {
      setStep('ineligible');
      return;
    }

    setPhone(identity.phone);
    setName(foundName);
    setStep('form');
  };

  const handlePhoneFound = (foundPhone: string, foundName: string) => {
    saveVisitorIdentity({ phone: foundPhone, name: foundName });
    setPhone(foundPhone);
    setName(foundName);
    setStep('form');
  };

  const useAnotherPhone = () => {
    clearVisitorIdentity();
    setStep('phone');
  };

  const handleFormSubmit = async (values: SignupFormValues) => {
    setFormValues(values);
    const signupResult = await submit(phone, values);
    if (signupResult) setStep('confirmation');
  };

  return (
    <PublicPage title="Classe de Integração">
      {autoChecking && <Skeleton $h="120px" />}

      {!autoChecking && step === 'intro' && <IntroStep onContinue={continueFromIntro} />}

      {!autoChecking && step === 'ineligible' && (
        <>
          <ErrorMsg>{autoCheckError}</ErrorMsg>
          <LinkButton type="button" onClick={useAnotherPhone}>
            Usar outro número
          </LinkButton>
        </>
      )}

      {!autoChecking && step === 'phone' && <PhoneStep onFound={handlePhoneFound} />}

      {!autoChecking && step === 'form' && (
        <SignupFormStep
          name={name}
          submitting={submitting}
          error={error}
          initialValues={formValues}
          onSubmit={handleFormSubmit}
          onValuesChange={setFormValues}
        />
      )}

      {!autoChecking && step === 'confirmation' && result && <ConfirmationStep result={result} />}
    </PublicPage>
  );
}
