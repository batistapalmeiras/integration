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

export const ADMIN_MANAGEABLE_ROLES = [UserRole.IntegrationTeam, UserRole.Teacher];
