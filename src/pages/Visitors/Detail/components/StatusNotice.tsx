// Libs
import { Button, Card, Typography } from 'bp-kit';
import { RotateCcw } from 'lucide-react';
// Components
import { FormActions } from '../../../../components/FormLayout';
// Local
import { Hint, NoticeBody, NoticeText } from '../styles';

interface WaitingProps {
  who: string;
}

export function WaitingNotice({ who }: WaitingProps) {
  return (
    <Card>
      <NoticeBody>
        <NoticeText>
          <Typography type="label">Aguardando {who}</Typography>
          <Hint>Esta etapa é conduzida por outra equipe.</Hint>
        </NoticeText>
      </NoticeBody>
    </Card>
  );
}

interface ArchivedProps {
  canReactivate: boolean;
  onReactivate: () => Promise<unknown>;
}

export function ArchivedNotice({ canReactivate, onReactivate }: ArchivedProps) {
  return (
    <Card>
      <NoticeBody>
        <NoticeText>
          <Typography type="label">Arquivado</Typography>
          <Hint>Saiu do processo de integração.</Hint>
        </NoticeText>
        {canReactivate && (
          <FormActions>
            <Button variant="secondary" onClick={() => onReactivate()}>
              <RotateCcw size={16} />
              Reativar
            </Button>
          </FormActions>
        )}
      </NoticeBody>
    </Card>
  );
}
