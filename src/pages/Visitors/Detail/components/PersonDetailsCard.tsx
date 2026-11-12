// Libs
import { ChevronRight } from 'lucide-react';
import { Card, Typography } from 'bp-kit';
// Local
import { DETAIL_TAB_LABELS, Person, useDetailTabs } from '../../../../features/visitors';
import { PersonCardInfo, PersonCardRow } from '../styles';

interface Props {
  person: Person;
  onClick: () => void;
}

export function PersonDetailsCard({ person, onClick }: Props) {
  const { tabs } = useDetailTabs(person);
  if (tabs.length === 0) return null;

  return (
    <Card $hoverable onClick={onClick} role="button" tabIndex={0}>
      <PersonCardRow>
        <PersonCardInfo>
          <Typography type="h6">Detalhes</Typography>
          <Typography type="caption">{tabs.map((tab) => DETAIL_TAB_LABELS[tab]).join(' · ')}</Typography>
        </PersonCardInfo>
        <ChevronRight size={18} />
      </PersonCardRow>
    </Card>
  );
}
