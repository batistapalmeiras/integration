// React
import { useState } from 'react';
// Libs
import { Button, LinkButton, ModalTitle, RadioGroup, Typography, useModal } from 'bp-kit';
import { Save } from 'lucide-react';
// Components
import { FormActions } from '../../../../components/FormLayout';
// Local
import { ContactResult, RESULT_LABELS } from '../../../../features/visitors';
import { CompactRow } from '../styles';

const RESULT_OPTIONS = Object.entries(RESULT_LABELS).map(([value, label]) => ({ value, label }));

interface FormProps {
  result: ContactResult;
  onSave: (result: ContactResult) => Promise<void>;
  onClose: () => void;
}

function CorrectionForm({ result, onSave, onClose }: FormProps) {
  const [value, setValue] = useState<ContactResult>(result);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    await onSave(value);
    onClose();
  };

  return (
    <>
      <RadioGroup
        label="Resultado"
        name="lastContactResult"
        options={RESULT_OPTIONS}
        value={value}
        onChange={(next) => setValue(next as ContactResult)}
      />
      <FormActions>
        <Button type="button" variant="primary" onClick={save} disabled={saving || value === result}>
          {saving ? (
            'Salvando...'
          ) : (
            <>
              <Save size={16} />
              Salvar correção
            </>
          )}
        </Button>
        <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>
          Voltar
        </Button>
      </FormActions>
    </>
  );
}

interface Props {
  result: ContactResult;
  onSave: (result: ContactResult) => Promise<void>;
}

export function LastContactCard({ result, onSave }: Props) {
  const { open, close, modal } = useModal('drawer');

  const openCorrection = () =>
    open(
      <>
        <ModalTitle onClose={close}>Corrigir último contato</ModalTitle>
        <CorrectionForm result={result} onSave={onSave} onClose={close} />
      </>,
    );

  return (
    <>
      <CompactRow>
        <Typography type="caption">Último contato: {RESULT_LABELS[result]}</Typography>
        <LinkButton onClick={openCorrection}>Corrigir</LinkButton>
      </CompactRow>
      {modal}
    </>
  );
}
