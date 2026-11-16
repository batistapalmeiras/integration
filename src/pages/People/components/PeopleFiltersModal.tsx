// React
import { useState } from 'react';
// Libs
import { MultiSelect, RawSelect, text } from 'bp-kit';
// Components
import { FilterGroup, FiltersSheet } from '../../../components/FiltersSheet';
// Local
import { pickFrom } from '../../../lib/useListParams';
import { INTEGRATION_STATUSES, PersonStatus, STATUS_META } from '../../../types/person';
import { ALL_COHORTS } from '../persistence';

const STATUS_OPTIONS = INTEGRATION_STATUSES.map((value) => ({ value, label: STATUS_META[value].label }));

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

  const noFilters = status.length === 0 && cohort === ALL_COHORTS;

  const apply = () => {
    onApply(status, cohort);
    close();
  };

  const clear = () => {
    onApply([], ALL_COHORTS);
    close();
  };

  return (
    <FiltersSheet close={close} onApply={apply} onClear={clear} canClear={!noFilters}>
      <FilterGroup>
        <MultiSelect
          label={text.fields.status}
          options={STATUS_OPTIONS}
          value={status}
          onChange={(value) => setStatus(pickFrom(value, INTEGRATION_STATUSES))}
          placeholder="Buscar pelo status…"
        />

        <RawSelect label="Turma" value={cohort} onChange={(e) => setCohort(e.target.value)}>
          <option value={ALL_COHORTS}>Todas</option>
          {cohortNames.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </RawSelect>
      </FilterGroup>
    </FiltersSheet>
  );
}
