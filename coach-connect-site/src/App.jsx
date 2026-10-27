// App.jsx — the routes. One page per question (DESIGN.md section 10).
// Old URLs from the first site redirect to their new homes.
import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';

const TrainersPage = lazy(() => import('./pages/TrainersPage'));
const ClientsPage = lazy(() => import('./pages/ClientsPage'));
const NutritionPage = lazy(() => import('./pages/NutritionPage'));
const HowItWorksPage = lazy(() => import('./pages/HowItWorksPage'));
const FaqPage = lazy(() => import('./pages/FaqPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

/**
 * New page, top of the page. A hash (like #waitlist) is left to the browser.
 * @returns {null}
 */
function ScrollToTopOnRouteChange() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView();
      return;
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

/**
 * @returns {JSX.Element}
 */
export function App() {
  return (
    <>
      <ScrollToTopOnRouteChange />
      <Suspense fallback={<div className="route-loading" />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/trainers" element={<TrainersPage />} />
          <Route path="/clients" element={<ClientsPage />} />
          <Route path="/nutrition" element={<NutritionPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/for-trainers" element={<Navigate to="/trainers" replace />} />
          <Route path="/for-clients" element={<Navigate to="/clients" replace />} />
          <Route path="/for-both" element={<Navigate to="/how-it-works" replace />} />
          <Route path="/faqs" element={<Navigate to="/faq" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </>
  );
}
