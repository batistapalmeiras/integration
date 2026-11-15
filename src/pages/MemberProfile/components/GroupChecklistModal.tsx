// React
import { useState } from 'react';
// Libs
import { Button, Checkbox, ModalActions, ModalTitle, SearchInput, Typography, useToast } from 'bp-kit';
import { Save } from 'lucide-react';
// Local
import { errorMessage } from '../../../lib/queryCache';
import { sameItems } from '../../../lib/sameItems';
import { foldText } from '../../../domain/text';
import { ChecklistItem, ChecklistItems, GroupName } from '../styles';
import { TonePill } from '../../../components/StatusPill';

interface ChecklistGroup {
  id: string;
  name: string;
  roles: string[];
}

interface Props {
  title: string;
  emptyText: string;
  searchPlaceholder: string;
  groups: ChecklistGroup[];
  selected: string[];
  onSave: (ids: string[]) => Promise<void>;
  close: () => void;
}

export function GroupChecklistModal({ title, emptyText, searchPlaceholder, groups, selected, onSave, close }: Props) {
  const { show: showToast, toast } = useToast();
  const [checked, setChecked] = useState(selected);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const term = foldText(search.trim());
  const visible = term ? groups.filter((group) => foldText(group.name).includes(term)) : groups;

  const toggle = (id: string) =>
    setChecked((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));

  const save = async () => {
    setSaving(true);
    try {
      await onSave(checked);
      close();
    } catch (e) {
      setSaving(false);
      showToast(errorMessage(e) ?? 'Não foi possível salvar.');
    }
  };

  return (
    <>
      <ModalTitle onClose={close}>{title}</ModalTitle>
      {groups.length === 0 ? (
        <Typography type="p">{emptyText}</Typography>
      ) : (
        <>
          <SearchInput value={search} onChange={setSearch} placeholder={searchPlaceholder} autoFocus />
          {visible.length === 0 ? (
            <Typography type="p">Nada encontrado para essa busca.</Typography>
          ) : (
            <ChecklistItems>
              {visible.map((group) => (
                <ChecklistItem key={group.id}>
                  <Checkbox
                    checked={checked.includes(group.id)}
                    onChange={() => toggle(group.id)}
                    label={
                      <GroupName>
                        {group.name}
                        {group.roles.map((role) => (
                          <TonePill key={role} $tone="success">
                            {role}
                          </TonePill>
                        ))}
                      </GroupName>
                    }
                  />
                </ChecklistItem>
              ))}
            </ChecklistItems>
          )}
        </>
      )}
      <ModalActions>
        <Button type="button" variant="primary" disabled={saving || sameItems(checked, selected)} onClick={save}>
          {saving ? (
            'Salvando...'
          ) : (
            <>
              <Save size={16} />
              Salvar
            </>
          )}
        </Button>
      </ModalActions>
      {toast}
    </>
  );
}
