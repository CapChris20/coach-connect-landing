// AsciiSun.jsx — the footer scene (DESIGN.md D4): a sliced sun over a
// perspective grid, drawn as characters. Drawn once as a still: the footer
// does not animate.
import { useCallback } from 'react';
import { cssVar, useCanvasLoop } from './plumbing';

const RAMP = ' .:-=+*#%@';
const CELL_WIDTH = 11;
const CELL_HEIGHT = 18;

/**
 * @returns {JSX.Element}
 */
export function AsciiSun() {
  const draw = useCallback((context, width, height, time) => {
    const colours = [cssVar('--text-muted'), cssVar('--pink'), cssVar('--orange')];
    context.clearRect(0, 0, width, height);
    context.font = '15px "Space Mono", monospace';
    context.textBaseline = 'top';
    const columns = Math.ceil(width / CELL_WIDTH);
    const rows = Math.ceil(height / CELL_HEIGHT);
    const horizon = 0.62;
    const sunX = 0.8;
    const sunRadius = 0.3;

    for (let row = 0; row < rows; row += 1) {
      const py = row / rows;
      for (let column = 0; column < columns; column += 1) {
        const px = column / columns;
        let brightness = 0;
        if (py < horizon) {
          // sun: a disc cut by bars that scroll down through its lower half
          const dx = (px - sunX) * (width / height);
          const dy = py - horizon * 0.72;
          const inside = Math.sqrt(dx * dx + dy * dy) < sunRadius;
          const bar = dy > 0 && Math.sin((dy * 40) - time * 3) > 0.3;
          if (inside && !bar) brightness = 0.95 - Math.max(0, dy) * 1.6;
          else if (((column * 7 + row * 13) % 97 === 0)) brightness = 0.4 + 0.4 * Math.sin(time * 2 + column);
        } else {
          // grid below the horizon: lines where fract(z) and fract(x) are near an edge
          const z = 1 / (py - horizon + 0.001);
          const gridZ = (z * 0.6 + time * 1.4) % 1;
          const gridX = Math.abs(((px - 0.5) * z * 1.6) % 1);
          const onLine = gridZ < 0.08 || gridX < 0.05 || gridX > 0.95;
          brightness = onLine ? Math.max(0, 0.9 - z * 0.05) : 0;
        }
        if (brightness <= 0.05) continue;
        const rampIndex = Math.min(RAMP.length - 1, Math.floor(brightness * RAMP.length));
        context.fillStyle = colours[brightness > 0.7 ? 2 : brightness > 0.4 ? 1 : 0];
        context.fillText(RAMP[rampIndex], column * CELL_WIDTH, row * CELL_HEIGHT);
      }
    }
  }, []);
  const canvasRef = useCanvasLoop(draw, { maxDpr: 1.5, still: true });
  return <canvas ref={canvasRef} className="bg-canvas" />;
}
