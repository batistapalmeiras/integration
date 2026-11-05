// Local
import { activeNavPath, findPastorArea } from './navigation';
import { AppRoute } from './paths';

describe('pastor modules', () => {
  it('finds the module of each module tab and of its Mais page', () => {
    expect(findPastorArea(AppRoute.Members)?.id).toBe('church');
    expect(findPastorArea(AppRoute.ChurchMore)?.id).toBe('church');
    expect(findPastorArea(AppRoute.Coffee)?.id).toBe('integration');
    expect(findPastorArea(AppRoute.IntegrationMore)?.id).toBe('integration');
  });

  it('leaves the dashboard, the profile and screens reached from Mais outside any module', () => {
    expect(findPastorArea(AppRoute.Dashboard)).toBeUndefined();
    expect(findPastorArea(AppRoute.Profile)).toBeUndefined();
    expect(findPastorArea(AppRoute.People)).toBeUndefined();
  });
});

describe('active menu item', () => {
  it('picks the most specific path, so Pendências does not light up Membros', () => {
    expect(activeNavPath('/membros/pendencias', [AppRoute.Members, AppRoute.MemberPendencies])).toBe(AppRoute.MemberPendencies);
    expect(activeNavPath('/membros/123/ficha', [AppRoute.Members, AppRoute.MemberPendencies])).toBe(AppRoute.Members);
  });
});
