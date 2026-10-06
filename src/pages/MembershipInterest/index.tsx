// React
import { useEffect, useState } from 'react';
// Libs
import { LinkButton, Skeleton } from 'bp-kit';
// Local
import { PublicPage } from '../../components/PublicPage';
import { ErrorMsg } from '../../components/PublicPage/styles';
import { clearVisitorIdentity, loadVisitorIdentity, saveVisitorIdentity } from '../../lib/visitorIdentity';
import { ConfirmationStep } from './components/ConfirmationStep';
import { InterestFormStep } from './components/InterestFormStep';
import { PhoneStep } from './components/PhoneStep';
import { useCheckPhone } from './hooks/useCheckPhone';
import { useMembershipInterest } from './hooks/useMembershipInterest';
import { InterestStep, MembershipEligibility } from './types';
import { MembershipInterestFormValues } from './validators/schema';

export function MembershipInterestPage() {
  const [identity, setIdentity] = useState(() => loadVisitorIdentity());
  const [step, setStep] = useState<InterestStep>('phone');
  const [autoChecking, setAutoChecking] = useState(true);
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [eligibility, setEligibility] = useState<MembershipEligibility | null>(null);
  const { check, error: autoCheckError } = useCheckPhone();
  const { submit, submitting, submitError } = useMembershipInterest();

  // Identificar-se uma vez vale para sempre: quem já disse quem é em
  // qualquer página pública não digita o número de novo. Se esse número não
  // estiver elegível, a resposta é o próprio aviso — pedir o telefone outra
  // vez só faria a pessoa redigitar o mesmo número para ler o mesmo erro.
  useEffect(() => {
    if (!identity) {
      setAutoChecking(false);
      return;
    }

    check(identity.phone).then((result) => {
      if (result) {
        setPhone(identity.phone);
        setName(result.name);
        setEligibility({ lessonsAttended: result.lessonsAttended, lessonsTotal: result.lessonsTotal });
        setStep(result.alreadySubmitted ? 'confirmation' : 'form');
      } else {
        setStep('ineligible');
      }
      setAutoChecking(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFound = (foundPhone: string, foundName: string, alreadySubmitted: boolean, found: MembershipEligibility) => {
    saveVisitorIdentity({ phone: foundPhone, name: foundName });
    setPhone(foundPhone);
    setName(foundName);
    setEligibility(found);
    setStep(alreadySubmitted ? 'confirmation' : 'form');
  };

  const useAnotherPhone = () => {
    clearVisitorIdentity();
    setIdentity(null);
    setStep('phone');
  };

  const handleSubmit = async (values: MembershipInterestFormValues) => {
    const submitted = await submit(phone, values);
    if (!submitted) return;
    setEligibility(submitted);
    setStep('confirmation');
  };

  return (
    <PublicPage title="Ficha de Interesse de Membresia">
      {autoChecking && <Skeleton $h="120px" />}

      {!autoChecking && step === 'ineligible' && (
        <>
          <ErrorMsg>{autoCheckError}</ErrorMsg>
          <LinkButton type="button" onClick={useAnotherPhone}>
            Usar outro número
          </LinkButton>
        </>
      )}

      {!autoChecking && step === 'phone' && <PhoneStep onFound={handleFound} />}

      {!autoChecking && step === 'form' && (
        <InterestFormStep name={name} submitting={submitting} submitError={submitError} onSubmit={handleSubmit} />
      )}

      {!autoChecking && step === 'confirmation' && <ConfirmationStep name={name} eligibility={eligibility} />}
    </PublicPage>
  );
}
