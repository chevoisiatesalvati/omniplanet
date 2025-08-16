'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, Stars } from '@react-three/drei';
import { Suspense } from 'react';

function StarshipModel() {
  const { scene } = useGLTF('/luminaris_starship.glb');

  return (
    <primitive object={scene} scale={[0.5, 0.5, 0.5]} position={[0, 0, 0]} />
  );
}

export default function Starship3D() {
  return (
    <Canvas
      camera={{
        position: [-13, 11.5, 36],
        fov: 50,
      }}
      style={{
        background: 'transparent',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
      }}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      }}
    >
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1} color='#ffffff' />
      <pointLight position={[-10, -10, -5]} intensity={0.5} color='#3b82f6' />

      {/* Environment */}
      <Environment preset='night' />
      <Stars
        radius={100}
        depth={50}
        count={2000}
        factor={4}
        saturation={0}
        fade
      />

      {/* Starship */}
      <Suspense fallback={null}>
        <StarshipModel />
      </Suspense>

      {/* Controls */}
      <OrbitControls
        enableZoom={true}
        enablePan={false}
        enableRotate={true}
        minDistance={25}
        maxDistance={60}
        zoomSpeed={0.8}
        rotateSpeed={0.9}
      />
    </Canvas>
  );
}
