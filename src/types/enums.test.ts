// Local
import { hasRole, INTEGRATION_TEAM_ROLES, LEADERSHIP_ROLES, STAFF_ROLES, TEACHING_ROLES, UserRole } from './enums';

describe('role groups', () => {
  it('lets admin and pastor into every group', () => {
    [LEADERSHIP_ROLES, INTEGRATION_TEAM_ROLES, TEACHING_ROLES, STAFF_ROLES].forEach((group) => {
      expect(hasRole(UserRole.Admin, group)).toBe(true);
      expect(hasRole(UserRole.Pastor, group)).toBe(true);
    });
  });

  it('keeps the integration team and teachers to their own work', () => {
    expect(hasRole(UserRole.IntegrationTeam, INTEGRATION_TEAM_ROLES)).toBe(true);
    expect(hasRole(UserRole.IntegrationTeam, TEACHING_ROLES)).toBe(false);
    expect(hasRole(UserRole.Teacher, TEACHING_ROLES)).toBe(true);
    expect(hasRole(UserRole.Teacher, INTEGRATION_TEAM_ROLES)).toBe(false);
    expect(hasRole(UserRole.Teacher, LEADERSHIP_ROLES)).toBe(false);
  });

  it('lets no one in without a role', () => {
    expect(hasRole(undefined, STAFF_ROLES)).toBe(false);
  });
});
