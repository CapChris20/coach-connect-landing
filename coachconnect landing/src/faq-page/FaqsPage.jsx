// FaqsPage.jsx
// The Frequently Asked Questions page with navigation bar and questions list.

import SeoMetaTags from '../app-settings-and-helpers/seoMetaTags';
import { NavigationBar } from '../app-header-and-nav/NavigationBar';
import FAQ from './FAQ';
import './faq.css';

export function FaqsPage() {
  return (
    <div className="relative min-h-screen bg-void" data-testid="faqs-page">
      <SeoMetaTags />

      {/* Background glow backdrop */}
      <div className="aurora-static" data-testid="aurora-fallback" aria-hidden="true" />

      <div className="relative z-10">
        <NavigationBar />

        <main style={{ paddingTop: '6rem' }}>
          <FAQ />
        </main>
      </div>
    </div>
  );
}

export default FaqsPage;
