// React
import { Navigate, useNavigate } from 'react-router-dom';
// Components
import { MenuOptionCard, OptionsGrid } from '../../components/MenuOptions';
import { PageHeader } from '../../components/PageHeader';
import { useNavAreas } from '../../features/access/useRole';
import { findNavAreaById, isNavGroup, MORE_TAB_LABEL, NavItem } from '../../routes/navigation';
import { AppRoute } from '../../routes/paths';
// Local
import { GroupSection, GroupTitle } from './styles';

interface Props {
  areaId: string;
}

export function ModuleMorePage({ areaId }: Props) {
  const navigate = useNavigate();
  const navAreas = useNavAreas();
  const area = findNavAreaById(navAreas, areaId);

  if (!area) return <Navigate to={AppRoute.Dashboard} replace />;

  return (
    <div>
      <PageHeader title={MORE_TAB_LABEL} />
      <OptionsGrid>
        {area.more
          .filter((entry): entry is NavItem => !isNavGroup(entry))
          .map((item) => (
            <MenuOptionCard key={item.path} icon={item.icon} label={item.label} onClick={() => navigate(item.path)} />
          ))}
      </OptionsGrid>
      {area.more.filter(isNavGroup).map((group) => (
        <GroupSection key={group.id} aria-labelledby={`group-${group.id}`}>
          <GroupTitle id={`group-${group.id}`}>{group.label}</GroupTitle>
          <OptionsGrid>
            {group.items.map((item) => (
              <MenuOptionCard key={item.path} icon={item.icon} label={item.label} onClick={() => navigate(item.path)} />
            ))}
          </OptionsGrid>
        </GroupSection>
      ))}
    </div>
  );
}
