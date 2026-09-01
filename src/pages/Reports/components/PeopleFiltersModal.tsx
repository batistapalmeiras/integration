// React
import { FormEvent, useState } from 'react';
// Libs
import { Button, Form, ModalActions, ModalTitle, MultiSelect, RawSelect, text } from 'bp-kit';
// Local
import { PersonStatus, STATUS_META } from '../../../types/person';

const STATUS_OPTIONS = Object.entries(STATUS_META).map(([value, meta]) => ({ value, label: meta.label }));

interface Props {
  close: () => void;
  statusFilter: PersonStatus[];
  cohortFilter: string;
  cohortNames: string[];
  onApply: (statusFilter: PersonStatus[], cohortFilter: string) => void;
}

export function PeopleFiltersModal({ close, statusFilter, cohortFilter, cohortNames, onApply }: Props) {
  const [status, setStatus] = useState(statusFilter);
  const [cohort, setCohort] = useState(cohortFilter);
  const [statusError, setStatusError] = useState<string | undefined>();

  const noFilters = status.length === 0 && cohort === 'all';

  const apply = () => {
    if (status.length === 0) {
      setStatusError('Selecione pelo menos um status');
      return;
    }
    onApply(status, cohort);
    close();
  };

  const clear = () => {
    onApply([], 'all');
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
          onChange={(value) => {
            setStatus(value as PersonStatus[]);
            setStatusError(undefined);
          }}
          placeholder="Buscar status…"
          error={statusError}
        />

        <RawSelect label="Turma" value={cohort} onChange={(e) => setCohort(e.target.value)}>
          <option value="all">Todas</option>
          {cohortNames.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </RawSelect>

        <ModalActions>
          <Button type="button" variant="secondary" onClick={clear} disabled={noFilters}>
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
