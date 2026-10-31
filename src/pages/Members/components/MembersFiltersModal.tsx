// React
import { FormEvent, useState } from 'react';
// Libs
import { Button, Form, LinkButton, ModalActions, ModalTitle, MultiSelect } from 'bp-kit';
import { FilterX } from 'lucide-react';
// Local
import { MEMBERSHIP_STATUS_LABELS, MembershipStatus } from '../../../domain/memberRecords';
import { ENTRY_TYPE_LABELS, EntryType } from '../../../types/church';

const STATUS_OPTIONS = Object.entries(MEMBERSHIP_STATUS_LABELS).map(([value, label]) => ({ value, label }));
const ENTRY_TYPE_OPTIONS = Object.entries(ENTRY_TYPE_LABELS).map(([value, label]) => ({ value, label }));

interface Props {
  close: () => void;
  membershipStatusFilter: MembershipStatus[];
  entryTypeFilter: EntryType[];
  onApply: (membershipStatusFilter: MembershipStatus[], entryTypeFilter: EntryType[]) => void;
}

export function MembersFiltersModal({ close, membershipStatusFilter, entryTypeFilter, onApply }: Props) {
  const [status, setStatus] = useState(membershipStatusFilter);
  const [entryType, setEntryType] = useState(entryTypeFilter);

  const apply = () => {
    onApply(status, entryType);
    close();
  };

  const clear = () => {
    onApply([], []);
    close();
  };

  return (
    <>
      <ModalTitle onClose={close}>Filtros</ModalTitle>

      <Form onSubmit={(e: FormEvent) => e.preventDefault()}>
        <MultiSelect
          label="Situação"
          options={STATUS_OPTIONS}
          value={status}
          onChange={(value) => setStatus(value as MembershipStatus[])}
          placeholder="Buscar situação…"
        />

        <MultiSelect
          label="Forma de entrada"
          options={ENTRY_TYPE_OPTIONS}
          value={entryType}
          onChange={(value) => setEntryType(value as EntryType[])}
          placeholder="Buscar forma de entrada…"
        />

        <ModalActions>
          <Button type="button" variant="primary" onClick={apply}>
            Aplicar
          </Button>
          <LinkButton
            icon={<FilterX size={16} />}
            onClick={clear}
            disabled={status.length === 0 && entryType.length === 0}
          >
            Limpar
          </LinkButton>
        </ModalActions>
      </Form>
    </>
  );
}
