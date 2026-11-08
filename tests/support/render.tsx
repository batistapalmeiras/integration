// React
import { ReactElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
// Libs
import { render } from '@testing-library/react';
import { AuthContext, theme } from 'bp-kit';
import { ThemeProvider } from 'styled-components';
// Local
import { UserRole } from '../../src/types/enums';

interface Options {
  route?: string;
  role?: UserRole;
}

export function renderScreen(ui: ReactElement, { route = '/', role }: Options = {}) {
  const auth = {
    user: role ? { id: 'user-1', name: 'Ana Souza', role } : null,
    userEmail: role ? 'ana@example.com' : '',
    loading: false,
    error: null,
    login: async () => null,
    logout: async () => undefined,
    updateProfile: async () => null,
    updatePassword: async () => null,
    requestPasswordReset: async () => null,
  };
  return render(
    <ThemeProvider theme={theme}>
      <AuthContext.Provider value={auth}>
        <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
      </AuthContext.Provider>
    </ThemeProvider>,
  );
}
