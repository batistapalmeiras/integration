// React
import { FormEvent, useState } from 'react';
// Libs
import { Button, Form, ModalActions, ModalTitle, RawSelect, text } from 'bp-kit';
// Local
import { PersonStatus, STATUS_META } from '../../../types/person';

interface Props {
  close: () => void;
  statusFilter: 'all' | PersonStatus;
  cohortFilter: string;
  cohortNames: string[];
  onApply: (statusFilter: 'all' | PersonStatus, cohortFilter: string) => void;
}

export function PeopleFiltersModal({ close, statusFilter, cohortFilter, cohortNames, onApply }: Props) {
  const [status, setStatus] = useState(statusFilter);
  const [cohort, setCohort] = useState(cohortFilter);

  const apply = () => {
    onApply(status, cohort);
    close();
  };

  const clear = () => {
    onApply('all', 'all');
    close();
  };

  return (
    <>
      <ModalTitle>Filtros</ModalTitle>

      <Form onSubmit={(e: FormEvent) => e.preventDefault()}>
        <RawSelect label={text.fields.status} value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
          <option value="all">Todos</option>
          {Object.entries(STATUS_META).map(([value, meta]) => (
            <option key={value} value={value}>
              {meta.label}
            </option>
          ))}
        </RawSelect>

        <RawSelect label="Turma" value={cohort} onChange={(e) => setCohort(e.target.value)}>
          <option value="all">Todas</option>
          {cohortNames.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </RawSelect>

        <ModalActions>
          <Button type="button" variant="secondary" onClick={clear}>
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
