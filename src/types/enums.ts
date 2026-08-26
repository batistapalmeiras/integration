export enum UserRole {
  Admin = 'admin',
  IntegrationTeam = 'integration_team',
  Pastor = 'pastor',
  Teacher = 'teacher',
}

export const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.Admin]: 'Administrador',
  [UserRole.IntegrationTeam]: 'Equipe de Integração',
  [UserRole.Pastor]: 'Pastor',
  [UserRole.Teacher]: 'Professor',
};

// Admin's own reach is scoped to the integration pipeline's day-to-day
// staff — only Pastor (who "pode fazer tudo") manages Admin/Pastor accounts.
export const ADMIN_MANAGEABLE_ROLES = [UserRole.IntegrationTeam, UserRole.Teacher];
