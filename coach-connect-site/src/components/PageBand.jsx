// PageBand.jsx — the opening "poster" of every inner page (DESIGN.md §7):
// a full-width band with the page's own background idea, a huge title, one line.
// `background` is the page's visual (isometric blocks, split-flap, shapes...).
import { Kinetic } from './Kinetic';

/**
 * @param {{ title: string, lead: string, tone?: 'dark' | 'paper' | 'pink' | 'orange', background?: React.ReactNode, aside?: React.ReactNode, children?: React.ReactNode }} props
 * @returns {JSX.Element}
 */
export function PageBand({ title, lead, tone = 'dark', background = null, aside = null, children = null }) {
  return (
    <section className={`band scene-${tone}`} aria-labelledby="page-title">
      {background}
      {tone === 'dark' && background && <div className="band-scrim" aria-hidden="true" />}
      <div className={`container band-grid ${aside ? 'has-aside' : ''}`}>
        <div className="band-copy stack-5">
          <Kinetic as="h1" id="page-title" className="t-band" text={title} onMount />
          <p className="lead">{lead}</p>
          {children}
        </div>
        {aside && <div className="band-aside">{aside}</div>}
      </div>
    </section>
  );
}
