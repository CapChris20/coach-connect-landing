// Wordmark.jsx — the COACH CONNECT text logo. The wordmark is one of the two
// places the full three-colour sweep is allowed (DESIGN.md section 3).

/**
 * @param {{ className?: string }} props
 * @returns {JSX.Element}
 */
export function Wordmark({ className = '' }) {
  return (
    <span className={`wordmark ${className}`}>
      <span className="wordmark-mark" aria-hidden="true" />
      <span className="wordmark-text">Coach Connect</span>
    </span>
  );
}
