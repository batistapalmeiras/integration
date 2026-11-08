// Local
import { keyParser } from '../lib/parse';

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

export enum SystemModule {
  Church = 'church',
  Integration = 'integration',
}

const MODULE_LABELS: Record<SystemModule, string> = {
  [SystemModule.Church]: 'Igreja',
  [SystemModule.Integration]: 'Integração',
};

const ROLE_MODULE: Record<UserRole, SystemModule> = {
  [UserRole.Pastor]: SystemModule.Church,
  [UserRole.Admin]: SystemModule.Integration,
  [UserRole.IntegrationTeam]: SystemModule.Integration,
  [UserRole.Teacher]: SystemModule.Integration,
};

export function groupRolesByModule(roles: UserRole[]): { module: SystemModule; label: string; roles: UserRole[] }[] {
  return Object.values(SystemModule)
    .map((module) => ({
      module,
      label: MODULE_LABELS[module],
      roles: roles.filter((role) => ROLE_MODULE[role] === module),
    }))
    .filter((group) => group.roles.length > 0);
}

export const ADMIN_MANAGEABLE_ROLES = [UserRole.IntegrationTeam, UserRole.Teacher];

export const LEADERSHIP_ROLES = [UserRole.Admin, UserRole.Pastor];
export const INTEGRATION_TEAM_ROLES = [UserRole.IntegrationTeam, ...LEADERSHIP_ROLES];
export const TEACHING_ROLES = [UserRole.Teacher, ...LEADERSHIP_ROLES];
export const STAFF_ROLES = [UserRole.IntegrationTeam, UserRole.Teacher, ...LEADERSHIP_ROLES];

export function hasRole(role: string | undefined, roles: UserRole[]): boolean {
  return roles.includes(role as UserRole);
}

export const toUserRole = keyParser(ROLE_LABELS, 'Papel');
