// React
import { useNavigate } from 'react-router-dom';
// Libs
import { Empty, Skeleton, text } from 'bp-kit';
// Local
import { Table, TableWrapper, Td, Th, Tr } from '../../../components/Table';
import { AppRoute } from '../../../routes/paths';
import { useCohortsReport } from '../hooks';

export function CohortsList() {
  const navigate = useNavigate();
  const { cohorts, loading, error } = useCohortsReport();

  if (loading) return <Skeleton $h="180px" />;
  if (error) return <Empty title={text.feedback.loadError} description={error} />;
  if (cohorts.length === 0) return <Empty title="Nenhuma turma cadastrada" description="Turmas criadas aparecerão aqui." />;

  return (
    <TableWrapper>
      <Table>
        <thead>
          <tr>
            <Th>Turma</Th>
            <Th>{text.fields.status}</Th>
            <Th>Matriculados</Th>
          </tr>
        </thead>
        <tbody>
          {cohorts.map((cohort) => (
            <Tr key={cohort.id} $clickable onClick={() => navigate(`${AppRoute.Reports}/turmas/${cohort.id}`)}>
              <Td>{cohort.name}</Td>
              <Td>{cohort.status === 'active' ? 'Ativa' : 'Encerrada'}</Td>
              <Td>{cohort.enrollmentCount}</Td>
            </Tr>
          ))}
        </tbody>
      </Table>
    </TableWrapper>
  );
}
