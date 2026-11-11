// React
import { useState } from 'react';
// Libs
import { Button, ModalActions, ModalTitle, RawTextarea, useToast } from 'bp-kit';
import { Save } from 'lucide-react';
// Local
import { PersonNote } from '../../domain/personNotes';
import { updatePersonNote } from '../../repositories/personNotes';

interface Props {
  note: PersonNote;
  onSaved: () => Promise<void>;
  close: () => void;
}

export function EditNoteModal({ note, onSaved, close }: Props) {
  const { show: showToast, toast } = useToast();
  const [draft, setDraft] = useState(note.body);
  const [saving, setSaving] = useState(false);
  const unchanged = draft.trim() === note.body.trim();

  const save = async () => {
    setSaving(true);
    try {
      await updatePersonNote(note.id, draft);
      await onSaved();
      close();
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Não foi possível salvar.');
      setSaving(false);
    }
  };

  return (
    <>
      <ModalTitle onClose={close}>Editar anotação</ModalTitle>
      <RawTextarea label="Anotação" rows={4} value={draft} autoFocus onChange={(event) => setDraft(event.target.value)} />
      <ModalActions>
        <Button type="button" variant="primary" disabled={saving || unchanged || draft.trim() === ''} onClick={save}>
          <Save size={16} />
          {saving ? 'Salvando...' : 'Salvar'}
        </Button>
      </ModalActions>
      {toast}
    </>
  );
}
