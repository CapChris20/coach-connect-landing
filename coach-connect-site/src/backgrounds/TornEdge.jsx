// TornEdge.jsx — the paper cutout seam between two scenes (DESIGN.md C3).
// Three stacked sheets, each with its own seed and fill, the inner ones set
// lower, so the next scene looks like layered torn paper rising over this one.
// Place it as the last child of a scene; `fills` are the three sheet colours,
// last one = the next scene's background.
import { tornTopEdge } from './plumbing';

const SHEET_OFFSETS = [0, 16, 32];

/**
 * @param {{ fills: [string, string, string], seed?: number }} props
 * @returns {JSX.Element}
 */
export function TornEdge({ fills, seed = 7 }) {
  return (
    <div className="torn-edge" aria-hidden="true">
      {fills.map((fill, sheetIndex) => (
        <div
          key={fill + sheetIndex}
          className="torn-sheet"
          style={{ background: fill, top: SHEET_OFFSETS[sheetIndex], clipPath: tornTopEdge(seed + sheetIndex * 13) }}
        />
      ))}
    </div>
  );
}
