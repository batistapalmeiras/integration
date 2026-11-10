// React
import { useEffect, useState } from 'react';
// Libs
import { isSamePhone } from 'bp-kit';
// Components
import { PublicPage } from '../../components/PublicPage';
// Local
import { TeamContactError } from '../../components/PublicPage/TeamContactError';
import { MembershipFormFlow, prefilledForm, useSubmitMembershipAnswers } from '../../features/membershipForm';
import { saveVisitorIdentity } from '../../lib/visitorIdentity';
import { MembershipEligibility, MembershipInterestCheck, submitMembershipForm } from '../../repositories/publicForms';
import { ConfirmationStep } from './components/ConfirmationStep';
import { IdentificationStep } from './components/IdentificationStep';
import { interestFormProgress, interestProgress, Phase } from './persistence';

const BAR_TITLE = 'Ficha de Membresia';

export function MembershipInterestPage() {
  const [saved] = useState(() => interestProgress.load());
  const [phase, setPhase] = useState<Phase>(saved?.phase ?? 'identification');
  const [eligibility, setEligibility] = useState<MembershipEligibility | null>(saved?.eligibility ?? null);
  const [initialValues, setInitialValues] = useState(() => interestFormProgress.load()?.values);
  const { submit, submitting, submitError } = useSubmitMembershipAnswers(submitMembershipForm);

  useEffect(() => interestProgress.save({ phase, eligibility }), [phase, eligibility]);

  const show = (next: Phase) => {
    setPhase(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const open = (phone: string, found: MembershipInterestCheck) => {
    saveVisitorIdentity({ phone, name: found.name });
    setEligibility(found);
    if (found.alreadySubmitted) {
      show('done');
      return;
    }
    if (!initialValues || !isSamePhone(initialValues.phone, phone)) {
      interestFormProgress.clear();
      setInitialValues(prefilledForm(phone, found));
    }
    show('form');
  };

  if (phase === 'form' && initialValues) {
    return (
      <MembershipFormFlow
        barTitle={BAR_TITLE}
        progress={interestFormProgress}
        initialValues={initialValues}
        optionalPhone={false}
        onLeave={() => show('identification')}
        submitting={submitting}
        submitError={submitError && <TeamContactError message={submitError} stage="class" />}
        onSubmit={async (values) => {
          const sent = await submit(values);
          if (!sent) return;
          setEligibility(sent.result);
          interestFormProgress.clear();
          setInitialValues(undefined);
          show('done');
        }}
      />
    );
  }

  return (
    <PublicPage barTitle={BAR_TITLE} title="Ficha de Interesse de Membresia">
      {phase === 'done' ? <ConfirmationStep eligibility={eligibility} /> : <IdentificationStep onFound={open} />}
    </PublicPage>
  );
}
