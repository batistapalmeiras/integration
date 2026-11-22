// React
import { matchRoutes } from 'react-router-dom';
// Local
import { resolveRole } from '../../src/domain/access';
import { areaItems, navAreasFor } from '../../src/routes/navigation';
import { AppRoute, memberPath, profileAccessPath, profilePath } from '../../src/routes/paths';
import { canAccess, isStandalone, moduleOf, PRIVATE_ROUTES } from '../../src/routes/table';
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

describe('profile routes', () => {
  it('work as the church side for the developer, whatever the integration view', () => {
    for (const path of [AppRoute.Profile, profilePath(ID), profileAccessPath(ID), AppRoute.ChangePassword, AppRoute.ProfileView]) {
      expect([path, moduleOf(path)]).toEqual([path, SystemModule.Church]);
    }
  });
});

describe('standalone screens', () => {
  it('opens the profile screens without the side menu and keeps the rest inside it', () => {
    for (const path of [AppRoute.Profile, profilePath(ID), profileAccessPath(ID), AppRoute.ChangePassword, AppRoute.ProfileView]) {
      expect([path, isStandalone(path)]).toEqual([path, true]);
    }
    for (const path of [AppRoute.Dashboard, AppRoute.Visitors, AppRoute.Members, AppRoute.Volunteers]) {
      expect([path, isStandalone(path)]).toEqual([path, false]);
    }
  });
});

describe('one profile route', () => {
  it('keeps the fixed profile pages apart from the person profile', () => {
    const routeOf = (pathname: string) => matchRoutes(PRIVATE_ROUTES, pathname)?.[0]?.route.path;

    expect(routeOf(AppRoute.ChangePassword)).toBe(AppRoute.ChangePassword);
    expect(routeOf(AppRoute.ProfileView)).toBe(AppRoute.ProfileView);
    expect(routeOf(profilePath(ID))).toBe(`${AppRoute.Profile}/:id`);
    expect(routeOf(profileAccessPath(ID))).toBe(`${AppRoute.Profile}/:id/:section`);
  });
});

describe('member screens', () => {
  it('open as their own screen, with a single side menu, but the member list stays inside the layout', () => {
    for (const path of [memberPath(ID), memberPath(ID, 'historico'), memberPath(ID, 'familia')]) {
      expect([path, isStandalone(path)]).toEqual([path, true]);
    }
    for (const path of [AppRoute.Members, `${AppRoute.Members}/ativo`, `${AppRoute.Members}/ativo/batismo`]) {
      expect([path, isStandalone(path)]).toEqual([path, false]);
    }
  });

  it('count as the church side', () => {
    expect(moduleOf(memberPath(ID, 'historico'))).toBe(SystemModule.Church);
  });
});
