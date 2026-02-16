/**
 * Placement Prep – iframe integration.
 * Source: https://github.com/Akash728858/placement-prep.git
 * Deployed: https://placement-prep-akashak51190-8455s-projects.vercel.app/
 */
export default function PlacementPrepApp() {
  return (
    <iframe
      src="https://placement-prep-rust.vercel.app/"
      style={{
        width: '100%',
        height: '100vh',
        border: 'none',
      }}
      title="Placement Prep"
    />
  );
}
