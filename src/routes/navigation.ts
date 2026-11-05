// Libs
import {
  ClipboardCheck,
  Coffee,
  Contact,
  FileBarChart,
  GraduationCap,
  HeartHandshake,
  LayoutDashboard,
  LucideIcon,
  Store,
  UserCheck,
  UserPlus,
  Users,
  UsersRound,
} from 'lucide-react';
// Local
import { AppRoute } from './paths';

export interface NavItem {
  label: string;
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
  smallGroups: { label: 'Pequenos Grupos', path: AppRoute.SmallGroups, icon: UsersRound },
  store: { label: 'Loja', path: AppRoute.Store, icon: Store },
} satisfies Record<string, NavItem>;

export interface NavArea {
  title: string;
  items: NavItem[];
}

export const PASTOR_NAV_AREAS: NavArea[] = [
  {
    title: 'Integração',
    items: [
      NAV_ITEMS.visitors,
      NAV_ITEMS.coffee,
      NAV_ITEMS.classes,
      NAV_ITEMS.membership,
      NAV_ITEMS.people,
      NAV_ITEMS.cohortHistory,
      NAV_ITEMS.coffeeHistory,
      NAV_ITEMS.volunteers,
      NAV_ITEMS.reports,
    ],
  },
  {
    title: 'Igreja',
    items: [NAV_ITEMS.members, NAV_ITEMS.pendencies, NAV_ITEMS.ministries, NAV_ITEMS.smallGroups],
  },
];

export function activeNavPath(pathname: string, paths: string[]): string | null {
  return (
    paths
      .filter((path) => pathname === path || pathname.startsWith(`${path}/`))
      .sort((a, b) => b.length - a.length)[0] ?? null
  );
}
