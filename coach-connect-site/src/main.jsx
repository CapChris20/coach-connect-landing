// main.jsx — entry point: fonts, global styles, router.
// Fonts are bundled from npm, only the weights in use (DESIGN.md section 5).
import '@fontsource/plus-jakarta-sans/400.css';
import '@fontsource/plus-jakarta-sans/500.css';
import '@fontsource/plus-jakarta-sans/700.css';
import '@fontsource/space-mono/400.css';
import '@fontsource/space-mono/700.css';
import '@fontsource/unbounded/700.css';
import '@fontsource/unbounded/800.css';
import './styles/base.css';
import './styles/site.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { App } from './App';

// The artifact build (npm run build:artifact) runs inside a hosted frame that
// cannot use real paths like /trainers, so it routes in memory instead.
const Router = import.meta.env.VITE_ARTIFACT ? MemoryRouter : BrowserRouter;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router basename={import.meta.env.VITE_ARTIFACT ? undefined : import.meta.env.BASE_URL.replace(/\/$/, '') || undefined}>
      <App />
    </Router>
  </StrictMode>,
);
