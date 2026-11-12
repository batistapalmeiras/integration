// Local
import { PersonStatus } from '../../../../../features/visitors';
import { Bar, Bars, Label, Labels, Wrapper } from './styles';

const STAGES: { statuses: PersonStatus[]; label: string }[] = [
  { statuses: ['initial_contact', 'retry_contact'], label: 'Contato' },
  { statuses: ['welcome_coffee', 'pending_signup'], label: 'Café' },
  { statuses: ['integration'], label: 'Integração' },
  { statuses: ['membership_pending'], label: 'Membresia' },
];

interface Props {
  status: PersonStatus;
}

export function ProgressStepper({ status }: Props) {
  if (status === 'archived' || status === 'member') return null;

  const currentIndex = STAGES.findIndex((stage) => stage.statuses.includes(status));

  return (
    <Wrapper aria-label={`Etapa ${currentIndex + 1} de ${STAGES.length}: ${STAGES[currentIndex].label}`}>
      <Bars $stages={STAGES.length}>
        {STAGES.map((stage, index) => (
          <Bar key={stage.label} $filled={index <= currentIndex} />
        ))}
      </Bars>
      <Labels $stages={STAGES.length}>
        {STAGES.map((stage, index) => (
          <Label key={stage.label} $current={index === currentIndex}>
            {stage.label}
          </Label>
        ))}
      </Labels>
    </Wrapper>
  );
}
