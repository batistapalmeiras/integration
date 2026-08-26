// React
import { useState } from 'react';
// Libs
import { Button, Card, RadioGroup, Typography } from 'bp-kit';
// Local
import { ContactResult, RESULT_LABELS } from '../../types';
import { Actions, CardHeader } from '../styles';

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

  return (
    <Card>
      <CardHeader>
        <Typography type="label">Último contato registrado</Typography>
        {!editing && (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              setValue(result);
              setEditing(true);
            }}
          >
            Editar
          </Button>
        )}
      </CardHeader>

      {editing ? (
        <>
          <RadioGroup label="Resultado" name="lastContactResult" options={RESULT_OPTIONS} value={value} onChange={(v) => setValue(v as ContactResult)} />
          <Actions>
            <Button size="sm" variant="secondary" type="button" onClick={() => setEditing(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button size="sm" variant="primary" type="button" onClick={save} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar correção'}
            </Button>
          </Actions>
        </>
      ) : (
        <Typography type="p">{RESULT_LABELS[result]}</Typography>
      )}
    </Card>
  );
}
