// Shapes.jsx — big Bauhaus shapes behind a scene, drifting and turning as the
// scene scrolls past (DESIGN.md C2). Sizes in vw so they scale. Scroll is read
// into a ref and written straight to transforms, no React re-render.
import { useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from '../components/hooks';

/**
 * @param {{ shapes: Array<{ kind: 'circle' | 'half' | 'ring' | 'bar' | 'triangle', style: object, drift?: number, turn?: number, slide?: number }> }} props
 * @returns {JSX.Element}
 */
export function Shapes({ shapes }) {
  const wrapperRef = useRef(null);
  const shapeRefs = useRef([]);
  const prefersReduced = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReduced) return undefined;
    let frameId = 0;
    const update = () => {
      frameId = 0;
      const box = wrapperRef.current.getBoundingClientRect();
      // 0 when the scene enters from below, 1 when it leaves at the top
      const progress = Math.min(1, Math.max(0, (window.innerHeight - box.top) / (window.innerHeight + box.height)));
      shapes.forEach((shape, index) => {
        const element = shapeRefs.current[index];
        if (!element) return;
        const y = (shape.drift ?? 100) * (0.4 - progress);
        const x = (shape.slide ?? 0) * (progress - 0.5);
        const rotation = (shape.turn ?? 0) * progress;
        element.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rotation}deg)`;
      });
    };
    const onScroll = () => {
      if (!frameId) frameId = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frameId);
    };
  }, [shapes, prefersReduced]);

  return (
    <div ref={wrapperRef} className="bg-layer" aria-hidden="true">
      {shapes.map((shape, index) => (
        <div
          key={index}
          ref={(element) => {
            shapeRefs.current[index] = element;
          }}
          className={`shape shape-${shape.kind}`}
          style={shape.style}
        />
      ))}
    </div>
  );
}
