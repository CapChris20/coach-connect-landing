// Seo — everything the page tells search engines and social apps about itself.
// Flow: when the landing page loads → work out this page's own URL → write the
// title, description, social tags, canonical link, and structured data into <head>.
// Used by: pages/Landing.jsx. Never hardcode the domain — always read it from the page.

import { useEffect } from 'react';

// ===== NAMED CONSTANTS =====

const PAGE_TITLE = 'Coach Connect — Find your coach. Run your business. One app.';
// This mirrors the hero support line in ui/Sections.jsx word for word —
// if the hero copy changes, change this too (search results show this, not the hero).
const PAGE_DESCRIPTION =
  'Client messaging, workout plans, nutrition tracking, documents and in-app payments, plus an AI Coach that asks before it changes anything.';

// ===== HELPER FUNCTIONS =====

/**
 * Find a <meta> tag in <head>, or create it if this is the first run.
 * Creating only when missing means React dev mode (which runs effects twice)
 * can never duplicate tags.
 * @param {string} attributeName - "name" or "property" (Open Graph uses property)
 * @param {string} tagName - like "description" or "og:title"
 * @param {string} content - what the tag should say
 * @returns {void}
 */
function findOrCreateMetaTag(attributeName, tagName, content) {
  let metaTag = document.head.querySelector(`meta[${attributeName}="${tagName}"]`);
  if (!metaTag) {
    metaTag = document.createElement('meta');
    metaTag.setAttribute(attributeName, tagName);
    document.head.appendChild(metaTag);
  }
  metaTag.setAttribute('content', content);
}

/**
 * Find a <link> tag in <head>, or create it if this is the first run.
 * Used for the canonical link, which tells search engines the one true URL.
 * @param {string} relationName - like "canonical"
 * @param {string} href - the URL the link points at
 * @returns {void}
 */
function findOrCreateLinkTag(relationName, href) {
  let linkTag = document.head.querySelector(`link[rel="${relationName}"]`);
  if (!linkTag) {
    linkTag = document.createElement('link');
    linkTag.setAttribute('rel', relationName);
    document.head.appendChild(linkTag);
  }
  linkTag.setAttribute('href', href);
}

/**
 * Find the JSON-LD script in <head>, or create it, then fill it with fresh data.
 * vocab: JSON-LD = a block of structured facts (name, price, availability) written
 * in a format Google can read directly: <script type="application/ld+json">
 * @param {string} scriptId - the script's id, so we can find it again next run
 * @param {Object} structuredData - the facts, as a plain object
 * @returns {void}
 */
function findOrCreateJsonLdScript(scriptId, structuredData) {
  let scriptTag = document.getElementById(scriptId);
  if (!scriptTag) {
    scriptTag = document.createElement('script');
    scriptTag.type = 'application/ld+json';
    scriptTag.id = scriptId;
    document.head.appendChild(scriptTag);
  }
  scriptTag.textContent = JSON.stringify(structuredData);
}

// ===== MAIN FUNCTION =====

/**
 * Writes all the SEO tags into <head>. Renders nothing on the page itself.
 * @returns {null}
 */
export default function Seo() {
  // vocab: useEffect = React hook that runs after the page paints
  useEffect(() => {
    // 1. Work out this page's own URL from wherever it is actually hosted.
    // Manipulate here: if a path prefix is ever added, it flows through on its own
    const pageOrigin = window.location.origin;
    const pageUrl = `${pageOrigin}${window.location.pathname}`;

    // 2. Title, description, and the tags social apps read when the link is shared.
    document.title = PAGE_TITLE;
    findOrCreateMetaTag('name', 'description', PAGE_DESCRIPTION);
    findOrCreateMetaTag('property', 'og:title', PAGE_TITLE);
    findOrCreateMetaTag('property', 'og:description', PAGE_DESCRIPTION);
    findOrCreateMetaTag('property', 'og:type', 'website');
    findOrCreateMetaTag('property', 'og:url', pageUrl);
    findOrCreateMetaTag('name', 'twitter:card', 'summary_large_image');
    findOrCreateMetaTag('name', 'twitter:title', PAGE_TITLE);
    findOrCreateMetaTag('name', 'twitter:description', PAGE_DESCRIPTION);

    // 3. Canonical link — the one URL search engines should treat as the original.
    findOrCreateLinkTag('canonical', pageUrl);

    // 4. Structured data: what this is, what it costs, and that it is pre-launch.
    // The price must stay in sync with the pricing section ($59.99 today).
    // Manipulate here: switch availability to InStock when the app actually launches
    findOrCreateJsonLdScript('seo-jsonld', {
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

  // Nothing shows on the page — every effect above happens inside <head>.
  return null;
}
