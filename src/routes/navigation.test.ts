// Local
import { activeNavPath, findNavArea, INTEGRATION_TEAM_NAV_AREAS, PASTOR_NAV_AREAS } from './navigation';
import { AppRoute } from './paths';

describe('pastor modules', () => {
  it('finds the module of each module tab and of its Mais page', () => {
    expect(findNavArea(PASTOR_NAV_AREAS, AppRoute.Members)?.id).toBe('church');
    expect(findNavArea(PASTOR_NAV_AREAS, AppRoute.ChurchMore)?.id).toBe('church');
    expect(findNavArea(PASTOR_NAV_AREAS, AppRoute.Coffee)?.id).toBe('integration');
    expect(findNavArea(PASTOR_NAV_AREAS, AppRoute.IntegrationMore)?.id).toBe('integration');
  });

  it('leaves the dashboard, the profile and screens reached from Mais outside any module', () => {
    expect(findNavArea(PASTOR_NAV_AREAS, AppRoute.Dashboard)).toBeUndefined();
    expect(findNavArea(PASTOR_NAV_AREAS, AppRoute.Profile)).toBeUndefined();
    expect(findNavArea(PASTOR_NAV_AREAS, AppRoute.People)).toBeUndefined();
  });
});

describe('integration team module', () => {
  it('keeps the team tabs inside Integração and the dashboard outside', () => {
    expect(findNavArea(INTEGRATION_TEAM_NAV_AREAS, AppRoute.Visitors)?.id).toBe('integration');
    expect(findNavArea(INTEGRATION_TEAM_NAV_AREAS, AppRoute.People)?.id).toBe('integration');
    expect(findNavArea(INTEGRATION_TEAM_NAV_AREAS, AppRoute.Dashboard)).toBeUndefined();
  });
});

describe('active menu item', () => {
  it('picks the most specific path, so Pendências does not light up Membros', () => {
    expect(activeNavPath('/membros/pendencias', [AppRoute.Members, AppRoute.MemberPendencies])).toBe(AppRoute.MemberPendencies);
    expect(activeNavPath('/membros/123/ficha', [AppRoute.Members, AppRoute.MemberPendencies])).toBe(AppRoute.Members);
  });
});
