// React
import { useEffect, useState } from 'react';
// Local
import { PublicPage } from '../../components/PublicPage';
import { ConfirmationStep } from './components/ConfirmationStep';
import { IntroStep } from './components/IntroStep';
import { PhoneStep } from './components/PhoneStep';
import { SignupFormStep } from './components/SignupFormStep';
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
  const { submit, submitting, error, result } = useIntegrationSignup(saved?.result ?? null);

  useEffect(() => {
    saveSignupProgress({ step, phone, name, formValues, result: result ?? undefined });
  }, [step, phone, name, formValues, result]);

  const handlePhoneFound = (foundPhone: string, foundName: string) => {
    setPhone(foundPhone);
    setName(foundName);
    setStep('form');
  };

  const handleFormSubmit = async (values: SignupFormValues) => {
    setFormValues(values);
    const signupResult = await submit(phone, values);
    if (signupResult) setStep('confirmation');
  };

  return (
    <PublicPage title="Classe de Integração">
      {step === 'intro' && <IntroStep onContinue={() => setStep('phone')} />}
      {step === 'phone' && <PhoneStep onFound={handlePhoneFound} />}
      {step === 'form' && (
        <SignupFormStep
          name={name}
          submitting={submitting}
          error={error}
          initialValues={formValues}
          onSubmit={handleFormSubmit}
          onValuesChange={setFormValues}
        />
      )}
      {step === 'confirmation' && result && <ConfirmationStep result={result} />}
    </PublicPage>
  );
}
