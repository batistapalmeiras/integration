// Local
import { EffectiveRole, SystemModule, UserRole } from '../types/enums';

export const VIEW_ROLES: EffectiveRole[] = [
  UserRole.GeneralAdmin,
  UserRole.Admin,
  UserRole.IntegrationTeam,
  UserRole.Teacher,
];

export const DEFAULT_VIEW_ROLE: EffectiveRole = UserRole.GeneralAdmin;

export function resolveRole(
  role: string | undefined,
  module: SystemModule,
  viewRole: EffectiveRole,
): string | undefined {
  if (role !== UserRole.Developer) return role;
  return module === SystemModule.Church ? UserRole.GeneralAdmin : viewRole;
}

export function toViewRole(value: unknown): EffectiveRole {
  return VIEW_ROLES.find((role) => role === value) ?? DEFAULT_VIEW_ROLE;
}
