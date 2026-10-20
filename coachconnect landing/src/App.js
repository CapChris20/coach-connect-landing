// App router shell — maps URLs to page components.
// Flow: BrowserRouter (in index.js) → Routes here → Landing at "/", the two
// audience pages at "/for-trainers" and "/for-clients" (placeholder shells
// until the owner dictates their layouts), and the questions at "/faqs"
// (moved off the homepage at the owner's call).
// Used as the root React component. Add more <Route>s when you add pages.
import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import ForTrainers from './pages/ForTrainers';
import ForClients from './pages/ForClients';
import Faqs from './pages/Faqs';

/**
 * The router: which page shows for which URL.
 * @returns {JSX.Element}
 */
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/for-trainers" element={<ForTrainers />} />
      <Route path="/for-clients" element={<ForClients />} />
      <Route path="/faqs" element={<Faqs />} />
    </Routes>
  );
}
