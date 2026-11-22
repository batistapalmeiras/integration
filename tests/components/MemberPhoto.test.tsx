// Libs
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { theme } from 'bp-kit';
// Local
import { MemberPhoto, PhotoName } from '../../src/components/MemberPhoto';

const renderPhoto = (ui: React.ReactElement) => render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

describe('member photo', () => {
  it('shows the picture, and a placeholder when there is none', () => {
    const withPhoto = renderPhoto(<MemberPhoto url="https://example.com/a.jpg" size={120} shape="square" />);
    expect(withPhoto.container.querySelector('img')).toHaveAttribute('src', 'https://example.com/a.jpg');
    withPhoto.unmount();

    const without = renderPhoto(<MemberPhoto url={null} size={120} shape="square" />);
    expect(without.container.querySelector('img')).not.toBeInTheDocument();
    expect(without.container.querySelector('svg')).toBeInTheDocument();
  });

  it('is the same component on the list rows, round and small', () => {
    renderPhoto(<PhotoName url="https://example.com/a.jpg">Ana Souza</PhotoName>);

    expect(screen.getByText('Ana Souza')).toBeInTheDocument();
    expect(document.querySelector('img')).toHaveAttribute('src', 'https://example.com/a.jpg');
  });
});
