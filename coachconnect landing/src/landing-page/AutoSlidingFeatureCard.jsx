// AutoSlidingFeatureCard.jsx
// A card that automatically cycles through features with progress bars at the top (like Instagram stories).
// Hovering over the card pauses it. Clicking the dots at the bottom jumps to any item.

import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import './landing-page.css';

const DEFAULT_CYCLE_DURATION_MS = 5200;

// Individual progress bar segment at top of the card
function ProgressSegment({
  isFinished,
  isCurrent,
  isPaused,
  doesUserPreferReducedMotion,
  cycleDurationMs,
  restartCount,
  onFillFinished,
}) {
  if (isFinished) {
    return (
      <div className="card-cycle-seg">
        <span className="card-cycle-fill" style={{ transform: 'scaleX(1)' }} />
      </div>
    );
  }

  if (!isCurrent || doesUserPreferReducedMotion) {
    return (
      <div className="card-cycle-seg">
        <span className="card-cycle-fill" style={{ transform: doesUserPreferReducedMotion ? 'scaleX(1)' : 'scaleX(0)' }} />
      </div>
    );
  }

  const fillPlayState = isPaused ? 'paused' : 'running';
  return (
    <div className="card-cycle-seg">
      <span
        key={restartCount}
        className="card-cycle-fill card-cycle-fill-active"
        style={{ animationDuration: `${cycleDurationMs}ms`, animationPlayState: fillPlayState }}
        onAnimationEnd={onFillFinished}
      />
    </div>
  );
}

// Main Card Component
export function AutoSlidingFeatureCard({
  items,
  renderItem,
  duration = DEFAULT_CYCLE_DURATION_MS,
  testId = 'cycle-card',
  className = '',
}) {
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [restartCount, setRestartCount] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [doesUserPreferReducedMotion, setDoesUserPreferReducedMotion] = useState(false);

  // Check if system prefers reduced motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion = () => setDoesUserPreferReducedMotion(mediaQuery.matches);
    updateMotion();
    mediaQuery.addEventListener('change', updateMotion);
    return () => mediaQuery.removeEventListener('change', updateMotion);
  }, []);

  const showNextItem = useCallback(() => {
    setCurrentItemIndex((prev) => (prev + 1) % items.length);
  }, [items.length]);

  const jumpToItem = useCallback((index) => {
    setCurrentItemIndex(index);
    setRestartCount((prev) => prev + 1);
  }, []);

  const pauseCycle = () => setIsPaused(true);
  const resumeCycle = () => setIsPaused(false);

  return (
    <div
      className={`auto-sliding-card cc-card ${className}`}
      onMouseEnter={pauseCycle}
      onMouseLeave={resumeCycle}
      data-testid={testId}
    >
      {/* Top progress bars */}
      <div className="card-cycle-bar" aria-hidden="true" data-testid={`${testId}-progress`}>
        {items.map((item, i) => (
          <ProgressSegment
            key={item.tag ?? item.topic ?? i}
            isFinished={i < currentItemIndex}
            isCurrent={i === currentItemIndex}
            isPaused={isPaused}
            doesUserPreferReducedMotion={doesUserPreferReducedMotion}
            cycleDurationMs={duration}
            restartCount={`${currentItemIndex}:${restartCount}`}
            onFillFinished={showNextItem}
          />
        ))}
      </div>

      {/* Crossfading content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentItemIndex}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          {renderItem(items[currentItemIndex], currentItemIndex)}
        </motion.div>
      </AnimatePresence>

      {/* Clickable navigation dots */}
      <div className="auto-sliding-card-dots" data-testid={`${testId}-dots`}>
        {items.map((item, i) => {
          const isCurrentDot = i === currentItemIndex;
          return (
            <button
              key={item.tag ?? item.topic ?? i}
              type="button"
              onClick={() => jumpToItem(i)}
              aria-label={`Show ${item.tag ?? item.topic ?? `item ${i + 1}`}`}
              aria-current={isCurrentDot || undefined}
              data-testid={`${testId}-dot`}
              className={`auto-sliding-dot ${isCurrentDot ? 'active' : ''}`}
            />
          );
        })}
      </div>
    </div>
  );
}

// Backward-compatible alias
export { AutoSlidingFeatureCard as CardCycle };
