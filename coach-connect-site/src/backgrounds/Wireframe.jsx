// Wireframe.jsx — perspective wireframe terrain with two spinning solids
// (DESIGN.md D1). Time can come from scroll (timeRef) so it moves as you scroll.
// Colours read from tokens. Used behind the pinned tour reels.
import { useCallback } from 'react';
import { cssVar, hexToRgb, useCanvasLoop } from './plumbing';

const COLUMNS = 34;
const ROWS = 20;
const CUBE = {
  points: [[-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1], [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]],
  edges: [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]],
};
const OCTAHEDRON = {
  points: [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]],
  edges: [[0, 2], [0, 3], [0, 4], [0, 5], [1, 2], [1, 3], [1, 4], [1, 5], [2, 4], [4, 3], [3, 5], [5, 2]],
};

/**
 * Turn a solid about Y then X, then project it to the screen.
 */
function drawSolid(context, solid, { centerX, centerY, size, time, spin }) {
  const yaw = time * spin;
  const pitch = time * spin * 0.7;
  const projected = solid.points.map(([x, y, z]) => {
    const x1 = x * Math.cos(yaw) - z * Math.sin(yaw);
    const z1 = x * Math.sin(yaw) + z * Math.cos(yaw);
    const y1 = y * Math.cos(pitch) - z1 * Math.sin(pitch);
    const z2 = y * Math.sin(pitch) + z1 * Math.cos(pitch);
    const depth = 1 / (3.2 + z2);
    return [centerX + x1 * size * depth * 3, centerY + y1 * size * depth * 3];
  });
  context.beginPath();
  solid.edges.forEach(([from, to]) => {
    context.moveTo(projected[from][0], projected[from][1]);
    context.lineTo(projected[to][0], projected[to][1]);
  });
  context.stroke();
}

/**
 * @param {{ timeRef?: { current: number } }} props
 * @returns {JSX.Element}
 */
export function Wireframe({ timeRef = null }) {
  const draw = useCallback((context, width, height, time, pointer) => {
    const [r1, g1, b1] = hexToRgb(cssVar('--orange'));
    const [r2, g2, b2] = hexToRgb(cssVar('--pink'));
    context.clearRect(0, 0, width, height);
    const focal = Math.min(width, height * 1.8) * 0.95;
    const cameraY = 2.4;
    const tilt = (pointer.x - 0.5) * 1.4;
    const project = (x, y, z) => [width / 2 + ((x + tilt * z * 0.3) / z) * focal, height * 0.4 + ((cameraY - y) / z) * focal * 0.62];
    const heightAt = (column, row) =>
      (Math.sin(column * 0.45 + time * 0.9 + row * 0.3) * 0.45 + Math.sin(row * 0.5 - time * 0.6) * 0.35) * (0.35 + (0.65 * row) / ROWS);

    // 1. Rows: one path each, brighter toward the camera.
    context.lineWidth = 1.2;
    for (let row = 0; row < ROWS; row += 1) {
      const z = 1.2 + (ROWS - row) * 0.55;
      context.strokeStyle = `rgba(${r1},${g1},${b1},${0.22 + (0.7 * row) / ROWS})`;
      context.beginPath();
      for (let column = 0; column <= COLUMNS; column += 1) {
        const [sx, sy] = project((column - COLUMNS / 2) * 0.5, heightAt(column, row), z);
        if (column === 0) context.moveTo(sx, sy);
        else context.lineTo(sx, sy);
      }
      context.stroke();
    }

    // 2. Columns: faint at the horizon, strong near the viewer.
    const columnStroke = context.createLinearGradient(0, height * 0.35, 0, height);
    columnStroke.addColorStop(0, `rgba(${r2},${g2},${b2},0.05)`);
    columnStroke.addColorStop(1, `rgba(${r2},${g2},${b2},0.6)`);
    context.strokeStyle = columnStroke;
    for (let column = 0; column <= COLUMNS; column += 1) {
      context.beginPath();
      for (let row = 0; row < ROWS; row += 1) {
        const z = 1.2 + (ROWS - row) * 0.55;
        const [sx, sy] = project((column - COLUMNS / 2) * 0.5, heightAt(column, row), z);
        if (row === 0) context.moveTo(sx, sy);
        else context.lineTo(sx, sy);
      }
      context.stroke();
    }

    // 3. Two solids, off to the right so they stay clear of the caption.
    context.lineWidth = 1.8;
    context.strokeStyle = `rgba(${r1},${g1},${b1},0.85)`;
    drawSolid(context, CUBE, { centerX: width * 0.86, centerY: height * 0.2, size: Math.min(width, height) * 0.1, time, spin: 0.5 });
    context.strokeStyle = `rgba(${r2},${g2},${b2},0.85)`;
    drawSolid(context, OCTAHEDRON, { centerX: width * 0.08, centerY: height * 0.16, size: Math.min(width, height) * 0.08, time, spin: 0.7 });
  }, []);

  const canvasRef = useCanvasLoop(draw, { maxDpr: 1.5, timeRef });
  return <canvas ref={canvasRef} className="bg-canvas" />;
}
