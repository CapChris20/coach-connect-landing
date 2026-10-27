// plumbing.jsx — shared pieces every background uses (DESIGN.md library A).
// cssVar: read a colour token for canvas code. LazyMount: only mount a canvas
// while it is near the viewport. useCanvasLoop: size, DPR cap, per-frame draw,
// one static frame under reduced motion, cleanup. tornEdge: seeded jagged clip-path.
import { useEffect, useRef, useState } from 'react';

/**
 * Read a CSS custom property from :root.
 * @param {string} name e.g. '--pink'
 * @returns {string}
 */
export const cssVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

/**
 * "#rrggbb" to [r, g, b].
 * @param {string} hex
 * @returns {[number, number, number]}
 */
export const hexToRgb = (hex) => {
  const value = parseInt(hex.replace('#', ''), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
};

/**
 * Mounts its children only while the wrapper is within `margin` of the viewport.
 * @param {{ children: React.ReactNode, margin?: string }} props
 * @returns {JSX.Element}
 */
export function LazyMount({ children, margin = '150px' }) {
  const wrapperRef = useRef(null);
  const [isNear, setIsNear] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setIsNear(entry.isIntersecting), { rootMargin: margin });
    observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, [margin]);
  return (
    <div ref={wrapperRef} className="bg-layer" aria-hidden="true">
      {isNear ? children : null}
    </div>
  );
}

/**
 * Runs `draw(context, width, height, seconds, pointer)` every frame on a canvas.
 * `timeRef`, when given, replaces the clock (scroll-driven backgrounds).
 * @param {Function} draw
 * @param {{ maxDpr?: number, timeRef?: { current: number }, fps?: number }} [options]
 * @returns {{ current: HTMLCanvasElement | null }}
 */
export function useCanvasLoop(draw, { maxDpr = 2, timeRef = null, fps = 60 } = {}) {
  const canvasRef = useRef(null);
  const drawRef = useRef(draw);
  useEffect(() => {
    drawRef.current = draw;
  }, [draw]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const pointer = { x: 0.5, y: 0.5 };
    const minFrameMs = 1000 / fps;
    let width = 1;
    let height = 1;
    let frameId = 0;
    let lastDraw = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
      const box = canvas.getBoundingClientRect();
      width = box.width;
      height = box.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const trackPointer = (event) => {
      const box = canvas.getBoundingClientRect();
      pointer.x = (event.clientX - box.left) / box.width;
      pointer.y = (event.clientY - box.top) / box.height;
    };
    const loop = (now) => {
      if (now - lastDraw >= minFrameMs) {
        lastDraw = now;
        const seconds = timeRef ? timeRef.current : now / 1000;
        drawRef.current(context, width, height, prefersReduced && !timeRef ? 4 : seconds, pointer);
      }
      if (!prefersReduced || timeRef) frameId = requestAnimationFrame(loop);
    };

    resize();
    frameId = requestAnimationFrame(loop);
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', trackPointer, { passive: true });
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', trackPointer);
    };
  }, [maxDpr, timeRef, fps]);

  return canvasRef;
}

// vocab: mulberry32 = a tiny seeded random generator, so the same seed draws the same edge every render
function mulberry32(seed) {
  let state = seed;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let mixed = Math.imul(state ^ (state >>> 15), 1 | state);
    mixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed;
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * A jagged top edge as a clip-path polygon (bottom edge stays straight).
 * Manipulate here: amp = jitter in px, steps = points along the edge.
 * @param {number} seed
 * @param {number} [amp]
 * @param {number} [steps]
 * @returns {string}
 */
export function tornTopEdge(seed, amp = 18, steps = 44) {
  const random = mulberry32(seed);
  const topPoints = [];
  for (let index = 0; index <= steps; index += 1) {
    const x = ((index / steps) * 100).toFixed(2);
    topPoints.push(`${x}% ${(random() * amp).toFixed(1)}px`);
  }
  return `polygon(${topPoints.join(',')}, 100% 100%, 0% 100%)`;
}
