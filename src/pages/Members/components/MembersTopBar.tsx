// React
import { useNavigate } from 'react-router-dom';
// Libs
import { ChevronLeft, SlidersHorizontal } from 'lucide-react';
// Local
import { useWindowScrolled } from '../../../lib/useScrolled';
import { AppRoute } from '../../../routes/paths';
import { BackLink, BarButton, BarTitle, FilterCount, TopBar } from '../styles';

interface Props {
  back: boolean;
  title: string;
  showFilters: boolean;
  filterCount: number;
  onFilters: () => void;
}

export function MembersTopBar({ back, title, showFilters, filterCount, onFilters }: Props) {
  const navigate = useNavigate();
  const scrolled = useWindowScrolled();

  return (
    <TopBar $scrolled={scrolled}>
      {back ? (
        <BackLink type="button" onClick={() => navigate(AppRoute.Dashboard)}>
          <ChevronLeft size={20} />
          {title}
        </BackLink>
      ) : (
        <BarTitle>{title}</BarTitle>
      )}
      {showFilters && (
        <BarButton type="button" $outlined aria-label="Filtros" onClick={onFilters}>
          <SlidersHorizontal size={18} />
          {filterCount > 0 && <FilterCount>{filterCount}</FilterCount>}
        </BarButton>
      )}
    </TopBar>
  );
}
