// Local
import { UserRole } from '../types/enums';
import { assignableRoles, canChangeRole } from './volunteerRoles';

const pastor = { id: 'p', role: UserRole.Pastor };
const admin = { id: 'a', role: UserRole.Admin };
const teacher = { id: 't', role: UserRole.Teacher };
const team = { id: 'e', role: UserRole.IntegrationTeam };
const otherAdmin = { id: 'a2', role: UserRole.Admin };

describe('canChangeRole', () => {
  it('lets the pastor move anyone but himself to any role', () => {
    expect(canChangeRole(pastor, otherAdmin, UserRole.Pastor)).toBe(true);
    expect(canChangeRole(pastor, team, UserRole.Admin)).toBe(true);
    expect(canChangeRole(pastor, pastor, UserRole.Admin)).toBe(false);
  });

  it('lets the admin move only teachers and the integration team between those two roles', () => {
    expect(canChangeRole(admin, team, UserRole.Teacher)).toBe(true);
    expect(canChangeRole(admin, teacher, UserRole.Admin)).toBe(false);
    expect(canChangeRole(admin, otherAdmin, UserRole.Teacher)).toBe(false);
    expect(canChangeRole(admin, admin, UserRole.Teacher)).toBe(false);
  });

  it('does not let the other roles move anyone, nor treat dropping on the same role as a change', () => {
    expect(canChangeRole(teacher, team, UserRole.Teacher)).toBe(false);
    expect(canChangeRole(pastor, team, UserRole.IntegrationTeam)).toBe(false);
  });
});

describe('assignableRoles', () => {
  it('gives the pastor every role and the admin only teacher and integration team', () => {
    expect(assignableRoles(UserRole.Pastor)).toEqual(Object.values(UserRole));
    expect(assignableRoles(UserRole.Admin)).toEqual([UserRole.IntegrationTeam, UserRole.Teacher]);
    expect(assignableRoles(UserRole.Teacher)).toEqual([]);
  });
});
