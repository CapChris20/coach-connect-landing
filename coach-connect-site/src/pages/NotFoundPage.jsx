// NotFoundPage.jsx — any URL we do not have.
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { PageBand } from '../components/PageBand';
import { Seo } from '../components/Seo';

/**
 * @returns {JSX.Element}
 */
export default function NotFoundPage() {
  return (
    <Layout>
      <Seo title="Page not found: Coach Connect" description="This page does not exist." />
      <PageBand tone="orange" title="Not here." lead="That link may be old. Start from the homepage instead.">
        <Link to="/" className="btn btn-ink">
          Go to the homepage
        </Link>
      </PageBand>
    </Layout>
  );
}
