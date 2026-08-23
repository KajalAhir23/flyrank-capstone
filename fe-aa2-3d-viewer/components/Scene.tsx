'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls, ContactShadows, Grid } from '@react-three/drei';
import { DefaultModel, Model } from './Model';
import type { MaterialConfig } from './Model';

type EnvPreset = 'studio' | 'city' | 'sunset' | 'dawn' | 'forest';

export function Scene({
  glbUrl,
  config,
  environment,
}: {
  glbUrl: string | null;
  config: MaterialConfig;
  environment: EnvPreset;
}) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      camera={{ position: [3.2, 2.2, 3.6], fov: 40 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
    >
      <color attach="background" args={['#14161a']} />
      <fog attach="fog" args={['#14161a', 8, 16]} />

      <ambientLight intensity={0.25} />
      <directionalLight
        position={[4, 6, 3]}
        intensity={1.1}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={1}
        shadow-camera-far={12}
      />

      <Suspense fallback={null}>
        {glbUrl ? <Model url={glbUrl} config={config} /> : <DefaultModel config={config} />}
        <Environment preset={environment} />
      </Suspense>

      <Grid
        position={[0, 0, 0]}
        args={[10, 10]}
        cellSize={0.5}
        cellThickness={0.4}
        cellColor="#34383f"
        sectionSize={2.5}
        sectionThickness={1}
        sectionColor="#c9822e"
        fadeDistance={9}
        fadeStrength={1.5}
        infiniteGrid
      />
      <ContactShadows position={[0, 0, 0]} opacity={0.55} scale={8} blur={2.2} far={4} />

      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={2}
        maxDistance={8}
        maxPolarAngle={Math.PI / 2 - 0.05}
        touches={{ ONE: 2, TWO: 2 } as never}
      />
    </Canvas>
  );
}
