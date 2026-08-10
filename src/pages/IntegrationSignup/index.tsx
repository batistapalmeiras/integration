// React
import { useState } from 'react';
// Libs
import { Brand, Typography } from 'bp-kit';
// Local
import icon from '../../assets/icon.png';
import { ConfirmationStep } from './components/ConfirmationStep';
import { IntroStep } from './components/IntroStep';
import { PhoneStep } from './components/PhoneStep';
import { SignupFormStep } from './components/SignupFormStep';
import { useIntegrationSignup } from './hooks/useIntegrationSignup';
import { Card, Header, Page } from './styles';
import { SignupStep } from './types';

export function IntegrationSignupPage() {
  const [step, setStep] = useState<SignupStep>('intro');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const { submit, submitting, error, result } = useIntegrationSignup();

  const handlePhoneFound = (foundPhone: string, foundName: string) => {
    setPhone(foundPhone);
    setName(foundName);
    setStep('form');
  };

  const handleFormSubmit = async (values: Parameters<typeof submit>[1]) => {
    await submit(phone, values);
    setStep('confirmation');
  };

  return (
    <Page>
      <Card>
        <Header>
          <Brand icon={icon} alt="Batista Palmeiras" name="Igreja Batista de Palmeiras" />
          <Typography type="h4">Classe de Integração</Typography>
        </Header>

        {step === 'intro' && <IntroStep onContinue={() => setStep('phone')} />}
        {step === 'phone' && <PhoneStep onFound={handlePhoneFound} />}
        {step === 'form' && (
          <SignupFormStep name={name} submitting={submitting} error={error} onSubmit={handleFormSubmit} />
        )}
        {step === 'confirmation' && result && <ConfirmationStep result={result} />}
      </Card>
    </Page>
  );
}
