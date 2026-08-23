// Libs
import { ChevronRight } from 'lucide-react';
import { Card, Typography } from 'bp-kit';
// Local
import { StatusPill } from '../../../../components/StatusPill';
import { Person } from '../../types';
import { PersonCardRow, PersonCardInfo } from '../styles';

interface Props {
  person: Person;
  onClick: () => void;
}

export function PersonCard({ person, onClick }: Props) {
  return (
    <Card $hoverable onClick={onClick} role="button" tabIndex={0}>
      <PersonCardRow>
        <PersonCardInfo>
          <Typography type="h6">{person.name}</Typography>
          <Typography type="caption">{person.phone}</Typography>
        </PersonCardInfo>
        <StatusPill status={person.status} />
        <ChevronRight size={18} />
      </PersonCardRow>
    </Card>
  );
}
