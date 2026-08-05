export enum UserRole {
  Admin = 'admin',
  IntegrationTeam = 'integration_team',
  Pastor = 'pastor',
  Reception = 'reception',
  Teacher = 'teacher',
}

export const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.Admin]: 'Administrador',
  [UserRole.IntegrationTeam]: 'Equipe de Integração',
  [UserRole.Pastor]: 'Pastor',
  [UserRole.Reception]: 'Recepção',
  [UserRole.Teacher]: 'Professor',
};
