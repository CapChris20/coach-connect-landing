// React entry point — mounts the app into #root and wraps it in the router.
// Flow: createRoot → StrictMode → BrowserRouter → App → Landing.
// vocab: createRoot = React 19 mount API (replaces old ReactDOM.render)
// vocab: StrictMode = double-invokes effects in dev so you catch cleanup bugs early
// vocab: BrowserRouter = react-router wrapper that syncs URL ↔ React tree (uses History API)
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
