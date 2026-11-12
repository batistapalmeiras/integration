// React
import { useParams } from 'react-router-dom';
// Local
import { isEntityId } from './paths';
import { ProtectedRoute } from './ProtectedRoute';
import { RouteTarget } from './table';

interface Props {
  detail: RouteTarget;
  list: RouteTarget;
}

export function IdOrListRoute({ detail, list }: Props) {
  const { id } = useParams();
  const target = isEntityId(id) ? detail : list;
  return <ProtectedRoute roles={target.roles}>{target.element}</ProtectedRoute>;
}
