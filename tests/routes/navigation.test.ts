// Local
import { activeNavPath, findNavArea, isTabPath, INTEGRATION_TEAM_NAV_AREAS, GENERAL_ADMIN_NAV_AREAS } from '../../src/routes/navigation';
import { AppRoute, COUNCILS_PATH } from '../../src/routes/paths';

describe('general admin modules', () => {
  it('finds the module of each module tab', () => {
    expect(findNavArea(GENERAL_ADMIN_NAV_AREAS, AppRoute.Members)?.id).toBe('church');
    expect(findNavArea(GENERAL_ADMIN_NAV_AREAS, AppRoute.Birthdays)?.id).toBe('church');
    expect(findNavArea(GENERAL_ADMIN_NAV_AREAS, AppRoute.Volunteers)?.id).toBe('administration');
    expect(findNavArea(GENERAL_ADMIN_NAV_AREAS, AppRoute.Reports)?.id).toBe('administration');
    expect(findNavArea(GENERAL_ADMIN_NAV_AREAS, AppRoute.Coffee)?.id).toBe('integration');
  });

  it('leaves the dashboard, the profile and screens reached from Mais outside any module', () => {
    expect(findNavArea(GENERAL_ADMIN_NAV_AREAS, AppRoute.Dashboard)).toBeUndefined();
    expect(findNavArea(GENERAL_ADMIN_NAV_AREAS, AppRoute.Profile)).toBeUndefined();
  });
});

describe('integration team module', () => {
  it('keeps the team tabs inside Integração and the dashboard outside', () => {
    expect(findNavArea(INTEGRATION_TEAM_NAV_AREAS, AppRoute.Visitors)?.id).toBe('integration');
    expect(findNavArea(INTEGRATION_TEAM_NAV_AREAS, AppRoute.Coffee)?.id).toBe('integration');
    expect(findNavArea(INTEGRATION_TEAM_NAV_AREAS, AppRoute.Dashboard)).toBeUndefined();
  });
});

describe('active menu item', () => {
  it('picks the most specific path, so Aniversariantes does not light up Membros', () => {
    expect(activeNavPath('/membros/aniversariantes', [AppRoute.Members, AppRoute.Birthdays])).toBe(AppRoute.Birthdays);
    expect(activeNavPath('/membros/123', [AppRoute.Members, AppRoute.Birthdays])).toBe(AppRoute.Members);
  });
});

describe('isTabPath', () => {
  it('keeps a tab list on screen while its filters live in the path', () => {
    expect(isTabPath('/cafe-de-boas-vindas/2026-12-06', AppRoute.Coffee)).toBe(true);
    expect(isTabPath('/visitantes/contato-inicial', AppRoute.Visitors)).toBe(true);
  });

  it('does not treat details or other screens under a tab as the tab itself', () => {
    expect(isTabPath('/visitantes/cc3b3af8-00d1-440c-8734-56b412890040', AppRoute.Visitors)).toBe(false);
    expect(isTabPath(AppRoute.ArchivedVisitors, AppRoute.Visitors)).toBe(false);
  });
});

describe('menu areas', () => {
  const area = (id: string) => GENERAL_ADMIN_NAV_AREAS.find((item) => item.id === id);

  it('has the consolidation before the birthdays in the church tabs', () => {
    expect(area('church')?.tabs.map((tab) => tab.path)).toEqual([
      AppRoute.Members,
      AppRoute.SmallGroups,
      AppRoute.Ministries,
      AppRoute.Consolidation,
      AppRoute.Birthdays,
    ]);
  });

  it('gathers the access control and the reports in the administration area', () => {
    expect(area('administration')?.tabs.map((tab) => tab.path)).toEqual([AppRoute.Volunteers, AppRoute.Reports]);
  });

  it('keeps the report screens apart from the reports tab, so they open with a back arrow', () => {
    expect(isTabPath(AppRoute.Reports, AppRoute.Reports)).toBe(true);
    expect(isTabPath(`${AppRoute.Reports}/turmas`, AppRoute.Reports)).toBe(false);
    expect(findNavArea(GENERAL_ADMIN_NAV_AREAS, COUNCILS_PATH)).toBeUndefined();
  });
});
