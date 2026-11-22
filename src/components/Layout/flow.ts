// React
import { createContext, useContext } from 'react';
// Local
import { AppRoute } from '../../routes/paths';

export const FlowContext = createContext<{ current: string }>({ current: AppRoute.Dashboard });

export function useFlowPath(): () => string {
  const flow = useContext(FlowContext);
  return () => flow.current;
}
