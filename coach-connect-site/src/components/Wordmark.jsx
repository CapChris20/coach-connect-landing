// Wordmark.jsx — the COACHCONNECT text logo, as on the first site: COACH in
// white, CONNECT in the pink-to-orange gradient, Unbounded 800, one line.

/**
 * @param {{ className?: string }} props
 * @returns {JSX.Element}
 */
export function Wordmark({ className = '' }) {
  return (
    <span className={`wordmark ${className}`}>
      <span className="wordmark-coach">COACH</span>
      <span className="wordmark-connect">CONNECT</span>
    </span>
  );
}
