// Local
import { ADMIN_MANAGEABLE_ROLES, UserRole } from '../types/enums';

interface RoleHolder {
  id: string;
  role: string;
}

export function assignableRoles(actorRole: string | undefined): UserRole[] {
  if (actorRole === UserRole.Pastor) return Object.values(UserRole);
  if (actorRole === UserRole.Admin) return ADMIN_MANAGEABLE_ROLES;
  return [];
}

export function canChangeRole(actor: RoleHolder, volunteer: RoleHolder, target: UserRole): boolean {
  const roles = assignableRoles(actor.role);
  return (
    actor.id !== volunteer.id &&
    volunteer.role !== target &&
    roles.includes(volunteer.role as UserRole) &&
    roles.includes(target)
  );
}

export function defaultVolunteerPassword(): string {
  return `BatistaPalmeiras@${new Date().getFullYear()}`;
}
