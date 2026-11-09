// Local
import { areaItems, NAV_ITEMS, navAreasFor } from '../../src/routes/navigation';
import { AppRoute } from '../../src/routes/paths';
import { canAccess } from '../../src/routes/table';
import { UserRole } from '../../src/types/enums';

const ROLES = Object.values(UserRole);

describe('route access', () => {
  it('lets every role open the dashboard and the profile', () => {
    for (const role of ROLES) {
      expect(canAccess(role, NAV_ITEMS.dashboard.path)).toBe(true);
      expect(canAccess(role, NAV_ITEMS.profile.path)).toBe(true);
    }
  });

  it('only shows a role menu entries that its routes allow', () => {
    for (const role of ROLES) {
      for (const area of navAreasFor(role)) {
        const paths = [...areaItems(area).map((item) => item.path), ...(area.morePath ? [area.morePath] : [])];
        for (const path of paths) expect([role, path, canAccess(role, path)]).toEqual([role, path, true]);
      }
    }
  });

  it('keeps member records and pastoral screens with the pastor', () => {
    expect(canAccess(UserRole.Pastor, `${AppRoute.Members}/abc`)).toBe(true);
    expect(canAccess(UserRole.Admin, `${AppRoute.Members}/abc`)).toBe(false);
    expect(canAccess(UserRole.Admin, AppRoute.Birthdays)).toBe(false);
    expect(canAccess(UserRole.Teacher, AppRoute.Visitors)).toBe(false);
  });

  it('matches the most specific route, so the new-visitor form is not taken for a visitor id', () => {
    expect(canAccess(UserRole.IntegrationTeam, AppRoute.NewVisitor)).toBe(true);
    expect(canAccess(UserRole.Teacher, AppRoute.NewVisitor)).toBe(false);
    expect(canAccess(UserRole.Teacher, `${AppRoute.Visitors}/abc`)).toBe(true);
  });

  it('denies unknown paths and missing roles', () => {
    expect(canAccess(UserRole.Pastor, '/nao-existe')).toBe(false);
    expect(canAccess(undefined, AppRoute.Dashboard)).toBe(false);
  });
});
