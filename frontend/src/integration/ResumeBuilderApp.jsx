/**
 * Integration: Resume Builder (original app, unmodified).
 * Source: https://github.com/Akash728858/Resume_builder.git
 * Deployed: https://resumee-nu.vercel.app
 */
import EmbeddedAppFrame from './EmbeddedAppFrame';

const DEPLOYED_URL = 'https://resumee-nu.vercel.app';

export default function ResumeBuilderApp() {
  return <EmbeddedAppFrame src={DEPLOYED_URL} title="Resume Builder" />;
}
