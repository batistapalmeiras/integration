// React
import { useNavigate } from 'react-router-dom';
// Libs
import { Button, Card, Typography } from 'bp-kit';
// Local
import { RowActions } from '../../../../components/Table';
import { Person } from '../../../../features/visitors';
import { confirmMemberPath } from '../../../../routes/paths';
import { CardHeader, StagePanel } from '../styles';

interface Props {
  person: Person;
}

export function MembershipPendingStagePanel({ person }: Props) {
  const navigate = useNavigate();

  return (
    <StagePanel>
      <Card>
        <CardHeader>
          <Typography type="label">Concluiu as 4 aulas e aguarda confirmação como membro</Typography>
        </CardHeader>
        <RowActions>
          <Button variant="primary" onClick={() => navigate(confirmMemberPath(person.id))}>
            Confirmar como membro
          </Button>
        </RowActions>
      </Card>
    </StagePanel>
  );
}
