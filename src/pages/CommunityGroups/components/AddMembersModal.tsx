// React
import { FormEvent, useState } from 'react';
// Libs
import { Button, Form, ModalActions, ModalTitle, MultiSelect } from 'bp-kit';
import { UserPlus } from 'lucide-react';
// Local
import { useMemberNames } from '../../../queries/reference';

interface Props {
  title: string;
  currentIds: string[];
  close: () => void;
  onAdd: (personIds: string[]) => Promise<void>;
}

export function AddMembersModal({ title, currentIds, close, onAdd }: Props) {
  const members = useMemberNames().data ?? [];
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const options = members
    .filter((member) => !currentIds.includes(member.id))
    .map((member) => ({ value: member.id, label: member.name }));

  const submit = async () => {
    setSaving(true);
    try {
      await onAdd(selected);
      close();
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <ModalTitle onClose={close}>{title}</ModalTitle>
      <Form
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          submit();
        }}
      >
        <MultiSelect
          label="Membros"
          options={options}
          value={selected}
          onChange={setSelected}
          placeholder="Buscar membro…"
        />
        <ModalActions>
          <Button type="submit" variant="primary" disabled={saving || selected.length === 0}>
            <UserPlus size={16} />
            {saving ? 'Adicionando...' : 'Adicionar'}
          </Button>
        </ModalActions>
      </Form>
    </>
  );
}
