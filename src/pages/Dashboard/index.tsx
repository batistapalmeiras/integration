// React
import { ComponentType } from 'react';
// Libs
import { useAuthCtx } from 'bp-kit';
// Local
import { UserRole } from '../../types/enums';
import { AdminDashboard } from './views/AdminDashboard';
import { IntegrationTeamDashboard } from './views/IntegrationTeamDashboard';
import { PastorDashboard } from './views/PastorDashboard';
import { TeacherDashboard } from './views/TeacherDashboard';

const DASHBOARD_BY_ROLE: Record<UserRole, ComponentType> = {
  [UserRole.Pastor]: PastorDashboard,
  [UserRole.Admin]: AdminDashboard,
  [UserRole.IntegrationTeam]: IntegrationTeamDashboard,
  [UserRole.Teacher]: TeacherDashboard,
};

export function DashboardPage() {
  const { user } = useAuthCtx();
  const Dashboard = DASHBOARD_BY_ROLE[user?.role as UserRole];
  return Dashboard ? <Dashboard /> : null;
}
