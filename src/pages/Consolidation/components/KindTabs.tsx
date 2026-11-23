// Libs
import { SegmentedControl } from 'bp-kit';
// Local
import { CONSOLIDATION_KIND_SECTIONS, ConsolidationKind } from '../../../domain/consolidation';

const KIND_OPTIONS: { value: ConsolidationKind; label: string }[] = [
  { value: 'small_group', label: CONSOLIDATION_KIND_SECTIONS.small_group },
  { value: 'ministry', label: CONSOLIDATION_KIND_SECTIONS.ministry },
];

interface Props {
  value: ConsolidationKind;
  onChange: (kind: ConsolidationKind) => void;
}

export function KindTabs({ value, onChange }: Props) {
  return <SegmentedControl options={KIND_OPTIONS} value={value} onChange={onChange} />;
}
