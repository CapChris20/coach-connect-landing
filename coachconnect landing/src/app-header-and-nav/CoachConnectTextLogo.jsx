// CoachConnectTextLogo.jsx
// The "COACH CONNECT" text logo used in the navbar, hero, and footer.

import './navigation.css';

export function CoachConnectTextLogo({ className = '', stacked = true, size = 'hero' }) {
  const layoutClass = stacked ? 'stacked' : 'inline';
  const sizeClass = `size-${size}`;
  const depthClass = size === 'hero' ? 'display-extrude' : '';

  return (
    <div
      className={`coach-connect-text-logo ${layoutClass} ${sizeClass} ${depthClass} ${className}`}
      data-testid="wordmark"
    >
      <span className="coach-connect-text-logo-word coach-word">COACH</span>
      <span className="coach-connect-text-logo-word wordmark-connect">CONNECT</span>
    </div>
  );
}

// Keep backward compatibility export
export { CoachConnectTextLogo as Wordmark };
