// Libs
import { Card, Typography } from 'bp-kit';
// Local
import { formatDate } from '../../../../domain/dates';
import { Person } from '../../types';
import { CardHeader, DetailLabel, DetailRow, DetailsList, DetailValue } from '../styles';

interface Props {
  person: Person;
  coffeeDate: string | null;
  cohortName: string | null;
}

export function PersonDetailsCard({ person, coffeeDate, cohortName }: Props) {
  const rows = [
    cohortName && { label: 'Turma', value: cohortName },
    coffeeDate && { label: 'Café', value: formatDate(coffeeDate) },
    person.small_group && { label: 'PG', value: person.small_group },
    person.ministry && { label: 'Ministério', value: person.ministry },
  ].filter((row): row is { label: string; value: string } => !!row);

  if (rows.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <Typography type="label">Detalhes</Typography>
      </CardHeader>
      <DetailsList>
        {rows.map((row) => (
          <DetailRow key={row.label}>
            <DetailLabel>{row.label}</DetailLabel>
            <DetailValue>{row.value}</DetailValue>
          </DetailRow>
        ))}
      </DetailsList>
    </Card>
  );
}
