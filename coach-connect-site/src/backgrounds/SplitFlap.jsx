// SplitFlap.jsx — a departure board that flips through messages (DESIGN.md E1).
// The /clients band: a day of client life, one line per row.
// Each cell steps one character at a time toward its target, capped at 10 flips
// (it jumps silently when further), staggered by column and row. New message
// set every 7 seconds. Reduced motion shows the first set, no flips.
import { useEffect, useState } from 'react';
import { usePrefersReducedMotion } from '../components/hooks';

const CHARSET = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789:./+';
const COLUMNS = 12;
// Manipulate here: the messages. Each set is three lines of up to 12 characters.
const MESSAGE_SETS = [
  ['LEG DAY', '6:00 PM', 'COACH: MAYA'],
  ['WATER 5/8', 'SLEEP 7H 40', 'ENERGY 4/5'],
  ['SCAN DINNER', 'PROTEIN 112G', 'CHECK IN'],
];
const MAX_FLIPS = 10;
const FLIP_MS = 64;
const MESSAGE_MS = 7000;

const pad = (text) => text.toUpperCase().padEnd(COLUMNS, ' ').slice(0, COLUMNS);

/**
 * One character cell. Steps toward `target`; each step re-keys the flip halves.
 * @param {{ target: string, delay: number, animate: boolean }} props
 */
function FlapCell({ target, delay, animate }) {
  const [shown, setShown] = useState(target);
  const [previous, setPrevious] = useState(target);
  const [flipCount, setFlipCount] = useState(0);

  useEffect(() => {
    if (!animate) {
      setShown(target);
      setPrevious(target);
      return undefined;
    }
    let current = shown;
    let timer = 0;
    const step = () => {
      if (current === target) return;
      let currentIndex = CHARSET.indexOf(current);
      const targetIndex = CHARSET.indexOf(target);
      const distance = (targetIndex - currentIndex + CHARSET.length) % CHARSET.length;
      // 1. Too far: jump silently to 10 steps short of the target.
      if (distance > MAX_FLIPS) currentIndex = (targetIndex - MAX_FLIPS + CHARSET.length) % CHARSET.length;
      const next = CHARSET[(currentIndex + 1) % CHARSET.length];
      setPrevious(current);
      setShown(next);
      setFlipCount((count) => count + 1);
      current = next;
      timer = window.setTimeout(step, FLIP_MS);
    };
    timer = window.setTimeout(step, delay);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, animate]);

  return (
    <span className="flap">
      <span className="fl top">{shown}</span>
      <span className="fl bot">{previous}</span>
      {previous !== shown && (
        <>
          <span key={`t${flipCount}`} className="fl top flip-top">{previous}</span>
          <span key={`b${flipCount}`} className="fl bot flip-bot">{shown}</span>
        </>
      )}
    </span>
  );
}

/**
 * @returns {JSX.Element}
 */
export function SplitFlap() {
  const prefersReduced = usePrefersReducedMotion();
  const [setIndex, setSetIndex] = useState(0);

  useEffect(() => {
    if (prefersReduced) return undefined;
    const timer = window.setInterval(() => setSetIndex((index) => (index + 1) % MESSAGE_SETS.length), MESSAGE_MS);
    return () => window.clearInterval(timer);
  }, [prefersReduced]);

  const lines = MESSAGE_SETS[setIndex].map(pad);
  return (
    <div className="board" aria-hidden="true">
      {lines.map((line, row) => (
        <div key={row} className="board-row">
          {line.split('').map((character, column) => (
            <FlapCell key={column} target={character} delay={column * 45 + row * 120} animate={!prefersReduced} />
          ))}
        </div>
      ))}
    </div>
  );
}
