// React
import { useEffect, useState } from 'react';
// Libs
import { onlyDigits } from 'bp-kit';
// Components
import { PublicPage } from '../../components/PublicPage';
// Local
import { TeamContactError } from '../../components/PublicPage/TeamContactError';
import { EMPTY_MEMBERSHIP_FORM, MembershipFormFlow, useSubmitMembershipAnswers } from '../../features/membershipForm';
import { submitMembershipSignup } from '../../repositories/publicForms';
import { CpfStep } from './components/CpfStep';
import { SignupDone } from './components/SignupDone';
import { Phase, signupFormProgress, signupPhase } from './persistence';

const BAR_TITLE = 'Cadastro de Membresia';

export function MembershipSignupPage() {
  const [phase, setPhase] = useState<Phase>(() => signupPhase.load() ?? 'cpf');
  const [initialValues, setInitialValues] = useState(() => signupFormProgress.load()?.values);
  const { submit, submitting, submitError } = useSubmitMembershipAnswers(submitMembershipSignup);

  useEffect(() => signupPhase.save(phase), [phase]);

  const show = (next: Phase) => {
    setPhase(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const start = (cpf: string) => {
    if (!initialValues || onlyDigits(initialValues.cpf) !== onlyDigits(cpf)) {
      signupFormProgress.clear();
      setInitialValues({ ...EMPTY_MEMBERSHIP_FORM, cpf });
    }
    show('form');
  };

  if (phase === 'form' && initialValues) {
    return (
      <MembershipFormFlow
        barTitle={BAR_TITLE}
        progress={signupFormProgress}
        initialValues={initialValues}
        optionalPhone
        onLeave={() => show('cpf')}
        submitting={submitting}
        submitError={submitError && <TeamContactError message={submitError} stage="class" />}
        onSubmit={async (values) => {
          if (!(await submit(values))) return;
          signupFormProgress.clear();
          setInitialValues(undefined);
          show('done');
        }}
      />
    );
  }

  return (
    <PublicPage barTitle={BAR_TITLE} title="Cadastro de Membresia">
      {phase === 'done' ? <SignupDone /> : <CpfStep initialCpf={initialValues?.cpf ?? ''} onAvailable={start} />}
    </PublicPage>
  );
}
