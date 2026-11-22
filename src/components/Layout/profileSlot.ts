// React
import { createContext, useContext } from 'react';

export const ProfileSlotContext = createContext(false);

export function useHasProfileSlot(): boolean {
  return useContext(ProfileSlotContext);
}
