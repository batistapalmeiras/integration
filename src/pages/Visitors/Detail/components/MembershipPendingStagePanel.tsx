// React
import { useNavigate } from 'react-router-dom';
// Libs
import { Button } from 'bp-kit';
import { Check } from 'lucide-react';
// Components
import { FormActions } from '../../../../components/FormLayout';
// Local
import { Person } from '../../../../features/visitors';
import { confirmMemberPath } from '../../../../routes/paths';
import { Hint } from '../styles';
import { StageCard } from './StageCard';

interface Props {
  person: Person;
}

export function MembershipPendingStagePanel({ person }: Props) {
  const navigate = useNavigate();

  return (
    <StageCard title="Confirmar como membro">
      <Hint>Concluiu as 4 aulas e aguarda a confirmação como membro.</Hint>
      <FormActions>
        <Button variant="primary" onClick={() => navigate(confirmMemberPath(person.id))}>
          <Check size={16} />
          Confirmar como membro
        </Button>
      </FormActions>
    </StageCard>
  );
}
