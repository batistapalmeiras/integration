// React
import ReactDOM from 'react-dom/client';
// Libs
import { GlobalStyles, theme } from 'bp-kit';
import { ThemeProvider } from 'styled-components';
// Local
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <ThemeProvider theme={theme}>
    <GlobalStyles />
    <App />
  </ThemeProvider>,
);

reportWebVitals();
