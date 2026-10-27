// Kinetic.jsx — section headings. Kept as a component so pages read the same,
// but it no longer animates: per the cleanup brief, content below the hero is
// visible by default and nothing waits for a scroll to appear.
import { createElement } from 'react';

/**
 * @param {{ as?: string, text: string, className?: string, id?: string, children?: React.ReactNode }} props
 * @returns {JSX.Element}
 */
export function Kinetic({ as = 'h2', text, className = '', id, children }) {
  return createElement(as, { className, id }, children ?? text);
}
