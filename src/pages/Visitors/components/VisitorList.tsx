// React
import { useNavigate } from 'react-router-dom';
// Libs
import { Pagination, text } from 'bp-kit';
// Components
import { PaginationWrap } from '../../../components/ListLayout';
import { List, ListChevron, ListGrow, ListHeader, ListItem, ListSlot, ListStatusCell } from '../../../components/List';
import { StatusPill } from '../../../components/StatusPill';
// Local
import { Person } from '../../../features/visitors';
import { AppRoute } from '../../../routes/paths';
import { RowButton, RowText } from '../styles';

interface Props {
  rows: Person[];
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function VisitorList({ rows, page, totalPages, onPageChange }: Props) {
  const navigate = useNavigate();

  return (
    <>
      <List>
        <ListHeader aria-hidden="true">
          <ListGrow>{text.fields.name}</ListGrow>
          <ListStatusCell>{text.fields.status}</ListStatusCell>
          <ListSlot $width={16} />
        </ListHeader>
        {rows.map((person) => (
          <ListItem key={person.id}>
            <RowButton type="button" onClick={() => navigate(`${AppRoute.Visitors}/${person.id}`)}>
              <RowText>{person.name}</RowText>
              <ListStatusCell>
                <StatusPill person={person} compact />
              </ListStatusCell>
              <ListChevron />
            </RowButton>
          </ListItem>
        ))}
      </List>

      {totalPages > 1 && (
        <PaginationWrap>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={onPageChange} />
        </PaginationWrap>
      )}
    </>
  );
}
