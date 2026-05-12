/**
 * Integration-only wrapper. Renders the original app in an iframe.
 * NO modifications to the embedded app. Black-box integration.
 */
export default function EmbeddedAppFrame({ src, title }) {
  return (
    <div style={{ position: 'relative', width: '100%', minHeight: 'calc(100vh - 120px)', flex: 1 }}>
      <iframe
        src={src}
        title={title}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          minHeight: '600px',
          border: 'none',
          display: 'block',
        }}
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
      />
    </div>
  );
}
