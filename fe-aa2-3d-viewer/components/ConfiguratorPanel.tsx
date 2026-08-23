'use client';

import { Leva, useControls, folder } from 'leva';
import type { MaterialConfig } from './Model';

const levaTheme = {
  colors: {
    elevation1: '#1b1e23',
    elevation2: '#22262c',
    elevation3: '#2b2f36',
    accent1: '#8a5a1f',
    accent2: '#c9822e',
    accent3: '#e0a05c',
    highlight1: '#8b8f97',
    highlight2: '#c7c9cd',
    highlight3: '#e8e6e1',
    vivid1: '#c9822e',
  },
  radii: { xs: '2px', sm: '3px', lg: '4px' },
  fonts: {
    mono: 'JetBrains Mono, ui-monospace, monospace',
    sans: 'JetBrains Mono, ui-monospace, monospace',
  },
  fontSizes: { root: '11px' },
};

export function useConfiguratorControls(): MaterialConfig {
  const values = useControls('SPECIMEN', {
    Material: folder({
      color: { value: '#c9822e', label: 'color' },
      metalness: { value: 0.6, min: 0, max: 1, step: 0.01, label: 'metalness' },
      roughness: { value: 0.35, min: 0, max: 1, step: 0.01, label: 'roughness' },
      wireframe: { value: false, label: 'wireframe' },
    }),
    Turntable: folder({
      autoRotateSpeed: { value: 0.4, min: 0, max: 2, step: 0.05, label: 'spin rate' },
      environment: {
        value: 'studio',
        options: ['studio', 'city', 'sunset', 'dawn', 'forest'],
        label: 'env preset',
      },
    }),
  });

  return values as unknown as MaterialConfig & { environment: string };
}

export function ConfiguratorChrome() {
  return (
    <Leva
      theme={levaTheme}
      titleBar={{ title: 'CONFIGURATOR', drag: false, filter: false }}
      collapsed={false}
      fill={false}
    />
  );
}
