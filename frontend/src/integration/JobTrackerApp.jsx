/**
 * Integration: Job Tracker (original app, unmodified).
 * Source: https://github.com/Akash728858/job_trackerr.git
 * Deployed: https://jobtrackerr.vercel.app
 */
import EmbeddedAppFrame from './EmbeddedAppFrame';

const DEPLOYED_URL = 'https://jobtrackerr.vercel.app';

export default function JobTrackerApp() {
  return <EmbeddedAppFrame src={DEPLOYED_URL} title="Job Tracker" />;
}
