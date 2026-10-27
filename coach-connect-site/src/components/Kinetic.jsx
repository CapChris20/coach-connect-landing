// Kinetic.jsx — per-letter heading reveal (DESIGN.md B1). Words stay whole,
// letters rise from y 115% and rotate 9deg with a springy ease, 0.028s apart.
// Plays once when the heading is half in view (or on mount). Screen readers get
// the plain text via aria-label; reduced motion renders plain text.
// Use on at most three headings per page.
import { createElement, useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from './hooks';

const STAGGER_SECONDS = 0.028;

/**
 * @param {{ as?: string, text: string, className?: string, id?: string, onMount?: boolean }} props
 * @returns {JSX.Element}
 */
export function Kinetic({ as = 'h2', text, className = '', id, onMount = false }) {
  const headingRef = useRef(null);
  const prefersReduced = usePrefersReducedMotion();
  const [isShown, setIsShown] = useState(onMount);

  useEffect(() => {
    if (onMount || prefersReduced) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setIsShown(true);
        observer.disconnect();
      },
      { threshold: 0.5 },
    );
    observer.observe(headingRef.current);
    return () => observer.disconnect();
  }, [onMount, prefersReduced]);

  if (prefersReduced) return createElement(as, { className, id }, text);

  let letterIndex = 0;
  const wordList = text.split(' ');
  const words = wordList.flatMap((word, wordIndex) => [
    wordIndex > 0 ? ' ' : null,
    <span key={wordIndex} className="k-word" aria-hidden="true">
      {word.split('').map((letter) => {
        const delay = `${(letterIndex += 1) * STAGGER_SECONDS}s`;
        return (
          <span key={letterIndex} className="k-letter" style={{ animationDelay: delay }}>
            {letter}
          </span>
        );
      })}
    </span>,
  ]);

  return createElement(as, { ref: headingRef, className: `${className} kinetic ${isShown ? 'is-shown' : ''}`, id, 'aria-label': text }, words);
}
