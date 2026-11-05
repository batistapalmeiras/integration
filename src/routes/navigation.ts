// Libs
import {
  Church,
  ClipboardCheck,
  Coffee,
  Contact,
  FileBarChart,
  GraduationCap,
  HeartHandshake,
  LayoutDashboard,
  LucideIcon,
  Menu,
  Sprout,
  Store,
  User,
  UserCheck,
  UserPlus,
  Users,
  UsersRound,
} from 'lucide-react';
// Local
import { AppRoute } from './paths';

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
  membership: { label: 'Membresia', path: AppRoute.Membership, icon: UserCheck },
  people: { label: 'Pessoas', path: AppRoute.People, icon: Contact },
  cohortHistory: { label: 'Histórico de turmas', path: `${AppRoute.Reports}/turmas`, icon: GraduationCap },
  coffeeHistory: { label: 'Histórico de cafés', path: `${AppRoute.Reports}/cafes`, icon: Coffee },
  volunteers: { label: 'Voluntários', path: AppRoute.Volunteers, icon: UserPlus },
  reports: { label: 'Relatórios', path: AppRoute.Reports, icon: FileBarChart },
  members: { label: 'Membros', path: AppRoute.Members, icon: Users },
  pendencies: { label: 'Pendências', path: AppRoute.MemberPendencies, icon: ClipboardCheck },
  ministries: { label: 'Ministérios', path: AppRoute.Ministries, icon: HeartHandshake },
  smallGroups: { label: 'Pequenos Grupos', tabLabel: 'PGs', path: AppRoute.SmallGroups, icon: UsersRound },
  store: { label: 'Loja', path: AppRoute.Store, icon: Store },
  profile: { label: 'Perfil', path: AppRoute.Profile, icon: User },
} satisfies Record<string, NavItem>;

export interface NavArea {
  id: string;
  title: string;
  icon: LucideIcon;
  tabs: NavItem[];
  more: NavItem[];
  morePath: AppRoute;
}

export const PASTOR_NAV_AREAS: NavArea[] = [
  {
    id: 'church',
    title: 'Igreja',
    icon: Church,
    tabs: [NAV_ITEMS.members, NAV_ITEMS.pendencies, NAV_ITEMS.smallGroups, NAV_ITEMS.ministries],
    more: [NAV_ITEMS.volunteers],
    morePath: AppRoute.ChurchMore,
  },
  {
    id: 'integration',
    title: 'Integração',
    icon: Sprout,
    tabs: [NAV_ITEMS.visitors, NAV_ITEMS.coffee, NAV_ITEMS.classes, NAV_ITEMS.membership],
    more: [NAV_ITEMS.people, NAV_ITEMS.cohortHistory, NAV_ITEMS.coffeeHistory, NAV_ITEMS.reports],
    morePath: AppRoute.IntegrationMore,
  },
];

export const MORE_TAB_LABEL = 'Mais';
export const MORE_TAB_ICON = Menu;

export function areaItems(area: NavArea): NavItem[] {
  return [...area.tabs, ...area.more];
}

export function areaTabPaths(area: NavArea): string[] {
  return [...area.tabs.map((item) => item.path), area.morePath];
}

export function findPastorArea(pathname: string): NavArea | undefined {
  return PASTOR_NAV_AREAS.find((area) => areaTabPaths(area).includes(pathname));
}

export function findPastorAreaById(id: string): NavArea | undefined {
  return PASTOR_NAV_AREAS.find((area) => area.id === id);
}

export function activeNavPath(pathname: string, paths: string[]): string | null {
  return (
    paths
      .filter((path) => pathname === path || pathname.startsWith(`${path}/`))
      .sort((a, b) => b.length - a.length)[0] ?? null
  );
}
