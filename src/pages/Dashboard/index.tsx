// React
import { ComponentType } from 'react';
// Local
import { useRole } from '../../features/access/useRole';
import { EffectiveRole, UserRole } from '../../types/enums';
import { AdminDashboard } from './views/AdminDashboard';
import { IntegrationTeamDashboard } from './views/IntegrationTeamDashboard';
import { GeneralAdminDashboard } from './views/GeneralAdminDashboard';
import { TeacherDashboard } from './views/TeacherDashboard';

const DASHBOARD_BY_ROLE: Record<EffectiveRole, ComponentType> = {
  [UserRole.GeneralAdmin]: GeneralAdminDashboard,
  [UserRole.Admin]: AdminDashboard,
  [UserRole.IntegrationTeam]: IntegrationTeamDashboard,
  [UserRole.Teacher]: TeacherDashboard,
};

export function DashboardPage() {
  const role = useRole();
  const Dashboard = DASHBOARD_BY_ROLE[role as EffectiveRole];
  return Dashboard ? <Dashboard /> : null;
}
