// React
import { createContext, useContext } from 'react';

export const ModuleBarTitleContext = createContext<string | null>(null);

export function useModuleBarTitle(): string | null {
  return useContext(ModuleBarTitleContext);
}
