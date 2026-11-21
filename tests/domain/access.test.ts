// Local
import { DEFAULT_VIEW_ROLE, resolveRole, toViewRole, VIEW_ROLES } from '../../src/domain/access';
import { SystemModule, UserRole } from '../../src/types/enums';

describe('resolveRole', () => {
  it('leaves every role but the developer exactly as it is', () => {
    for (const role of VIEW_ROLES) {
      expect(resolveRole(role, SystemModule.Church, UserRole.Teacher)).toBe(role);
      expect(resolveRole(role, SystemModule.Integration, UserRole.Teacher)).toBe(role);
    }
    expect(resolveRole(undefined, SystemModule.Integration, UserRole.Teacher)).toBeUndefined();
  });

  it('gives the developer the general admin in the church and the chosen view in the integration', () => {
    expect(resolveRole(UserRole.Developer, SystemModule.Church, UserRole.Teacher)).toBe(UserRole.GeneralAdmin);
    expect(resolveRole(UserRole.Developer, SystemModule.Integration, UserRole.Teacher)).toBe(UserRole.Teacher);
    expect(resolveRole(UserRole.Developer, SystemModule.Integration, UserRole.Admin)).toBe(UserRole.Admin);
  });
});

describe('toViewRole', () => {
  it('accepts the four views and falls back to the general admin for anything else', () => {
    for (const role of VIEW_ROLES) expect(toViewRole(role)).toBe(role);
    expect(toViewRole(UserRole.Developer)).toBe(DEFAULT_VIEW_ROLE);
    expect(toViewRole('nonsense')).toBe(DEFAULT_VIEW_ROLE);
    expect(toViewRole(null)).toBe(DEFAULT_VIEW_ROLE);
  });
});
