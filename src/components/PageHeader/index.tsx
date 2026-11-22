// React
import { ComponentProps } from 'react';
// Libs
import { PageHeader as KitPageHeader, useMediaQuery } from 'bp-kit';
// Local
import { useIsNavDestination } from '../Layout/navDestination';
import { useHasProfileSlot } from '../Layout/profileSlot';
import { ActionRow, ReserveProfile, StickyBar } from './styles';
import { useStuck } from './useStuck';

type Props = ComponentProps<typeof KitPageHeader> & { sticky?: boolean };

export function PageHeader({ back, sticky = false, action, actionAlign, ...rest }: Props) {
  const profileSlot = useHasProfileSlot();
  const isNavDestination = useIsNavDestination();
  const mobile = useMediaQuery('(max-width: 744px)');
  const fixed = sticky && mobile;
  const { barRef, stuck, spare } = useStuck(fixed);
  const header = (
    <ReserveProfile $profileSlot={profileSlot}>
      <KitPageHeader
        back={back && !isNavDestination}
        compact={fixed && stuck}
        action={profileSlot ? undefined : action}
        actionAlign={actionAlign}
        {...rest}
      />
    </ReserveProfile>
  );
  const actions = profileSlot && action ? <ActionRow>{action}</ActionRow> : null;

  if (!fixed) {
    return (
      <>
        {header}
        {actions}
      </>
    );
  }
  return (
    <>
      <StickyBar ref={barRef} $stuck={stuck} style={{ marginBottom: spare }}>
        {header}
      </StickyBar>
      {actions}
    </>
  );
}
