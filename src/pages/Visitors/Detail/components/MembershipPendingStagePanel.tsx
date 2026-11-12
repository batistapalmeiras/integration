// React
import { useNavigate } from 'react-router-dom';
// Libs
import { Button } from 'bp-kit';
import { Check, UserCheck } from 'lucide-react';
// Components
import { FormActions } from '../../../../components/FormLayout';
// Local
import { Person } from '../../../../features/visitors';
import { confirmMemberPath } from '../../../../routes/paths';
import { StageCard } from './StageCard';

interface Props {
  person: Person;
}

export function MembershipPendingStagePanel({ person }: Props) {
  const navigate = useNavigate();

  return (
    <StageCard
      title="Confirmar como membro"
      summary={{ icon: UserCheck, title: 'Concluiu as 4 aulas', text: 'Aguardando a confirmação como membro.' }}
    >
      <FormActions>
        <Button variant="primary" onClick={() => navigate(confirmMemberPath(person.id))}>
          <Check size={16} />
          Confirmar como membro
        </Button>
      </FormActions>
    </StageCard>
  );
}
