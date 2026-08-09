// Libs
import { Check } from 'lucide-react';
// Local
import { PersonStatus } from '../../../types';
import { Circle, Label, Step, Wrapper } from './styles';

const STAGES: { statuses: PersonStatus[]; label: string }[] = [
  { statuses: ['initial_contact', 'retry_contact'], label: 'Contato' },
  { statuses: ['welcome_coffee'], label: 'Café' },
  { statuses: ['integration'], label: 'Integração' },
  { statuses: ['membership_pending'], label: 'Membresia' },
  { statuses: ['member'], label: 'Membro' },
];

interface Props {
  status: PersonStatus;
}

export function ProgressStepper({ status }: Props) {
  if (status === 'archived') return null;

  const currentIndex = STAGES.findIndex((stage) => stage.statuses.includes(status));

  return (
    <Wrapper>
      {STAGES.map((stage, index) => {
        const state = index < currentIndex ? 'done' : index === currentIndex ? 'current' : 'future';
        return (
          <Step key={stage.label} $state={state}>
            <Circle $state={state}>{state === 'done' ? <Check /> : index + 1}</Circle>
            <Label $state={state}>{stage.label}</Label>
          </Step>
        );
      })}
    </Wrapper>
  );
}
