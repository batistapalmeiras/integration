// Libs
import { Button, Card, Typography, useModal } from 'bp-kit';
// Local
import { RowActions } from '../../../../components/Table';
import { Person } from '../../types';
import { CardHeader, StagePanel } from '../styles';
import { ConfirmMemberModal } from './ConfirmMemberModal';

interface Props {
  person: Person;
  onConfirm: (smallGroup: string, ministry: string) => Promise<void>;
}

export function MembershipPendingStagePanel({ person, onConfirm }: Props) {
  const { open, close, modal } = useModal();

  const openConfirmModal = () => open(<ConfirmMemberModal person={person} close={close} onConfirm={onConfirm} />);

  return (
    <StagePanel>
      <Card>
        <CardHeader>
          <Typography type="label">Concluiu as 4 aulas e aguarda confirmação como membro</Typography>
        </CardHeader>
        <RowActions>
          <Button variant="primary" onClick={openConfirmModal}>
            Confirmar como membro
          </Button>
        </RowActions>
      </Card>
      {modal}
    </StagePanel>
  );
}
