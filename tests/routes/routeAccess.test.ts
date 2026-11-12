// Local
import { areaItems, NAV_ITEMS, navAreasFor } from '../../src/routes/navigation';
import { AppRoute } from '../../src/routes/paths';
import { canAccess } from '../../src/routes/table';
import { UserRole } from '../../src/types/enums';

const ROLES = Object.values(UserRole);
const ID = '5f3c2b1a-9d8e-4f7a-b6c5-1234567890ab';

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
    expect(canAccess(UserRole.Pastor, `${AppRoute.Members}/${ID}`)).toBe(true);
    expect(canAccess(UserRole.Admin, `${AppRoute.Members}/${ID}`)).toBe(false);
    expect(canAccess(UserRole.Admin, AppRoute.Birthdays)).toBe(false);
    expect(canAccess(UserRole.Teacher, AppRoute.Visitors)).toBe(false);
  });

  it('matches the most specific route, so the new-visitor form is not taken for a visitor id', () => {
    expect(canAccess(UserRole.IntegrationTeam, AppRoute.NewVisitor)).toBe(true);
    expect(canAccess(UserRole.Teacher, AppRoute.NewVisitor)).toBe(false);
    expect(canAccess(UserRole.Teacher, `${AppRoute.Visitors}/${ID}`)).toBe(true);
  });

  it('treats a segment that is not an id as list filters, with the list roles', () => {
    expect(canAccess(UserRole.Admin, `${AppRoute.Members}/ativo`)).toBe(true);
    expect(canAccess(UserRole.Admin, `${AppRoute.Members}/ativo/batismo`)).toBe(true);
    expect(canAccess(UserRole.Teacher, `${AppRoute.Visitors}/arquivado`)).toBe(false);
    expect(canAccess(UserRole.IntegrationTeam, `${AppRoute.Visitors}/arquivado`)).toBe(true);
    expect(canAccess(UserRole.Pastor, `${AppRoute.MemberPendencies}/telefone`)).toBe(true);
    expect(canAccess(UserRole.Admin, `${AppRoute.MemberPendencies}/telefone`)).toBe(false);
  });

  it('denies unknown paths and missing roles', () => {
    expect(canAccess(UserRole.Pastor, '/nao-existe')).toBe(false);
    expect(canAccess(undefined, AppRoute.Dashboard)).toBe(false);
  });
});
