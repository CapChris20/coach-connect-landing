// App router shell — maps URLs to page components.
// Flow: BrowserRouter (in index.js) → Routes here → Landing at "/", the two
// audience pages at "/for-trainers" and "/for-clients" (placeholder shells
// until the owner dictates their layouts), and the questions at "/faqs"
// (moved off the homepage at the owner's call).
// Used as the root React component. Add more <Route>s when you add pages.
import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Landing from './pages/Landing';
import ForTrainers from './pages/ForTrainers';
import ForClients from './pages/ForClients';
import Faqs from './pages/Faqs';

/**
 * Every page starts at its top. React Router keeps the old scroll spot
 * on route changes (and browsers restore it on reload), which dropped
 * people mid-page — the homepage's waitlist, worst of all. A hash in
 * the URL ("#act-finale") means a section was asked for, so those
 * visits are left alone for the landing page's glide to handle.
 * @returns {null}
 */
function ScrollToTopOnRouteChange() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // 1. Section asked for? Not this component's job.
    if (hash) return;

    // 2. Fresh page, fresh top — immediately, no glide.
    window.history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}

/**
 * The router: which page shows for which URL.
 * @returns {JSX.Element}
 */
export default function App() {
  return (
    <>
      <ScrollToTopOnRouteChange />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/for-trainers" element={<ForTrainers />} />
        <Route path="/for-clients" element={<ForClients />} />
        <Route path="/faqs" element={<Faqs />} />
      </Routes>
    </>
  );
}
