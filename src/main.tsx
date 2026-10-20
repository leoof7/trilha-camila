import { createRoot } from 'react-dom/client';
import '@fontsource/outfit/latin-600.css';
import '@fontsource/outfit/latin-700.css';
import '@fontsource/outfit/latin-800.css';
import '@fontsource/manrope/latin-500.css';
import '@fontsource/manrope/latin-700.css';
import '@fontsource/manrope/latin-800.css';
import './styles.css';
import { AppProvider } from './state';
import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <AppProvider>
    <App />
  </AppProvider>,
);
