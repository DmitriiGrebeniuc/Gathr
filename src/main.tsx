import { createRoot } from 'react-dom/client';
import App from './app/App.tsx';
import './styles/index.css';
import { LanguageProvider } from './app/context/LanguageContext';
import { ThemeProvider } from './app/context/ThemeContext';

createRoot(document.getElementById('root')!).render(
  <ThemeProvider>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </ThemeProvider>
);
