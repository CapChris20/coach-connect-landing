// Seo.jsx — per-page title, description, Open Graph and canonical (DESIGN.md section 11).
// The canonical URL is built from window.location, never a hardcoded domain.
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Find or create a <meta>/<link> tag in <head> and set one attribute on it.
 * @param {string} selector
 * @param {() => HTMLElement} create
 * @param {string} attribute
 * @param {string} value
 */
function upsertHeadTag(selector, create, attribute, value) {
  let tag = document.head.querySelector(selector);
  if (!tag) {
    tag = create();
    document.head.appendChild(tag);
  }
  tag.setAttribute(attribute, value);
}

function metaTag(attributeName, attributeValue) {
  return () => {
    const tag = document.createElement('meta');
    tag.setAttribute(attributeName, attributeValue);
    return tag;
  };
}

/**
 * Writes this page's head tags. Renders nothing.
 * @param {{ title: string, description: string }} props
 * @returns {null}
 */
export function Seo({ title, description }) {
  const { pathname } = useLocation();

  useEffect(() => {
    const canonicalUrl = `${window.location.origin}${pathname}`;
    document.title = title;
    upsertHeadTag('meta[name="description"]', metaTag('name', 'description'), 'content', description);
    upsertHeadTag('meta[property="og:title"]', metaTag('property', 'og:title'), 'content', title);
    upsertHeadTag('meta[property="og:description"]', metaTag('property', 'og:description'), 'content', description);
    upsertHeadTag('meta[property="og:url"]', metaTag('property', 'og:url'), 'content', canonicalUrl);
    upsertHeadTag('meta[property="og:image"]', metaTag('property', 'og:image'), 'content', `${window.location.origin}/videos/dumbbell-glide-poster.jpg`);
    upsertHeadTag(
      'link[rel="canonical"]',
      () => {
        const link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        return link;
      },
      'href',
      canonicalUrl,
    );
  }, [title, description, pathname]);

  return null;
}
