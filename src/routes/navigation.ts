// Libs
import {
  Cake,
  Church,
  Coffee,
  FileBarChart,
  GraduationCap,
  HeartHandshake,
  History,
  LayoutDashboard,
  LucideIcon,
  Handshake,
  Settings,
  Sprout,
  Store,
  User,
  UserCheck,
  UserPlus,
  Users,
  UsersRound,
} from 'lucide-react';
// Local
import { DEFAULT_VIEW_ROLE } from '../domain/access';
import { EffectiveRole, SystemModule, UserRole } from '../types/enums';
import { AppRoute, isEntityId } from './paths';

export interface NavItem {
  label: string;
  tabLabel?: string;
  path: string;
  icon: LucideIcon;
}

export const NAV_ITEMS = {
  dashboard: { label: 'Painel', path: AppRoute.Dashboard, icon: LayoutDashboard },
  visitors: { label: 'Visitantes', path: AppRoute.Visitors, icon: Users },
  coffee: { label: 'Café', path: AppRoute.Coffee, icon: Coffee },
  classes: { label: 'Turmas', path: AppRoute.Classes, icon: GraduationCap },
  membership: { label: 'Conselho', path: AppRoute.Membership, icon: UserCheck },
  cohortHistory: { label: 'Histórico de turmas', path: `${AppRoute.Reports}/turmas`, icon: GraduationCap },
  coffeeHistory: { label: 'Histórico de cafés', path: `${AppRoute.Reports}/cafes`, icon: Coffee },
  volunteers: { label: 'Controle de acesso', path: AppRoute.Volunteers, icon: UserPlus },
  reports: { label: 'Relatórios', path: AppRoute.Reports, icon: FileBarChart },
  members: { label: 'Membros', path: AppRoute.Members, icon: Users },
  birthdays: { label: 'Aniversariantes', tabLabel: 'Aniversários', path: AppRoute.Birthdays, icon: Cake },
  consolidation: { label: 'Consolidação', path: AppRoute.Consolidation, icon: Handshake },
  ministries: { label: 'Ministérios', path: AppRoute.Ministries, icon: HeartHandshake },
  smallGroups: { label: 'Pequenos Grupos', tabLabel: 'PGs', path: AppRoute.SmallGroups, icon: UsersRound },
  store: { label: 'Loja', path: AppRoute.Store, icon: Store },
  profile: { label: 'Perfil', path: AppRoute.Profile, icon: User },
} satisfies Record<string, NavItem>;

interface NavArea {
  id: string;
  title: string;
  icon: LucideIcon;
  tabs: NavItem[];
}

const ADMINISTRATION_AREA_ID = 'administration';

const ADMINISTRATION_AREA: NavArea = {
  id: ADMINISTRATION_AREA_ID,
  title: 'Administração',
  icon: Settings,
  tabs: [NAV_ITEMS.volunteers, NAV_ITEMS.reports],
};

export const GENERAL_ADMIN_NAV_AREAS: NavArea[] = [
  {
    id: 'church',
    title: 'Igreja',
    icon: Church,
    tabs: [NAV_ITEMS.members, NAV_ITEMS.smallGroups, NAV_ITEMS.ministries, NAV_ITEMS.consolidation, NAV_ITEMS.birthdays],
    },
  {
    id: 'integration',
    title: 'Integração',
    icon: Sprout,
    tabs: [NAV_ITEMS.visitors, NAV_ITEMS.coffee, NAV_ITEMS.classes, NAV_ITEMS.membership],
  },
  ADMINISTRATION_AREA,
];

export const INTEGRATION_TEAM_NAV_AREAS: NavArea[] = [
  {
    id: 'integration',
    title: 'Integração',
    icon: Sprout,
    tabs: [NAV_ITEMS.visitors, NAV_ITEMS.coffee, { ...NAV_ITEMS.coffeeHistory, label: 'Histórico', icon: History }],
    },
];

const ADMIN_NAV_AREAS: NavArea[] = [
  {
    id: 'integration',
    title: 'Integração',
    icon: Sprout,
    tabs: [NAV_ITEMS.visitors, NAV_ITEMS.coffee, NAV_ITEMS.classes, NAV_ITEMS.membership],
  },
  ADMINISTRATION_AREA,
];

const TEACHER_NAV_AREAS: NavArea[] = [
  {
    id: 'integration',
    title: 'Integração',
    icon: Sprout,
    tabs: [NAV_ITEMS.classes],
    },
];

const NAV_AREAS_BY_ROLE: Record<EffectiveRole, NavArea[]> = {
  [UserRole.GeneralAdmin]: GENERAL_ADMIN_NAV_AREAS,
  [UserRole.Admin]: ADMIN_NAV_AREAS,
  [UserRole.IntegrationTeam]: INTEGRATION_TEAM_NAV_AREAS,
  [UserRole.Teacher]: TEACHER_NAV_AREAS,
};

export function navAreasFor(role: string | undefined, viewRole: EffectiveRole = DEFAULT_VIEW_ROLE): NavArea[] {
  if (role === UserRole.Developer) {
    const viewAdministration = navAreasFor(viewRole).find((area) => area.id === ADMINISTRATION_AREA_ID);
    const viewPaths = viewAdministration?.tabs.map((item) => item.path) ?? [];
    return [
      ...navAreasFor(UserRole.GeneralAdmin).filter((area) => area.id === SystemModule.Church),
      ...navAreasFor(viewRole).filter((area) => area.id !== SystemModule.Church && area.id !== ADMINISTRATION_AREA_ID),
      {
        ...ADMINISTRATION_AREA,
        tabs: ADMINISTRATION_AREA.tabs.filter(
          (item) => item.path === NAV_ITEMS.volunteers.path || viewPaths.includes(item.path),
        ),
      },
    ];
  }
  return NAV_AREAS_BY_ROLE[role as EffectiveRole] ?? [];
}

export function areaItems(area: NavArea): NavItem[] {
  return area.tabs;
}

function areaTabPaths(area: NavArea): string[] {
  return area.tabs.map((item) => item.path);
}

const STATIC_ROUTES: string[] = Object.values(AppRoute);

const EXACT_TAB_PATHS: string[] = [AppRoute.Reports];

export function isTabPath(pathname: string, tabPath: string): boolean {
  if (pathname === tabPath) return true;
  if (EXACT_TAB_PATHS.includes(tabPath)) return false;
  if (!pathname.startsWith(`${tabPath}/`) || STATIC_ROUTES.includes(pathname)) return false;
  const [firstSegment] = pathname.slice(tabPath.length + 1).split('/');
  return !isEntityId(firstSegment);
}

export function findNavArea(areas: NavArea[], pathname: string): NavArea | undefined {
  return areas.find((area) => areaTabPaths(area).some((tabPath) => isTabPath(pathname, tabPath)));
}

export function activeNavPath(pathname: string, paths: string[]): string | null {
  return (
    paths
      .filter((path) => pathname === path || pathname.startsWith(`${path}/`))
      .sort((a, b) => b.length - a.length)[0] ?? null
  );
}
