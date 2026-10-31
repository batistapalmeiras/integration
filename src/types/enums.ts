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

export const LEADERSHIP_ROLES = [UserRole.Admin, UserRole.Pastor];
export const INTEGRATION_TEAM_ROLES = [UserRole.IntegrationTeam, ...LEADERSHIP_ROLES];
export const TEACHING_ROLES = [UserRole.Teacher, ...LEADERSHIP_ROLES];
export const STAFF_ROLES = [UserRole.IntegrationTeam, UserRole.Teacher, ...LEADERSHIP_ROLES];

export function hasRole(role: string | undefined, roles: UserRole[]): boolean {
  return roles.includes(role as UserRole);
}
