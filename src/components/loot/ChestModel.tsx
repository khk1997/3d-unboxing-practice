import { Canvas, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import type { Group, Mesh } from 'three';

type ChestModelProps = {
  rarity: string;
};

function ChestPlaceholder({ rarity }: ChestModelProps) {
  const chestRef = useRef<Group>(null);
  const lidRef = useRef<Group>(null);
  const lockRef = useRef<Mesh>(null);
  const progressRef = useRef(0);

  useFrame((_, delta) => {
    progressRef.current = Math.min(progressRef.current + delta * 1.35, 1);
    const progress = 1 - Math.pow(1 - progressRef.current, 3);

    if (chestRef.current) {
      chestRef.current.rotation.y = -0.34 + progress * 0.68;
      chestRef.current.position.y = -0.08 + Math.sin(progress * Math.PI) * 0.07;
    }

    if (lidRef.current) {
      lidRef.current.rotation.x = -progress * 1.05;
    }

    if (lockRef.current) {
      const pulse = 1 + Math.sin(progress * Math.PI) * 0.12;
      lockRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  const accentColor = rarity === 'SSR' ? '#fde047' : rarity === 'SR' ? '#67e8f9' : '#c4b5fd';

  return (
    <group ref={chestRef} position={[0, 0, 0]} rotation={[0.16, -0.34, 0]}>
      <mesh position={[0, -0.24, 0]}>
        <boxGeometry args={[1.65, 0.78, 1]} />
        <meshStandardMaterial color="#8a3f16" roughness={0.5} metalness={0.2} />
      </mesh>

      <group ref={lidRef} position={[0, 0.16, -0.48]}>
        <mesh position={[0, 0.08, 0.48]}>
          <boxGeometry args={[1.82, 0.34, 1.14]} />
          <meshStandardMaterial color="#b7791f" roughness={0.44} metalness={0.28} />
        </mesh>
      </group>

      <mesh position={[0, -0.12, 0.54]}>
        <boxGeometry args={[1.84, 0.16, 0.1]} />
        <meshStandardMaterial color="#f6d365" roughness={0.34} metalness={0.58} />
      </mesh>
      <mesh position={[0, -0.24, 0.6]}>
        <boxGeometry args={[0.2, 0.72, 0.1]} />
        <meshStandardMaterial color="#f6d365" roughness={0.34} metalness={0.58} />
      </mesh>
      <mesh ref={lockRef} position={[0, -0.1, 0.67]}>
        <boxGeometry args={[0.34, 0.32, 0.12]} />
        <meshStandardMaterial color={accentColor} roughness={0.24} metalness={0.48} />
      </mesh>
    </group>
  );
}

export function ChestModel({ rarity }: ChestModelProps) {
  return (
    <Canvas
      className="absolute inset-0 h-full w-full"
      camera={{ position: [0, 0.28, 3.75], fov: 32 }}
      gl={{ antialias: true, alpha: true }}
      style={{ width: '100%', height: '100%', background: 'transparent' }}
    >
      <ambientLight intensity={1.45} />
      <directionalLight position={[2.2, 2.4, 3]} intensity={1.55} />
      <ChestPlaceholder rarity={rarity} />
    </Canvas>
  );
}
