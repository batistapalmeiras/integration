// Local
import { UserRole } from '../../src/types/enums';
import { assignableRoles, canChangeRole } from '../../src/domain/volunteers';

const generalAdmin = { id: 'p', role: UserRole.GeneralAdmin };
const admin = { id: 'a', role: UserRole.Admin };
const teacher = { id: 't', role: UserRole.Teacher };
const team = { id: 'e', role: UserRole.IntegrationTeam };
const otherAdmin = { id: 'a2', role: UserRole.Admin };

describe('canChangeRole', () => {
  it('lets the general admin move anyone but himself to any role', () => {
    expect(canChangeRole(generalAdmin, otherAdmin, UserRole.GeneralAdmin)).toBe(true);
    expect(canChangeRole(generalAdmin, team, UserRole.Admin)).toBe(true);
    expect(canChangeRole(generalAdmin, generalAdmin, UserRole.Admin)).toBe(false);
  });

  it('lets the admin move only teachers and the integration team between those two roles', () => {
    expect(canChangeRole(admin, team, UserRole.Teacher)).toBe(true);
    expect(canChangeRole(admin, teacher, UserRole.Admin)).toBe(false);
    expect(canChangeRole(admin, otherAdmin, UserRole.Teacher)).toBe(false);
    expect(canChangeRole(admin, admin, UserRole.Teacher)).toBe(false);
  });

  it('does not let the other roles move anyone, nor treat dropping on the same role as a change', () => {
    expect(canChangeRole(teacher, team, UserRole.Teacher)).toBe(false);
    expect(canChangeRole(generalAdmin, team, UserRole.IntegrationTeam)).toBe(false);
  });
});

describe('assignableRoles', () => {
  it('gives the general admin every role and the admin only teacher and integration team', () => {
    expect(assignableRoles(UserRole.GeneralAdmin)).toEqual(Object.values(UserRole));
    expect(assignableRoles(UserRole.Admin)).toEqual([UserRole.IntegrationTeam, UserRole.Teacher]);
    expect(assignableRoles(UserRole.Teacher)).toEqual([]);
  });
});
