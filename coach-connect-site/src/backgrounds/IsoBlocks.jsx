// IsoBlocks.jsx — a rolling field of isometric columns (DESIGN.md D2), the
// trainer page's band: reads as analytics, roster, revenue. Drawn back to front,
// three faces per block, height ramped through ink, pink and orange.
import { useCallback } from 'react';
import { cssVar, hexToRgb, useCanvasLoop } from './plumbing';

const GRID = 12;

const shade = ([r, g, b], amount) => `rgb(${Math.round(r * amount)},${Math.round(g * amount)},${Math.round(b * amount)})`;
const mix = (a, b, t) => a.map((channel, index) => channel + (b[index] - channel) * t);

/**
 * @returns {JSX.Element}
 */
export function IsoBlocks() {
  const draw = useCallback((context, width, height, time) => {
    const low = hexToRgb(cssVar('--surface-2'));
    const mid = hexToRgb(cssVar('--pink'));
    const high = hexToRgb(cssVar('--orange'));
    context.clearRect(0, 0, width, height);
    const tile = Math.min(width / (GRID * 1.25), height / (GRID * 0.62));
    const centerX = width * 0.62;
    const centerY = height * 0.12;

    for (let sum = 0; sum <= (GRID - 1) * 2; sum += 1) {
      for (let i = 0; i < GRID; i += 1) {
        const j = sum - i;
        if (j < 0 || j >= GRID) continue;
        const level = 0.12 + (0.5 + 0.5 * Math.sin(i * 0.55 + time * 1.1) * Math.cos(j * 0.5 - time * 0.8)) * 0.7;
        const blockHeight = level * tile * 3.4;
        const x = centerX + (i - j) * tile * 0.866;
        const y = centerY + (i + j) * tile * 0.5;
        const base = level < 0.45 ? mix(low, mid, level / 0.45) : mix(mid, high, (level - 0.45) / 0.37);

        context.fillStyle = shade(base, 0.5);
        context.beginPath();
        context.moveTo(x - tile * 0.866, y);
        context.lineTo(x, y + tile * 0.5);
        context.lineTo(x, y + tile * 0.5 - blockHeight);
        context.lineTo(x - tile * 0.866, y - blockHeight);
        context.fill();

        context.fillStyle = shade(base, 0.72);
        context.beginPath();
        context.moveTo(x + tile * 0.866, y);
        context.lineTo(x, y + tile * 0.5);
        context.lineTo(x, y + tile * 0.5 - blockHeight);
        context.lineTo(x + tile * 0.866, y - blockHeight);
        context.fill();

        context.fillStyle = shade(base, 1);
        context.beginPath();
        context.moveTo(x, y - blockHeight - tile * 0.5);
        context.lineTo(x + tile * 0.866, y - blockHeight);
        context.lineTo(x, y - blockHeight + tile * 0.5);
        context.lineTo(x - tile * 0.866, y - blockHeight);
        context.fill();
      }
    }
  }, []);
  const canvasRef = useCanvasLoop(draw, { maxDpr: 1.5 });
  return <canvas ref={canvasRef} className="bg-canvas" />;
}
