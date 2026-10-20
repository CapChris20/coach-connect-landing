// CardCycle — a card that rotates through items on its own, Devora-style.
// Flow: the top progress bar fills over a few seconds → when the fill finishes, the
// next item crossfades in → hovering pauses the fill and the rotation → the dots
// under the card jump straight to any item. There is NO JavaScript timer: the CSS
// fill animation ending is what advances the card, so bar and content can't drift apart.
// Used by: ui/Sections.jsx (the For Trainers card). The bar's CSS lives in index.css
// (.card-cycle-bar / .card-cycle-seg / .card-cycle-fill) — the bar is display only,
// the dots are the actual buttons.

import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

// ===== NAMED CONSTANTS =====

// Manipulate here: how long each item stays up before the next one, in milliseconds
const DEFAULT_CYCLE_DURATION_MS = 5200;

// ===== HELPER FUNCTIONS =====

/**
 * One segment of the progress bar at the top of the card.
 * Three states: already shown (full), currently filling, or still waiting (empty).
 * @param {Object} props
 * @param {boolean} props.isFinished - this item already had its turn
 * @param {boolean} props.isCurrent - this item is on screen now
 * @param {boolean} props.isPaused - the mouse is over the card
 * @param {boolean} props.doesUserPreferReducedMotion - OS reduce-motion is on
 * @param {number} props.cycleDurationMs - how long the fill takes
 * @param {number} props.restartCount - bump this to restart the fill from zero
 * @param {Function} props.onFillFinished - called when the fill animation ends
 * @returns {JSX.Element}
 */
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

  if (!isCurrent) {
    return <div className="card-cycle-seg" />;
  }

  // Reduced motion: no filling animation at all — just show the segment full.
  if (doesUserPreferReducedMotion) {
    return (
      <div className="card-cycle-seg">
        <span className="card-cycle-fill" style={{ transform: 'scaleX(1)' }} />
      </div>
    );
  }

  // The filling segment. The key restarts the CSS animation whenever the item
  // changes or a dot is clicked; onAnimationEnd is what moves the card forward.
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

// ===== MAIN FUNCTION =====

/**
 * The auto-rotating card shell. The caller decides what each item looks like.
 * @param {Object} props
 * @param {Array} props.items - the things to rotate through (each needs a tag/topic name)
 * @param {Function} props.renderItem - (item, index) → what to show for that item
 * @param {number} [props.duration] - milliseconds per item
 * @param {string} [props.testId] - data-testid prefix for the card and its parts
 * @param {string} [props.className] - extra classes for the card
 * @returns {JSX.Element}
 */
export function CardCycle({
  items,
  renderItem,
  duration = DEFAULT_CYCLE_DURATION_MS,
  testId = 'cycle-card',
  className = '',
}) {
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  // restartCount exists only to restart the fill animation when a dot re-selects
  // an item — bumping it changes the fill's key, and a new key restarts the animation.
  const [restartCount, setRestartCount] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [doesUserPreferReducedMotion, setDoesUserPreferReducedMotion] = useState(false);

  // Respect the OS reduce-motion setting: no autoplay at all (CSS also hides the bar).
  // vocab: matchMedia = live query against the OS/browser settings; it fires again
  // if the user toggles the setting while the page is open
  useEffect(() => {
    const reducedMotionSetting = window.matchMedia('(prefers-reduced-motion: reduce)');
    const saveReducedMotionSetting = () => setDoesUserPreferReducedMotion(reducedMotionSetting.matches);
    saveReducedMotionSetting();
    reducedMotionSetting.addEventListener('change', saveReducedMotionSetting);
    return () => reducedMotionSetting.removeEventListener('change', saveReducedMotionSetting);
  }, []);

  const showNextItem = useCallback(() => {
    setCurrentItemIndex((currentIndex) => (currentIndex + 1) % items.length);
  }, [items.length]);

  const jumpToItem = useCallback((itemIndex) => {
    setCurrentItemIndex(itemIndex);
    setRestartCount((currentCount) => currentCount + 1);
  }, []);

  const pauseCycle = () => setIsPaused(true);
  const resumeCycle = () => setIsPaused(false);

  // The progress bar, one segment per item.
  const progressSegments = items.map((item, i) => (
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
  ));

  // The dots under the card — the buttons a person can actually click.
  const cycleDots = items.map((item, i) => {
    const isCurrentDot = i === currentItemIndex;
    const dotClassName = isCurrentDot
      ? 'h-2 w-7 rounded-full bg-gradient-to-r from-pink to-orange transition-all duration-300'
      : 'h-2 w-2 rounded-full bg-white/25 transition-all duration-300 hover:bg-white/45';
    return (
      <button
        key={item.tag ?? item.topic ?? i}
        type="button"
        onClick={() => jumpToItem(i)}
        aria-label={`Show ${item.tag ?? item.topic ?? `item ${i + 1}`}`}
        aria-current={isCurrentDot || undefined}
        data-testid={`${testId}-dot`}
        className={dotClassName}
      />
    );
  });

  return (
    <div
      className={`cycle-card cc-card relative rounded-3xl px-6 pb-6 pt-10 sm:px-7 sm:pb-7 ${className}`}
      onMouseEnter={pauseCycle}
      onMouseLeave={resumeCycle}
      data-testid={testId}
    >
      <div className="card-cycle-bar" aria-hidden="true" data-testid={`${testId}-progress`}>
        {progressSegments}
      </div>

      {/* vocab: AnimatePresence mode="wait" = old item fades out before the new one enters */}
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

      <div className="mt-6 flex items-center justify-center gap-2" data-testid={`${testId}-dots`}>
        {cycleDots}
      </div>
    </div>
  );
}
