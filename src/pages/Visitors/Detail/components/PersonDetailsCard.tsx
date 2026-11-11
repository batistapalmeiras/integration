// Libs
import { ChevronRight } from 'lucide-react';
import { Card, Typography } from 'bp-kit';
// Local
import { hasPersonDetails, Person } from '../../../../features/visitors';
import { PersonProfileSummary } from '../../../../repositories/people';
import { PersonCardInfo, PersonCardRow } from '../styles';

interface Props {
  person: Person;
  profile: PersonProfileSummary;
  onClick: () => void;
}

export function PersonDetailsCard({ person, profile, onClick }: Props) {
  if (!hasPersonDetails(person, profile)) return null;

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
