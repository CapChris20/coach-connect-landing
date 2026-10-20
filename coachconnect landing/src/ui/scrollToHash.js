// scrollToHash — helpers for every anchor jump on the site.
// Flow: find the section → glide to it with Lenis, or fall back to native smooth scroll.
// Two entry points: scrollToHash for clicks made on the landing page itself,
// scrollToSection for arriving on "/" with a hash already in the URL (the nav
// sends people home that way from the /for-trainers and /for-clients pages).
// Used by: navbar/NavBar.jsx, ui/Sections.jsx, pages/Landing.jsx.

// ===== MAIN FUNCTIONS =====

/**
 * Glide to a section that is already rendered on this page. No click event,
 * no preventDefault — the caller owns those.
 * @param {string} sectionHash - the section to go to, like "#act-pricing"
 * @returns {void}
 */
export function scrollToSection(sectionHash) {
  // vocab: window.smoothScroller = the Lenis instance pages/Landing.jsx stores
  // globally so any component can reach it. Reduced-motion users never get one
  // (Lenis stays off for them), which is why the native fallback in step 2 matters.

  // 1. Find the section. If it is not on this page, do nothing.
  const targetSection = document.querySelector(sectionHash);
  if (!targetSection) return;

  // 2. Glide with Lenis when it is running; native smooth scroll when it is not.
  // Manipulate here: offset -64 clears the fixed nav bar; duration 1.1 = page glide speed
  if (window.smoothScroller) {
    window.smoothScroller.scrollTo(targetSection, { offset: -64, duration: 1.1 });
  } else {
    targetSection.scrollIntoView({ behavior: 'smooth' });
  }
}

/**
 * Click-handler version: stop the browser's instant jump, then glide.
 * @param {Event} e - the click event (kept so we can stop the browser's instant jump)
 * @param {string} sectionHash - the section to go to, like "#act-pricing"
 * @returns {void}
 */
export function scrollToHash(e, sectionHash) {
  // 1. If the section is not on this page, leave the browser's default alone
  // (the nav intercepts that case before it ever gets here).
  if (!document.querySelector(sectionHash)) return;

  // 2. Stop the browser from snapping straight to it.
  e.preventDefault();

  // 3. Glide.
  scrollToSection(sectionHash);
}
