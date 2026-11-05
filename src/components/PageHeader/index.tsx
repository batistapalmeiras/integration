// React
import { ComponentProps } from 'react';
// Libs
import { PageHeader as KitPageHeader } from 'bp-kit';
// Local
import { useIsNavDestination } from '../Layout/navDestination';

export function PageHeader({ back, ...rest }: ComponentProps<typeof KitPageHeader>) {
  const isNavDestination = useIsNavDestination();
  return <KitPageHeader back={back && !isNavDestination} {...rest} />;
}
