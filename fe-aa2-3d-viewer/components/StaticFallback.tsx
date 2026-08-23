'use client';

export function StaticFallback({ reason }: { reason: 'reduced-motion' | 'low-power' | 'loading' }) {
  const copy =
    reason === 'reduced-motion'
      ? 'Motion is reduced on this device, so the 3D scene is paused. The model below is a static preview.'
      : reason === 'low-power'
      ? "This device looks like it might struggle with WebGL, so we're showing a static preview instead."
      : 'Loading the scene…';

  return (
    <div className="fallback-root">
      <svg viewBox="0 0 400 400" width="100%" height="100%" role="img" aria-label="Static preview of a 3D object on a pedestal">
        <defs>
          <radialGradient id="fbGlow" cx="50%" cy="38%" r="55%">
            <stop offset="0%" stopColor="#c9822e" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#c9822e" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="fbFace" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#c9822e" />
            <stop offset="100%" stopColor="#8a5a1f" />
          </linearGradient>
        </defs>
        <rect width="400" height="400" fill="#14161a" />
        <circle cx="200" cy="160" r="150" fill="url(#fbGlow)" />
        <ellipse cx="200" cy="330" rx="120" ry="18" fill="#000" opacity="0.35" />
        <ellipse cx="200" cy="326" rx="110" ry="12" fill="none" stroke="#34383f" strokeWidth="1" />
        <g transform="translate(200,220)">
          <polygon points="0,-90 78,-45 78,45 0,90 -78,45 -78,-45" fill="url(#fbFace)" opacity="0.9" />
          <polygon points="0,-90 78,-45 0,0 -78,-45" fill="#e8e6e1" opacity="0.15" />
          <line x1="0" y1="-90" x2="0" y2="90" stroke="#14161a" strokeWidth="1" opacity="0.4" />
          <line x1="-78" y1="-45" x2="78" y2="45" stroke="#14161a" strokeWidth="1" opacity="0.25" />
        </g>
      </svg>
      <p className="fallback-copy">{copy}</p>
      <style jsx>{`
        .fallback-root {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          background: var(--bg);
        }
        .fallback-copy {
          max-width: 340px;
          text-align: center;
          font-family: var(--font-mono);
          font-size: 12px;
          line-height: 1.6;
          color: var(--text-dim);
          letter-spacing: 0.01em;
          padding: 0 24px;
        }
      `}</style>
    </div>
  );
}
