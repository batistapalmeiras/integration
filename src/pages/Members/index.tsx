// React
import { useNavigate } from 'react-router-dom';
// Libs
import { Empty, PageHeader, Skeleton, text } from 'bp-kit';
// Local
import { Table, TableWrapper, Td, Th, Tr } from '../../components/Table';
import { AppRoute } from '../../routes/paths';
import { ENTRY_TYPE_LABELS } from '../../types/church';
import { useMembers } from './hooks/useMembers';

export function MembersPage() {
  const navigate = useNavigate();
  const { members, loading, error } = useMembers();

  return (
    <div>
      <PageHeader title="Membros" subtitle="Nome completo e forma de entrada" back />

      {loading && <Skeleton $h="240px" />}

      {!loading && error && <Empty title={text.feedback.loadError} description={error} />}

      {!loading && !error && members.length === 0 && (
        <Empty title="Nenhum membro confirmado ainda" description="Membros confirmados aparecerão aqui." />
      )}

      {!loading && !error && members.length > 0 && (
        <TableWrapper>
          <Table>
            <thead>
              <tr>
                <Th>{text.fields.name}</Th>
                <Th>Forma de entrada</Th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <Tr key={member.id} $clickable onClick={() => navigate(`${AppRoute.Visitors}/${member.id}`)}>
                  <Td data-label={text.fields.name}>{member.name}</Td>
                  <Td data-label="Forma de entrada">{member.entry_type ? ENTRY_TYPE_LABELS[member.entry_type] : '—'}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </TableWrapper>
      )}
    </div>
  );
}
