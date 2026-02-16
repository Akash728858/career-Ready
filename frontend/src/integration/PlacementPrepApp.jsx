/**
 * Placement Prep – iframe integration.
 * Source: https://github.com/Akash728858/placement-prep.git
 * Deployed: https://placement-prep-rust.vercel.app/
 */
import EmbeddedAppFrame from './EmbeddedAppFrame';

const DEPLOYED_URL = 'https://placement-prep-rust.vercel.app/';

export default function PlacementPrepApp() {
  return <EmbeddedAppFrame src={DEPLOYED_URL} title="Placement Prep" />;
}
