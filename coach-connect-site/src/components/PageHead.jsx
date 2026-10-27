// PageHead.jsx — the top of every inner page: a plain label, the page's one
// <h1>, a lead line, and an optional visual on the right.
// No signature animation here; inner pages stay calm (DESIGN.md section 9).

/**
 * @param {{ label: string, title: React.ReactNode, lead: string, children?: React.ReactNode, aside?: React.ReactNode }} props
 * @returns {JSX.Element}
 */
export function PageHead({ label, title, lead, children = null, aside = null }) {
  return (
    <section className={`page-head ${aside ? 'page-head-split' : ''}`} aria-labelledby="page-title">
      <div className="container page-head-grid">
        <div className="stack-5 page-head-copy">
          <p className="label">{label}</p>
          <h1 id="page-title" className="h-page">
            {title}
          </h1>
          <p className="lead">{lead}</p>
          {children}
        </div>
        {aside && <div className="page-head-aside">{aside}</div>}
      </div>
    </section>
  );
}
