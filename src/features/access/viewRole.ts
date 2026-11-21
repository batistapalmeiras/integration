// React
import { useSyncExternalStore } from 'react';
// Local
import { DEFAULT_VIEW_ROLE, toViewRole } from '../../domain/access';
import { storedValue } from '../../lib/storage';
import { EffectiveRole } from '../../types/enums';

const stored = storedValue<string>('integration-view-role');
const listeners = new Set<() => void>();

let current: EffectiveRole = toViewRole(stored.load());

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function setViewRole(role: EffectiveRole) {
  current = role;
  stored.save(role);
  listeners.forEach((listener) => listener());
}

export function useViewRole(): EffectiveRole {
  return useSyncExternalStore(
    subscribe,
    () => current,
    () => DEFAULT_VIEW_ROLE,
  );
}
