// React
import { useNavigate } from 'react-router-dom';
// Libs
import { Empty, Skeleton, text } from 'bp-kit';
// Components
import { PageHeader } from '../../../components/PageHeader';
// Local
import { Table, TableWrapper, Td, Th, Tr } from '../../../components/Table';
import { formatDate } from '../../../domain/dates';
import { errorMessage } from '../../../lib/queryCache';
import { useCouncils } from '../../../queries/councils';
import { councilPath } from '../../../routes/paths';

export function CouncilsPage() {
  const navigate = useNavigate();
  const { data: councils, loading, error } = useCouncils();
  const loadError = errorMessage(error);

  return (
    <div>
      <PageHeader title="Histórico de conselhos" back />

      {loading && <Skeleton $h="180px" />}

      {!loading && loadError && <Empty title={text.feedback.loadError} description={loadError} />}

      {!loading && !loadError && councils?.length === 0 && (
        <Empty title="Nenhum conselho criado" description='Crie um conselho em Membresia, no botão "Novo conselho".' />
      )}

      {!loading && !loadError && councils && councils.length > 0 && (
        <TableWrapper>
          <Table>
            <thead>
              <tr>
                <Th>Conselho</Th>
                <Th $shrink>Aprovados</Th>
              </tr>
            </thead>
            <tbody>
              {councils.map((council) => (
                <Tr key={council.id} $clickable onClick={() => navigate(councilPath(council.id))}>
                  <Td>{formatDate(council.meetingDate)}</Td>
                  <Td $shrink>{council.members.length}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </TableWrapper>
      )}
    </div>
  );
}
