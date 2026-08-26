// Libs
import { ChevronRight } from 'lucide-react';
import { Card, Typography } from 'bp-kit';
// Local
import { Person } from '../../types';
import { PersonCardInfo, PersonCardRow } from '../styles';

interface Props {
  person: Person;
  coffeeDate: string | null;
  cohortName: string | null;
  onClick: () => void;
}

export function PersonDetailsCard({ person, coffeeDate, cohortName, onClick }: Props) {
  const hasDetails = !!cohortName || !!coffeeDate || !!person.small_group_id || !!person.ministry_id;
  if (!hasDetails) return null;

  return (
    <Card $hoverable onClick={onClick} role="button" tabIndex={0}>
      <PersonCardRow>
        <PersonCardInfo>
          <Typography type="h6">Detalhes</Typography>
          <Typography type="caption">Turma, café e comunidade</Typography>
        </PersonCardInfo>
        <ChevronRight size={18} />
      </PersonCardRow>
    </Card>
  );
}
