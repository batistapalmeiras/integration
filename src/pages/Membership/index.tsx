// React
import { useNavigate } from 'react-router-dom';
// Libs
import { Empty, PageHeader, Skeleton, text } from 'bp-kit';
import { AlertTriangle } from 'lucide-react';
// Components
import { PeopleCount } from '../../components/PeopleCount';
import { Table, TableWrapper, Td, Th, Tr } from '../../components/Table';
import { formatTimestampDate } from '../../domain/dates';
import { AppRoute } from '../../routes/paths';
import { ENTRY_TYPE_LABELS } from '../../types/church';
// Local
import { useMembershipQueue } from './hooks/useMembershipQueue';
import { NameCell, NameText, ReviewFlag, Subline } from './styles';

export function MembershipPage() {
  const navigate = useNavigate();
  const { rows, loading, error } = useMembershipQueue();

  return (
    <div>
      <PageHeader title="Membresia" />

      {loading && <Skeleton $h="240px" />}

      {!loading && error && <Empty title={text.feedback.loadError} description={error} />}

      {!loading && !error && rows.length === 0 && (
        <Empty
          title="Ninguém aguardando o Conselho"
          description="Quem concluir as aulas e preencher a ficha aparece aqui."
        />
      )}

      {!loading && !error && rows.length > 0 && (
        <>
          <PeopleCount count={rows.length} />
          <TableWrapper>
            <Table>
              <thead>
                <tr>
                  <Th>{text.fields.name}</Th>
                  <Th $hideOnMobile>Turma</Th>
                  <Th $shrink>Forma de entrada</Th>
                  <Th $shrink $hideOnMobile>
                    Ficha
                  </Th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <Tr key={row.id} $clickable onClick={() => navigate(`${AppRoute.Visitors}/${row.id}/detalhes?tab=membership&from=membership`)}>
                    <Td $truncate title={row.name}>
                      <NameCell>
                        <NameText>{row.name}</NameText>
                        {row.originChurch && <Subline>{row.originChurch}</Subline>}
                        {row.reviewReasons.map((reason) => (
                          <ReviewFlag key={reason}>
                            <AlertTriangle size={12} />
                            {reason}
                          </ReviewFlag>
                        ))}
                      </NameCell>
                    </Td>
                    <Td $hideOnMobile>{row.cohortName ?? '—'}</Td>
                    <Td $shrink>{row.entryType ? ENTRY_TYPE_LABELS[row.entryType] : '—'}</Td>
                    <Td $shrink $hideOnMobile>
                      {row.statuteAgreedAt ? formatTimestampDate(row.statuteAgreedAt) : '—'}
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </TableWrapper>
        </>
      )}
    </div>
  );
}
