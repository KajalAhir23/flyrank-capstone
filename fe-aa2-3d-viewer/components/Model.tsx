'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export type MaterialConfig = {
  color: string;
  metalness: number;
  roughness: number;
  wireframe: boolean;
  autoRotateSpeed: number;
};

/** Loads a GLB (DRACO-compressed meshes decoded automatically via drei's bundled decoder),
 *  centers and scales it to a consistent 2-unit footprint, and applies live material overrides. */
export function Model({ url, config }: { url: string; config: MaterialConfig }) {
  const group = useRef<THREE.Group>(null);
  const { scene } = useGLTF(url, '/draco/');

  const prepared = useMemo(() => {
    const clone = scene.clone(true);
    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);

    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const scale = 2 / maxDim;

    clone.position.set(-center.x, -box.min.y, -center.z);
    clone.scale.setScalar(scale);

    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });

    return clone;
  }, [scene]);

  useEffect(() => {
    prepared.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        mats.forEach((m) => {
          const mat = m as THREE.MeshStandardMaterial;
          if (mat.color) mat.color.set(config.color);
          if ('metalness' in mat) mat.metalness = config.metalness;
          if ('roughness' in mat) mat.roughness = config.roughness;
          mat.wireframe = config.wireframe;
          mat.needsUpdate = true;
        });
      }
    });
  }, [prepared, config.color, config.metalness, config.roughness, config.wireframe]);

  useFrame((_, delta) => {
    if (group.current && config.autoRotateSpeed > 0) {
      group.current.rotation.y += delta * config.autoRotateSpeed;
    }
  });

  return (
    <group ref={group}>
      <primitive object={prepared} />
    </group>
  );
}

/** Procedural default so the page is never empty before a user drops a file. */
export function DefaultModel({ config }: { config: MaterialConfig }) {
  const group = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (group.current && config.autoRotateSpeed > 0) {
      group.current.rotation.y += delta * config.autoRotateSpeed;
    }
  });

  return (
    <group ref={group} position={[0, 0.75, 0]}>
      <mesh castShadow receiveShadow>
        <icosahedronGeometry args={[0.9, 1]} />
        <meshStandardMaterial
          color={config.color}
          metalness={config.metalness}
          roughness={config.roughness}
          wireframe={config.wireframe}
        />
      </mesh>
    </group>
  );
}
