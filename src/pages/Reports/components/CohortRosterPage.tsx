// React
import { useNavigate, useParams } from 'react-router-dom';
// Libs
import { Button, Empty, PageHeader, Skeleton, text } from 'bp-kit';
// Local
import { StatusPill } from '../../../components/StatusPill';
import { Table, TableWrapper, Td, Th, Tr } from '../../../components/Table';
import { AppRoute } from '../../../routes/paths';
import { useCohortRoster } from '../hooks';
import { CountBadge, NameCell, NamePrimary, NameSubtitle } from '../styles';

export function CohortRosterPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { cohort, roster, loading, error, closeCohort } = useCohortRoster(id ?? '');

  if (loading) return <Skeleton $h="320px" />;
  if (error || !cohort) return <Empty title="Turma não encontrada" description={error ?? ''} />;

  return (
    <div>
      <PageHeader
        title={cohort.name}
        subtitle={cohort.status === 'active' ? 'Turma ativa' : 'Turma encerrada'}
        back
        action={
          cohort.status === 'active' ? (
            <Button variant="secondary" onClick={closeCohort}>
              Encerrar turma
            </Button>
          ) : undefined
        }
      />

      {roster.length === 0 ? (
        <Empty title="Ninguém matriculado" description="Essa turma não teve matrículas." />
      ) : (
        <TableWrapper>
          <Table>
            <thead>
              <tr>
                <Th>{text.fields.name}</Th>
                <Th>{text.fields.status}</Th>
                <Th $hideOnMobile>Presenças</Th>
              </tr>
            </thead>
            <tbody>
              {roster.map((row) => (
                <Tr key={row.enrollmentId} $clickable onClick={() => navigate(`${AppRoute.Visitors}/${row.personId}`)}>
                  <Td $truncate>
                    <NameCell>
                      <NamePrimary title={row.name}>{row.name}</NamePrimary>
                      <NameSubtitle>
                        {row.lessonsAttended}/{row.totalLessons} presenças
                      </NameSubtitle>
                    </NameCell>
                  </Td>
                  <Td $shrink>
                    <StatusPill person={row} compact />
                  </Td>
                  <Td $hideOnMobile $shrink>
                    <CountBadge $eligible={row.lessonsAttended >= 3}>
                      {row.lessonsAttended}/{row.totalLessons}
                    </CountBadge>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </TableWrapper>
      )}
    </div>
  );
}
