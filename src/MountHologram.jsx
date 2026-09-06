import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Edges, Float, ContactShadows, Environment } from '@react-three/drei';

const BRAND = '#141414'; // black product body
const GLOW = '#1E1E1E'; // dark charcoal
const EDGE = '#A6D720'; // lime-green accent (the check)

/* A single U-shaped clamp jaw built from three thin boxes (bottom + 2 walls) */
function UChannel({ width = 0.9, height = 1.1, depth = 1.1, thickness = 0.16, ...props }) {
  const wall = (height + thickness) ;
  return (
    <group {...props}>
      {/* base */}
      <RoundedBox size={[width, thickness, depth]} position={[0, -height / 2, 0]} />
      {/* left wall */}
      <RoundedBox
        size={[thickness, wall, depth]}
        position={[-width / 2 + thickness / 2, 0, 0]}
      />
      {/* right wall */}
      <RoundedBox
        size={[thickness, wall, depth]}
        position={[width / 2 - thickness / 2, 0, 0]}
      />
    </group>
  );
}

/* Holographic material box with wireframe edges */
function RoundedBox({ size = [1, 1, 1], position = [0, 0, 0], rotation = [0, 0, 0] }) {
  return (
    <mesh position={position} rotation={rotation} castShadow>
      <boxGeometry args={size} />
      <meshPhysicalMaterial
        color={BRAND}
        emissive={GLOW}
        emissiveIntensity={0.35}
        metalness={0.3}
        roughness={0.25}
        transmission={0.15}
        transparent
        opacity={0.92}
        clearcoat={0.6}
        clearcoatRoughness={0.2}
      />
      <Edges scale={1.001} threshold={15} color={EDGE} />
    </mesh>
  );
}

/* The full COURTCHECK mount: a wide fence-clamp base carrying a central phone slot */
function MountModel() {
  const group = useRef();
  useFrame((state, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.5;
  });

  return (
    <group ref={group} scale={1.15}>
      {/* Central phone slot (tall narrow U that holds the phone) */}
      <UChannel width={0.55} height={1.5} depth={0.7} thickness={0.13} position={[0, 0.35, 0]} />

      {/* Two angled clamp wings that grip the fence rail (like the product photo) */}
      <UChannel
        width={0.8}
        height={0.95}
        depth={0.95}
        thickness={0.15}
        position={[-0.85, -0.35, 0]}
        rotation={[0, 0, 0.32]}
      />
      <UChannel
        width={0.8}
        height={0.95}
        depth={0.95}
        thickness={0.15}
        position={[0.85, -0.35, 0]}
        rotation={[0, 0, -0.32]}
      />

      {/* connecting base bar */}
      <RoundedBox size={[1.9, 0.16, 0.8]} position={[0, -0.75, 0]} />
    </group>
  );
}

export default function MountHologram() {
  return (
    <div className="h-[360px] w-full">
      <Canvas shadows camera={{ position: [0, 0.4, 5], fov: 42 }} dpr={[1, 2]} gl={{ alpha: true }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[4, 6, 4]} intensity={1.1} castShadow />
        <pointLight position={[-4, 2, -3]} intensity={0.5} color={EDGE} />
        <Float speed={2} rotationIntensity={0.25} floatIntensity={0.6}>
          <MountModel />
        </Float>
        <ContactShadows
          position={[0, -1.6, 0]}
          opacity={0.35}
          scale={7}
          blur={2.6}
          far={3}
          color="#000000"
        />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
