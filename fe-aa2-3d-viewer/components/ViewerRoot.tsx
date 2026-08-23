'use client';

import { useCallback, useState } from 'react';
import dynamic from 'next/dynamic';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { useLowPower } from '@/lib/useLowPower';
import { useInView } from '@/lib/useInView';
import { StaticFallback } from './StaticFallback';
import { ConfiguratorChrome, useConfiguratorControls } from './ConfiguratorPanel';

const Scene = dynamic(() => import('./Scene').then((m) => m.Scene), {
  ssr: false,
  loading: () => <StaticFallback reason="loading" />,
});

export function ViewerRoot() {
  const [glbUrl, setGlbUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reducedMotion = useReducedMotion();
  const lowPower = useLowPower();
  const { ref, inView } = useInView<HTMLDivElement>('300px');

  const config = useConfiguratorControls();

  const handleFile = useCallback((file: File | undefined) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.glb')) {
      setError('Only .glb files are supported.');
      return;
    }
    setError(null);
    const url = URL.createObjectURL(file);
    setGlbUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
    setFileName(file.name);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragActive(false);
      handleFile(e.dataTransfer.files?.[0]);
    },
    [handleFile]
  );

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const onDragLeave = useCallback(() => setDragActive(false), []);

  const showFallback = reducedMotion || lowPower || !inView;

  return (
    <div className="viewer-root" ref={ref}>
      <header className="hud-header">
        <div className="hud-title">
          <span className="hud-eyebrow">FE-AA2</span>
          <h1>Turntable</h1>
        </div>
      </header>

      <div
        className={`stage ${dragActive ? 'stage--drag' : ''}`}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
      >
        {showFallback ? (
          <StaticFallback reason={reducedMotion ? 'reduced-motion' : lowPower ? 'low-power' : 'loading'} />
        ) : (
          <Scene glbUrl={glbUrl} config={config} environment={(config as never as { environment: string }).environment as never} />
        )}

        {dragActive && (
          <div className="reticle" aria-hidden="true">
            <span className="corner tl" />
            <span className="corner tr" />
            <span className="corner bl" />
            <span className="corner br" />
            <p>DROP TO LOAD</p>
          </div>
        )}

        <div className="hud-footer">
          <span>{fileName ?? 'DEFAULT SPECIMEN — drop a .glb to replace'}</span>
          {error && <span className="hud-error">{error}</span>}
        </div>

        <label className="hud-upload">
          <input
            type="file"
            accept=".glb"
            onChange={(e) => handleFile(e.target.files?.[0])}
            style={{ display: 'none' }}
          />
          Load .glb
        </label>
      </div>

      <ConfiguratorChrome />

      <style jsx>{`
        .viewer-root {
          position: relative;
          width: 100%;
          height: 100dvh;
          min-height: 480px;
          overflow: hidden;
          background: var(--bg);
        }
        .hud-header {
          position: absolute;
          top: 0;
          left: 0;
          z-index: 5;
          display: flex;
          align-items: center;
          padding: 18px 20px;
          pointer-events: none;
        }
        .hud-header > * {
          pointer-events: auto;
        }
        .hud-eyebrow {
          display: block;
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.14em;
          color: var(--accent);
        }
        .hud-title h1 {
          margin: 2px 0 0;
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 22px;
          letter-spacing: -0.01em;
        }
        .hud-upload {
          position: absolute;
          right: 20px;
          bottom: 16px;
          z-index: 5;
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.04em;
          color: var(--text);
          background: var(--surface);
          border: 1px solid var(--line);
          padding: 8px 14px;
          border-radius: 3px;
          cursor: pointer;
          transition: border-color 0.15s ease, color 0.15s ease;
        }
        .hud-upload:hover {
          border-color: var(--accent);
          color: var(--accent);
        }
        .stage {
          position: absolute;
          inset: 0;
        }
        .stage--drag {
          outline: 1px dashed var(--accent-dim);
          outline-offset: -8px;
        }
        .hud-footer {
          position: absolute;
          left: 20px;
          bottom: 16px;
          z-index: 5;
          display: flex;
          gap: 12px;
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.06em;
          color: var(--text-dim);
        }
        .hud-error {
          color: #d97757;
        }
        .reticle {
          position: absolute;
          inset: 40px;
          z-index: 6;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
        }
        .reticle p {
          font-family: var(--font-mono);
          font-size: 12px;
          letter-spacing: 0.16em;
          color: var(--accent);
        }
        .corner {
          position: absolute;
          width: 22px;
          height: 22px;
          border: 2px solid var(--accent);
        }
        .tl {
          top: 0;
          left: 0;
          border-right: none;
          border-bottom: none;
        }
        .tr {
          top: 0;
          right: 0;
          border-left: none;
          border-bottom: none;
        }
        .bl {
          bottom: 0;
          left: 0;
          border-right: none;
          border-top: none;
        }
        .br {
          bottom: 0;
          right: 0;
          border-left: none;
          border-top: none;
        }
      `}</style>
    </div>
  );
}