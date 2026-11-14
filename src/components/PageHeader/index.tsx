// React
import { ComponentProps } from 'react';
// Libs
import { PageHeader as KitPageHeader, useMediaQuery } from 'bp-kit';
// Local
import { useIsNavDestination } from '../Layout/navDestination';
import { StickyBar } from './styles';
import { useStuck } from './useStuck';

type Props = ComponentProps<typeof KitPageHeader> & { sticky?: boolean };

export function PageHeader({ back, sticky = false, ...rest }: Props) {
  const isNavDestination = useIsNavDestination();
  const mobile = useMediaQuery('(max-width: 744px)');
  const fixed = sticky && mobile;
  const { barRef, stuck, spare } = useStuck(fixed);
  const header = <KitPageHeader back={back && !isNavDestination} compact={fixed && stuck} {...rest} />;

  if (!fixed) return header;
  return (
    <StickyBar ref={barRef} $stuck={stuck} style={{ marginBottom: spare }}>
      {header}
    </StickyBar>
  );
}
