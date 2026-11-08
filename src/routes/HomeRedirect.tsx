// React
import { Navigate } from 'react-router-dom';
// Local
import { AppRoute } from './paths';

export function homeRouteFor(): AppRoute {
  return AppRoute.Dashboard;
}

export function HomeRedirect() {
  return <Navigate to={homeRouteFor()} replace />;
}
