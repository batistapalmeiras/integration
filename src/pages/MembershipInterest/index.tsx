// React
import { useEffect, useState } from 'react';
// Libs
import { Skeleton } from 'bp-kit';
// Local
import { PublicPage } from '../../components/PublicPage';
import { ErrorMsg } from '../../components/PublicPage/styles';
import { ConfirmationStep } from './components/ConfirmationStep';
import { InterestFormStep } from './components/InterestFormStep';
import { PhoneStep } from './components/PhoneStep';
import { useCheckPhone } from './hooks/useCheckPhone';
import { useMembershipInterest } from './hooks/useMembershipInterest';
import { clearSavedPhone, loadSavedPhone, saveSavedPhone } from './persistence';
import { InterestStep } from './types';
import { MembershipInterestFormValues } from './validators/schema';

export function MembershipInterestPage() {
  const [step, setStep] = useState<InterestStep>('phone');
  const [autoChecking, setAutoChecking] = useState(true);
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const { check, error: autoCheckError } = useCheckPhone();
  const { submit, submitting, submitError } = useMembershipInterest();

  // "Sessão eterna": a saved phone skips the manual phone step entirely on
  // every future visit — if it's no longer valid (e.g. status changed),
  // fall back to asking again instead of getting stuck.
  useEffect(() => {
    const saved = loadSavedPhone();
    if (!saved) {
      setAutoChecking(false);
      return;
    }

    check(saved).then((result) => {
      if (result) {
        setPhone(saved);
        setName(result.name);
        setStep(result.alreadySubmitted ? 'confirmation' : 'form');
      } else {
        clearSavedPhone();
      }
      setAutoChecking(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFound = (foundPhone: string, foundName: string, alreadySubmitted: boolean) => {
    saveSavedPhone(foundPhone);
    setPhone(foundPhone);
    setName(foundName);
    setStep(alreadySubmitted ? 'confirmation' : 'form');
  };

  const handleSubmit = async (values: MembershipInterestFormValues) => {
    const ok = await submit(phone, values);
    if (ok) setStep('confirmation');
  };

  return (
    <PublicPage title="Ficha de Interesse de Membresia">
      {autoChecking && <Skeleton $h="120px" />}

      {!autoChecking && step === 'phone' && (
        <>
          {autoCheckError && <ErrorMsg>{autoCheckError}</ErrorMsg>}
          <PhoneStep onFound={handleFound} />
        </>
      )}

      {!autoChecking && step === 'form' && (
        <InterestFormStep name={name} submitting={submitting} submitError={submitError} onSubmit={handleSubmit} />
      )}

      {!autoChecking && step === 'confirmation' && <ConfirmationStep name={name} />}
    </PublicPage>
  );
}
