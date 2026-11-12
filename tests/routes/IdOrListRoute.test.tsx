// React
import { Route, Routes } from 'react-router-dom';
// Libs
import { screen } from '@testing-library/react';
// Local
import { IdOrListRoute } from '../../src/routes/IdOrListRoute';
import { UserRole } from '../../src/types/enums';
import { renderScreen } from '../support/render';

const ID = '5f3c2b1a-9d8e-4f7a-b6c5-1234567890ab';

function renderAt(route: string, role: UserRole) {
  renderScreen(
    <Routes>
      <Route
        path="/membros/:id"
        element={
          <IdOrListRoute
            detail={{ element: <p>Perfil</p>, roles: [UserRole.Pastor] }}
            list={{ element: <p>Lista</p>, roles: [UserRole.Pastor, UserRole.Admin] }}
          />
        }
      />
      <Route path="/painel" element={<p>Painel</p>} />
    </Routes>,
    { route, role },
  );
}

describe('IdOrListRoute', () => {
  it('opens the record when the segment is an id', () => {
    renderAt(`/membros/${ID}`, UserRole.Pastor);
    expect(screen.getByText('Perfil')).toBeInTheDocument();
  });

  it('opens the filtered list when the segment is a filter', () => {
    renderAt('/membros/ativo', UserRole.Admin);
    expect(screen.getByText('Lista')).toBeInTheDocument();
  });

  it('applies the record roles only to records', () => {
    renderAt(`/membros/${ID}`, UserRole.Admin);
    expect(screen.getByText('Painel')).toBeInTheDocument();
  });
});
