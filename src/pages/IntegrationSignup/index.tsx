// React
import { useEffect, useState } from 'react';
// Local
import { PublicPage } from '../../components/PublicPage';
import { saveVisitorIdentity } from '../../lib/visitorIdentity';
import { ConfirmationStep } from './components/ConfirmationStep';
import { IntroStep } from './components/IntroStep';
import { PhoneStep } from './components/PhoneStep';
import { SignupFormStep } from './components/SignupFormStep';
import { useIntegrationSignup } from './hooks/useIntegrationSignup';
import { signupProgress } from './persistence';
import { PROGRESS_STEPS, SignupStep } from './types';
import { SignupFormValues } from './validators/schema';

export function IntegrationSignupPage() {
  const [saved] = useState(() => signupProgress.load());
  const [step, setStep] = useState<SignupStep>(saved?.step ?? 'intro');
  const [phone, setPhone] = useState(saved?.phone ?? '');
  const [name, setName] = useState(saved?.name ?? '');
  const [formValues, setFormValues] = useState<Partial<SignupFormValues> | undefined>(saved?.formValues);
  const { submit, submitting, error, result } = useIntegrationSignup(saved?.result ?? null);

  useEffect(() => {
    signupProgress.save({ step, phone, name, formValues, result: result ?? undefined });
  }, [step, phone, name, formValues, result]);

  const goTo = (next: SignupStep) => {
    setStep(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePhoneFound = (foundPhone: string, foundName: string) => {
    saveVisitorIdentity({ phone: foundPhone, name: foundName });
    setPhone(foundPhone);
    setName(foundName);
    goTo('form');
  };

  const progressIndex = PROGRESS_STEPS.indexOf(step);

  const handleFormSubmit = async (values: SignupFormValues) => {
    setFormValues(values);
    const signupResult = await submit(phone, values);
    if (signupResult) setStep('confirmation');
  };

  return (
    <PublicPage
      title="Classe de Integração"
      progress={progressIndex >= 0 ? { current: progressIndex + 1, total: PROGRESS_STEPS.length } : undefined}
    >
      {step === 'intro' && <IntroStep onContinue={() => goTo('phone')} />}

      {step === 'phone' && <PhoneStep onFound={handlePhoneFound} onBack={() => goTo('intro')} />}

      {step === 'form' && (
        <SignupFormStep
          name={name}
          submitting={submitting}
          error={error}
          initialValues={formValues}
          onSubmit={handleFormSubmit}
          onValuesChange={setFormValues}
          onBack={() => goTo('phone')}
        />
      )}

      {step === 'confirmation' && result && <ConfirmationStep result={result} />}
    </PublicPage>
  );
}
