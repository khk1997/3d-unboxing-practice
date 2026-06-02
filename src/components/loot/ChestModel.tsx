import { Environment, Lightformer, useGLTF } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Suspense, useEffect, useMemo, useRef } from 'react';
import { ACESFilmicToneMapping, Quaternion, SRGBColorSpace, Vector3 } from 'three';
import type { Group, Material, Mesh, Object3D, PointLight } from 'three';

type ChestModelProps = {
  rarity: string;
};

const chestCameraView = {
  cameraPosition: [0.08, 0.54, 5.35] as [number, number, number],
  modelRotation: [0.1, -2.08, 0] as [number, number, number],
};

const chestModelPath = '/models/chests/chest.glb';
const lidOpenAxis = new Vector3(0, 0, 1);
const coinLightLayer = 1;

function tuneMaterial(material: Material) {
  material.needsUpdate = true;

  if ('envMapIntensity' in material) {
    material.envMapIntensity = 1.35;
  }

  if ('toneMapped' in material) {
    material.toneMapped = true;
  }
}

function isCoinMesh(mesh: Mesh) {
  const meshName = mesh.name.toLowerCase();
  const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];

  return (
    meshName.includes('coin') ||
    materials.some((material) => material?.name.toLowerCase().includes('coin'))
  );
}

function ChestAsset({ rarity }: ChestModelProps) {
  const { scene } = useGLTF(chestModelPath);
  const { camera } = useThree();
  const model = useMemo(() => scene.clone(true), [scene]);
  const chestRef = useRef<Group>(null);
  const lidRef = useRef<Object3D | null>(null);
  const lidClosedQuaternionRef = useRef<Quaternion | null>(null);
  const coinLightRef = useRef<PointLight>(null);
  const progressRef = useRef(0);

  useEffect(() => {
    camera.layers.enable(coinLightLayer);
    coinLightRef.current?.layers.set(coinLightLayer);

    model.traverse((object) => {
      if ('isMesh' in object) {
        const mesh = object as Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        const material = mesh.material;
        if (Array.isArray(material)) {
          material.forEach(tuneMaterial);
        } else if (material) {
          tuneMaterial(material);
        }

        if (isCoinMesh(mesh)) {
          mesh.layers.enable(coinLightLayer);
        }
      }
    });

    const lid = model.getObjectByName('Chest_Lid');
    lidRef.current = lid ?? null;
    lidClosedQuaternionRef.current = lid ? lid.quaternion.clone() : null;
  }, [camera, model]);

  useFrame((_, delta) => {
    progressRef.current = Math.min(progressRef.current + delta * 1.35, 1);
    const progress = 1 - Math.pow(1 - progressRef.current, 3);

    if (chestRef.current) {
      chestRef.current.rotation.set(...chestCameraView.modelRotation);
      chestRef.current.position.y = -0.36 + Math.sin(progress * Math.PI) * 0.05;
    }

    if (lidRef.current && lidClosedQuaternionRef.current) {
      const openQuaternion = new Quaternion().setFromAxisAngle(lidOpenAxis, progress * 0.58);
      lidRef.current.quaternion.copy(lidClosedQuaternionRef.current).multiply(openQuaternion);
    }
  });

  const accentColor = rarity === 'SSR' ? '#f0bb65' : rarity === 'SR' ? '#d78a3c' : '#c2aa82';

  return (
    <group ref={chestRef} position={[0, 0, 0]} rotation={chestCameraView.modelRotation} scale={1.52}>
      <pointLight
        ref={coinLightRef}
        color={accentColor}
        position={[0.08, 0.54, 0.14]}
        intensity={4.8}
        distance={1.1}
        decay={2.2}
      />
      <primitive object={model} />
    </group>
  );
}

export function ChestModel({ rarity }: ChestModelProps) {
  return (
    <Canvas
      className="absolute inset-0 h-full w-full"
      camera={{ position: chestCameraView.cameraPosition, fov: 22.6 }}
      gl={{ antialias: true, alpha: true, outputColorSpace: SRGBColorSpace, toneMapping: ACESFilmicToneMapping, toneMappingExposure: 1.18 }}
      style={{ width: '100%', height: '100%', background: 'transparent' }}
    >
      <ambientLight color="#f0c59a" intensity={0.42} />
      <directionalLight color="#ffe0a8" position={[-1.8, 2.4, 2.8]} intensity={2.35} />
      <directionalLight color="#ffb65f" position={[1.4, 1.1, 2.2]} intensity={1.25} />
      <directionalLight color="#8aa0ff" position={[2.8, 1.6, -2.6]} intensity={1.1} />
      <Environment resolution={256}>
        <Lightformer color="#fff1cf" form="rect" intensity={3.6} position={[-1.4, 1.3, 2.4]} scale={[2.4, 0.5, 1]} />
        <Lightformer color="#ffb15c" form="rect" intensity={2.2} position={[1.4, 0.2, 1.5]} scale={[1.1, 1.4, 1]} />
        <Lightformer color="#6f86ff" form="rect" intensity={1.4} position={[2.4, 1.2, -2.2]} scale={[1.3, 1.1, 1]} />
      </Environment>
      <Suspense fallback={null}>
        <ChestAsset rarity={rarity} />
      </Suspense>
    </Canvas>
  );
}

useGLTF.preload(chestModelPath);
