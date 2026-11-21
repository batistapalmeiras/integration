// Local
import { resolveRole } from '../../src/domain/access';
import { areaItems, navAreasFor } from '../../src/routes/navigation';
import { AppRoute } from '../../src/routes/paths';
import { canAccess, moduleOf } from '../../src/routes/table';
import { EffectiveRole, SystemModule, UserRole } from '../../src/types/enums';

const VIEWS: EffectiveRole[] = [UserRole.GeneralAdmin, UserRole.Admin, UserRole.IntegrationTeam, UserRole.Teacher];
const ID = '5f3c2b1a-9d8e-4f7a-b6c5-1234567890ab';

const developerCanAccess = (pathname: string, view: EffectiveRole) =>
  canAccess(resolveRole(UserRole.Developer, moduleOf(pathname), view), pathname);

describe('module of a route', () => {
  it('puts members, groups, ministries and access control in the church and the rest in the integration', () => {
    for (const path of [AppRoute.Members, `${AppRoute.Members}/${ID}`, AppRoute.Ministries, AppRoute.SmallGroups, AppRoute.Birthdays, AppRoute.Volunteers, AppRoute.ChurchMore]) {
      expect([path, moduleOf(path)]).toEqual([path, SystemModule.Church]);
    }
    for (const path of [AppRoute.Visitors, AppRoute.Coffee, AppRoute.Classes, AppRoute.Membership, AppRoute.Reports, AppRoute.Dashboard]) {
      expect([path, moduleOf(path)]).toEqual([path, SystemModule.Integration]);
    }
  });
});

describe('developer menus', () => {
  it('keeps the church area whatever the view and takes the integration area from the view', () => {
    for (const view of VIEWS) {
      const areas = navAreasFor(UserRole.Developer, view);
      expect(areas.filter((area) => area.id === 'church')).toHaveLength(1);
      expect(areas.filter((area) => area.id === 'integration')).toEqual(
        navAreasFor(view).filter((area) => area.id === 'integration'),
      );
    }
  });

  it('matches the general admin by default', () => {
    expect(navAreasFor(UserRole.Developer)).toEqual(navAreasFor(UserRole.GeneralAdmin));
  });

  it('only lists entries the developer can open in each view', () => {
    for (const view of VIEWS) {
      for (const area of navAreasFor(UserRole.Developer, view)) {
        const paths = [...areaItems(area).map((item) => item.path), ...(area.morePath ? [area.morePath] : [])];
        for (const path of paths) expect([view, path, developerCanAccess(path, view)]).toEqual([view, path, true]);
      }
    }
  });
});

describe('developer route access', () => {
  it('opens the church screens in every view', () => {
    for (const view of VIEWS) {
      expect(developerCanAccess(AppRoute.Members, view)).toBe(true);
      expect(developerCanAccess(`${AppRoute.Members}/${ID}`, view)).toBe(true);
      expect(developerCanAccess(AppRoute.Volunteers, view)).toBe(true);
    }
  });

  it('opens the integration screens as the chosen view would', () => {
    expect(developerCanAccess(AppRoute.Visitors, UserRole.Teacher)).toBe(false);
    expect(developerCanAccess(AppRoute.Classes, UserRole.Teacher)).toBe(true);
    expect(developerCanAccess(AppRoute.Classes, UserRole.IntegrationTeam)).toBe(false);
    expect(developerCanAccess(AppRoute.Visitors, UserRole.IntegrationTeam)).toBe(true);
    expect(developerCanAccess(AppRoute.Membership, UserRole.IntegrationTeam)).toBe(false);
    expect(developerCanAccess(AppRoute.Membership, UserRole.Admin)).toBe(true);
  });
});
