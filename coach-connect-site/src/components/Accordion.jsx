// Accordion.jsx — question and answer rows. One open at a time.
// Uses a real <button> with aria-expanded and a labelled region (DESIGN.md section 11).
// The opening is one of the page's small, user-triggered motion moments.
import { useId, useState } from 'react';
import { PlusIcon } from './Icons';

/**
 * @param {Object} props
 * @param {Array<{ id: string, q: string, a: string }>} props.items
 * @param {string | null} [props.initiallyOpenId]
 * @param {'md' | 'lg'} [props.size] - lg = the big editorial rows on the homepage
 * @returns {JSX.Element}
 */
export function Accordion({ items, initiallyOpenId = null, size = 'md' }) {
  const [openId, setOpenId] = useState(initiallyOpenId);
  const baseId = useId();

  return (
    <div className={`accordion accordion-${size}`}>
      {items.map((item) => {
        const isOpen = item.id === openId;
        const buttonId = `${baseId}-${item.id}-q`;
        const panelId = `${baseId}-${item.id}-a`;
        return (
          <div key={item.id} className="accordion-item" data-open={isOpen}>
            <h3>
              <button
                id={buttonId}
                type="button"
                className="accordion-button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenId(isOpen ? null : item.id)}
              >
                <span>{item.q}</span>
                <span className="accordion-icon">
                  <PlusIcon />
                </span>
              </button>
            </h3>
            {/* vocab: grid-template-rows 0fr → 1fr = height animation without measuring */}
            <div id={panelId} role="region" aria-labelledby={buttonId} className="accordion-panel" inert={!isOpen}>
              <div className="accordion-panel-inner">
                <p className="body">{item.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
