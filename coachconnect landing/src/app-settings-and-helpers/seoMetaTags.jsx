// seoMetaTags.jsx
// Updates Google search and social share tags (Open Graph / Twitter) in the document <head>.

import { useEffect } from 'react';

const PAGE_TITLE = 'Coach Connect — Find your coach. Run your business. One app.';
const PAGE_DESCRIPTION =
  'Client messaging, workout plans, nutrition tracking, documents and in-app payments, plus an AI Coach that asks before it changes anything.';

// Helper to set a <meta> tag without creating duplicates
function setMetaTag(attributeName, tagName, content) {
  let metaTag = document.head.querySelector(`meta[${attributeName}="${tagName}"]`);
  if (!metaTag) {
    metaTag = document.createElement('meta');
    metaTag.setAttribute(attributeName, tagName);
    document.head.appendChild(metaTag);
  }
  metaTag.setAttribute('content', content);
}

// Helper to set a <link> tag without creating duplicates
function setLinkTag(relationName, href) {
  let linkTag = document.head.querySelector(`link[rel="${relationName}"]`);
  if (!linkTag) {
    linkTag = document.createElement('link');
    linkTag.setAttribute(relationName, linkTag);
    document.head.appendChild(linkTag);
  }
  linkTag.setAttribute('href', href);
}

// Helper to set the Google structured data script
function setGoogleStructuredData(scriptId, dataObject) {
  let scriptTag = document.getElementById(scriptId);
  if (!scriptTag) {
    scriptTag = document.createElement('script');
    scriptTag.type = 'application/ld+json';
    scriptTag.id = scriptId;
    document.head.appendChild(scriptTag);
  }
  scriptTag.textContent = JSON.stringify(dataObject);
}

export default function SeoMetaTags() {
  useEffect(() => {
    const pageUrl = `${window.location.origin}${window.location.pathname}`;

    // Set page title
    document.title = PAGE_TITLE;

    // Search and social share tags
    setMetaTag('name', 'description', PAGE_DESCRIPTION);
    setMetaTag('property', 'og:title', PAGE_TITLE);
    setMetaTag('property', 'og:description', PAGE_DESCRIPTION);
    setMetaTag('property', 'og:type', 'website');
    setMetaTag('property', 'og:url', pageUrl);
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', PAGE_TITLE);
    setMetaTag('name', 'twitter:description', PAGE_DESCRIPTION);

    // Canonical link
    setLinkTag('canonical', pageUrl);

    // Google App information
    setGoogleStructuredData('seo-jsonld', {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Coach Connect',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'iOS, Android, Web',
      description: PAGE_DESCRIPTION,
      offers: {
        '@type': 'Offer',
        price: '59.99',
        priceCurrency: 'USD',
        availability: 'https://schema.org/PreOrder',
      },
    });
  }, []);

  return null;
}
