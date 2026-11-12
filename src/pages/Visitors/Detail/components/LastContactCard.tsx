// React
import { useState } from 'react';
// Libs
import { Button, Card, LinkButton, RadioGroup, Typography } from 'bp-kit';
import { Save } from 'lucide-react';
// Local
import { ContactResult, RESULT_LABELS } from '../../../../features/visitors';
import { CardHeader, CompactRow } from '../styles';
import { FormActions } from '../../../../components/FormLayout';

const RESULT_OPTIONS = Object.entries(RESULT_LABELS).map(([value, label]) => ({ value, label }));

interface Props {
  result: ContactResult;
  onSave: (result: ContactResult) => Promise<void>;
}

export function LastContactCard({ result, onSave }: Props) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState<ContactResult>(result);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    await onSave(value);
    setSaving(false);
    setEditing(false);
  };

  const startEditing = () => {
    setValue(result);
    setEditing(true);
  };

  if (!editing) {
    return (
      <CompactRow>
        <Typography type="caption">Último contato: {RESULT_LABELS[result]}</Typography>
        <LinkButton onClick={startEditing}>Corrigir</LinkButton>
      </CompactRow>
    );
  }

  return (
    <Card>
      <CardHeader>
        <Typography type="label">Corrigir último contato</Typography>
      </CardHeader>
      <RadioGroup
        label="Resultado"
        name="lastContactResult"
        options={RESULT_OPTIONS}
        value={value}
        onChange={(v) => setValue(v as ContactResult)}
      />
      <FormActions>
        <Button size="sm" variant="secondary" type="button" onClick={() => setEditing(false)} disabled={saving}>
          Cancelar
        </Button>
        <Button size="sm" variant="primary" type="button" onClick={save} disabled={saving}>
          {saving ? (
            'Salvando...'
          ) : (
            <>
              <Save size={16} />
              Salvar correção
            </>
          )}
        </Button>
      </FormActions>
    </Card>
  );
}
