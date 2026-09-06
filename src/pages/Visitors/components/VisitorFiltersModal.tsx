// React
import { FormEvent, useState } from 'react';
// Libs
import { Button, Form, ModalActions, ModalTitle, MultiSelect, text } from 'bp-kit';
// Local
import { PersonStatus, STATUS_META } from '../../../types/person';

const VISIBLE_STATUSES: PersonStatus[] = ['initial_contact', 'retry_contact', 'archived'];
const STATUS_OPTIONS = VISIBLE_STATUSES.map((value) => ({ value, label: STATUS_META[value].label }));

interface Props {
  close: () => void;
  statusFilter: PersonStatus[];
  onApply: (statusFilter: PersonStatus[]) => void;
}

export function VisitorFiltersModal({ close, statusFilter, onApply }: Props) {
  const [status, setStatus] = useState(statusFilter);

  const apply = () => {
    onApply(status);
    close();
  };

  const clear = () => {
    onApply([]);
    close();
  };

  return (
    <>
      <ModalTitle onClose={close}>Filtros</ModalTitle>

      <Form onSubmit={(e: FormEvent) => e.preventDefault()}>
        <MultiSelect
          label={text.fields.status}
          options={STATUS_OPTIONS}
          value={status}
          onChange={(value) => setStatus(value as PersonStatus[])}
          placeholder="Buscar status…"
        />

        <ModalActions>
          <Button type="button" variant="secondary" onClick={clear} disabled={status.length === 0}>
            Limpar
          </Button>
          <Button type="button" variant="primary" onClick={apply}>
            Aplicar
          </Button>
        </ModalActions>
      </Form>
    </>
  );
}
