// React
import { createContext, useContext } from 'react';

export const NavDestinationContext = createContext(false);

export function useIsNavDestination(): boolean {
  return useContext(NavDestinationContext);
}
