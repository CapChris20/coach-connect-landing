// smoothScrollHelper.js
// Helper functions to smoothly scroll down the page when a link or button is clicked.

// Smoothly scrolls the window down to an element with a given ID (like "#pricing")
export function scrollToSection(sectionHash) {
  const targetElement = document.querySelector(sectionHash);
  if (!targetElement) return;

  // If smooth scroller is active, use it with an offset so the fixed navbar doesn't cover the title
  if (window.smoothScroller) {
    window.smoothScroller.scrollTo(targetElement, { offset: -64, duration: 1.1 });
  } else {
    // Otherwise use the browser's built-in smooth scroll
    targetElement.scrollIntoView({ behavior: 'smooth' });
  }
}

// Click event handler that prevents instant jumping and scrolls smoothly instead
export function scrollToHash(event, sectionHash) {
  if (!document.querySelector(sectionHash)) return;

  if (event && event.preventDefault) {
    event.preventDefault();
  }
  scrollToSection(sectionHash);
}
