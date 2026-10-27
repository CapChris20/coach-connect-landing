// NotFoundPage.jsx — any URL we do not have.
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { PageHead } from '../components/PageHead';
import { Seo } from '../components/Seo';

/**
 * @returns {JSX.Element}
 */
export default function NotFoundPage() {
  return (
    <Layout auroraTone="quiet">
      <Seo title="Page not found: Coach Connect" description="This page does not exist." />
      <PageHead label="404" title="That page is not here." lead="The link may be old. Start from the homepage instead.">
        <Link to="/" className="btn btn-primary">
          Go to the homepage
        </Link>
      </PageHead>
    </Layout>
  );
}
