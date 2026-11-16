// React
import { useState } from 'react';
// Libs
import { MultiSelect, SegmentedControl } from 'bp-kit';
// Components
import { FilterGroup, FiltersSheet } from '../../../components/FiltersSheet';
import { SwitchRow } from '../../../components/SwitchRow';
// Local
import { AGE_GROUPS, AGE_GROUP_NAMES, ageGroupLabel } from '../../../domain/ageGroups';
import { MEMBER_FLAG_FILTER_HINTS, MEMBER_FLAG_LABELS, MEMBER_FLAGS, MemberFlag } from '../../../domain/memberFlags';
import { pickKeys } from '../../../lib/useListParams';
import { MemberFilters } from '../hooks/useMembers';
import {
  GENDER_LABELS,
  GENDER_OPTIONS,
  MARITAL_STATUS_LABELS,
  MARITAL_STATUS_OPTIONS,
  MEMBERSHIP_STATUS_LABELS,
} from '../../../domain/memberRecords';
import { toOptions } from '../../../domain/text';
import { ENTRY_TYPE_LABELS } from '../../../types/church';

const STATUS_OPTIONS = toOptions(MEMBERSHIP_STATUS_LABELS);
const ENTRY_TYPE_OPTIONS = toOptions(ENTRY_TYPE_LABELS);
const ALL_GENDERS = 'all';
const GENDER_CHOICES = [{ value: ALL_GENDERS, label: 'Todos' }, ...GENDER_OPTIONS];
const AGE_GROUP_OPTIONS = AGE_GROUPS.map((group) => ({ value: group, label: ageGroupLabel(group) }));
const NO_FILTERS: MemberFilters = {
  status: [],
  entryType: [],
  gender: [],
  maritalStatus: [],
  ageGroup: [],
  flag: [],
};

interface Props {
  close: () => void;
  filters: MemberFilters;
  onApply: (filters: MemberFilters) => void;
}

export function MembersFiltersModal({ close, filters, onApply }: Props) {
  const [draft, setDraft] = useState(filters);

  const change = <K extends keyof MemberFilters>(key: K, values: MemberFilters[K]) =>
    setDraft((current) => ({ ...current, [key]: values }));

  const toggleFlag = (item: MemberFlag) =>
    change('flag', draft.flag.includes(item) ? draft.flag.filter((value) => value !== item) : [...draft.flag, item]);

  const apply = () => {
    onApply(draft);
    close();
  };

  const clear = () => {
    onApply(NO_FILTERS);
    close();
  };

  return (
    <FiltersSheet
      close={close}
      onApply={apply}
      onClear={clear}
      canClear={Object.values(draft).some((values) => values.length > 0)}
    >
      <FilterGroup title="Membresia">
        <MultiSelect
          label="Situação"
          options={STATUS_OPTIONS}
          value={draft.status}
          onChange={(value) => change('status', pickKeys(value, MEMBERSHIP_STATUS_LABELS))}
          emptyText="Todas"
          searchable={false}
        />

        {MEMBER_FLAGS.map((item) => (
          <SwitchRow
            key={item}
            title={MEMBER_FLAG_LABELS[item]}
            hint={MEMBER_FLAG_FILTER_HINTS[item]}
            checked={draft.flag.includes(item)}
            onChange={() => toggleFlag(item)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Chegada à igreja">
        <MultiSelect
          label="Forma de entrada"
          options={ENTRY_TYPE_OPTIONS}
          value={draft.entryType}
          onChange={(value) => change('entryType', pickKeys(value, ENTRY_TYPE_LABELS))}
          emptyText="Todas"
          searchable={false}
        />
      </FilterGroup>

      <FilterGroup title="Dados pessoais">
        <SegmentedControl
          label="Sexo"
          options={GENDER_CHOICES}
          value={draft.gender[0] ?? ALL_GENDERS}
          onChange={(value) => change('gender', pickKeys([value], GENDER_LABELS))}
        />

        <MultiSelect
          label="Estado civil"
          options={MARITAL_STATUS_OPTIONS}
          value={draft.maritalStatus}
          onChange={(value) => change('maritalStatus', pickKeys(value, MARITAL_STATUS_LABELS))}
          emptyText="Todos"
          searchable={false}
        />

        <MultiSelect
          label="Faixa etária"
          options={AGE_GROUP_OPTIONS}
          value={draft.ageGroup}
          onChange={(value) => change('ageGroup', pickKeys(value, AGE_GROUP_NAMES))}
          emptyText="Todas"
          searchable={false}
        />
      </FilterGroup>
    </FiltersSheet>
  );
}
