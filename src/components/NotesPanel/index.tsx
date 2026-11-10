// React
import { useState } from 'react';
// Libs
import {
  Button,
  IconButton,
  LinkButton,
  ModalActions,
  ModalTitle,
  RawTextarea,
  Typography,
  useAuthCtx,
  useModal,
  useToast,
} from 'bp-kit';
import { Lock, Plus, Save, Trash2 } from 'lucide-react';
// Local
import { formatTimestampDate } from '../../domain/dates';
import { PersonNote } from '../../domain/personNotes';
import { invalidateQueries } from '../../lib/queryCache';
import { queryKeys } from '../../lib/queryKeys';
import { addPersonNote, deletePersonNote } from '../../repositories/personNotes';
import { UserRole } from '../../types/enums';
import { ItemPicker, ItemRow, ItemRows, Panel, PanelHeader, PanelTitle } from '../Panel';
import { NoteBody, NoteDate, NoteText, PrivateHint } from './styles';

interface Props {
  personId: string;
  notes: PersonNote[];
}

const noteOrigin = (note: PersonNote) =>
  [note.authorName ?? 'Importada do sistema antigo', formatTimestampDate(note.createdAt)].join(' · ');

export function NotesPanel({ personId, notes }: Props) {
  const { user } = useAuthCtx();
  const { show: showToast, toast } = useToast();
  const { open, close, modal } = useModal('drawer');
  const [writing, setWriting] = useState(false);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);

  const refresh = () => invalidateQueries(queryKeys.personNotes(personId));

  const save = async () => {
    if (!user || draft.trim() === '') return;
    setSaving(true);
    try {
      await addPersonNote(personId, draft, user.id);
      await refresh();
      setDraft('');
      setWriting(false);
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Não foi possível salvar.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (note: PersonNote) =>
    open(
      <>
        <ModalTitle onClose={close}>Apagar anotação?</ModalTitle>
        <Typography type="p">{note.body}</Typography>
        <ModalActions>
          <Button
            type="button"
            variant="danger"
            onClick={async () => {
              try {
                await deletePersonNote(note.id);
                await refresh();
                close();
              } catch (e) {
                close();
                showToast(e instanceof Error ? e.message : 'Não foi possível apagar.');
              }
            }}
          >
            <Trash2 size={16} />
            Apagar
          </Button>
        </ModalActions>
      </>,
    );

  return (
    <Panel aria-label="Anotações">
      <PanelHeader>
        <PanelTitle>Anotações</PanelTitle>
      </PanelHeader>

      {notes.length > 0 && (
        <ItemRows>
          {notes.map((note) => (
            <ItemRow key={note.id}>
              <NoteText>
                <NoteBody>{note.body}</NoteBody>
                <NoteDate>
                  {noteOrigin(note)}
                  {note.private && (
                    <>
                      {' · '}
                      <PrivateHint>
                        <Lock size={12} aria-hidden="true" />
                        Só você vê
                      </PrivateHint>
                    </>
                  )}
                </NoteDate>
              </NoteText>
              <IconButton
                type="button"
                icon={<Trash2 size={14} />}
                iconPosition="center"
                variant="secondary"
                size="sm"
                aria-label="Apagar anotação"
                title="Apagar"
                onClick={() => confirmDelete(note)}
              />
            </ItemRow>
          ))}
        </ItemRows>
      )}

      {writing ? (
        <ItemPicker>
          <RawTextarea
            label="Nova anotação"
            rows={3}
            value={draft}
            autoFocus
            onChange={(event) => setDraft(event.target.value)}
          />
          {user?.role === UserRole.Pastor && (
            <PrivateHint>
              <Lock size={12} aria-hidden="true" />
              Só você verá esta anotação.
            </PrivateHint>
          )}
          <Button type="button" variant="primary" disabled={saving || draft.trim() === ''} onClick={save}>
            <Save size={16} />
            {saving ? 'Salvando...' : 'Salvar anotação'}
          </Button>
          <LinkButton
            type="button"
            onClick={() => {
              setDraft('');
              setWriting(false);
            }}
          >
            Cancelar
          </LinkButton>
        </ItemPicker>
      ) : (
        <Button type="button" variant="secondary" onClick={() => setWriting(true)}>
          <Plus size={16} />
          Adicionar anotação
        </Button>
      )}

      {modal}
      {toast}
    </Panel>
  );
}
