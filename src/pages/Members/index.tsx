// React
import { useNavigate } from 'react-router-dom';
// Libs
import { Empty, PageHeader, Skeleton, text, useAuthCtx } from 'bp-kit';
// Local
import { Table, TableWrapper, Td, Th, Tr } from '../../components/Table';
import { MEMBERSHIP_STATUS_LABELS } from '../../domain/memberRecords';
import { AppRoute } from '../../routes/paths';
import { UserRole } from '../../types/enums';
import { ENTRY_TYPE_LABELS } from '../../types/church';
import { useMembers } from './hooks/useMembers';

export function MembersPage() {
  const navigate = useNavigate();
  const { user } = useAuthCtx();
  const { members, loading, error } = useMembers();
  const canOpenRecord = user?.role === UserRole.Pastor;

  return (
    <div>
      <PageHeader title="Membros" back />

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
                <Th $shrink>Situação</Th>
                <Th $shrink $hideOnMobile>
                  Forma de entrada
                </Th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <Tr
                  key={member.id}
                  $clickable={canOpenRecord}
                  onClick={canOpenRecord ? () => navigate(`${AppRoute.Members}/${member.id}/ficha`) : undefined}
                >
                  <Td $truncate title={member.name}>
                    {member.name}
                  </Td>
                  <Td $shrink>{MEMBERSHIP_STATUS_LABELS[member.membership_status]}</Td>
                  <Td $shrink $hideOnMobile>
                    {member.entry_type ? ENTRY_TYPE_LABELS[member.entry_type] : '—'}
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
