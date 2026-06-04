import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ACESFilmicToneMapping, PMREMGenerator, Quaternion, SRGBColorSpace, Vector3 } from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { chestModelPath } from '@/components/loot/chestModelConfig';
import type { Color, Group, Material, Mesh, Object3D, Texture } from 'three';
import type { RootState } from '@react-three/fiber';

type ChestModelProps = {
  onReady?: () => void;
  rarity: string;
};

type ChestAssetProps = ChestModelProps & {
  onAnimationComplete: () => void;
};

const chestCameraView = {
  cameraPosition: [0.08, 0.54, 5.35] as [number, number, number],
  modelRotation: [0.1, -2.08, 0] as [number, number, number],
};

const lidOpenAxis = new Vector3(0, 0, 1);
const chestShakeDuration = 0.62;
const chestOpenDuration = 0.72;
const chestAnimationDuration = chestShakeDuration + chestOpenDuration;
const lidOpenAngle = 0.58;

type CoinMaterial = Material & {
  color?: Color;
  emissive?: Color;
  emissiveIntensity?: number;
  envMap?: Texture | null;
  envMapIntensity?: number;
  metalness?: number;
  roughness?: number;
};

type ChestMaterial = CoinMaterial & {
  clearcoat?: number;
  clearcoatRoughness?: number;
};

type TexturedMaterial = Material & {
  aoMap?: Texture | null;
  emissiveMap?: Texture | null;
  map?: Texture | null;
  metalnessMap?: Texture | null;
  normalMap?: Texture | null;
  roughnessMap?: Texture | null;
};

function tuneTexture(texture: Texture | null | undefined, maxAnisotropy: number) {
  if (!texture) {
    return;
  }

  texture.anisotropy = maxAnisotropy;
  texture.needsUpdate = true;
}

function tuneMaterial(material: Material, maxAnisotropy: number) {
  material.needsUpdate = true;

  if ('envMapIntensity' in material) {
    material.envMapIntensity = 1.35;
  }

  if ('toneMapped' in material) {
    material.toneMapped = true;
  }

  const texturedMaterial = material as TexturedMaterial;
  tuneTexture(texturedMaterial.map, maxAnisotropy);
  tuneTexture(texturedMaterial.normalMap, maxAnisotropy);
  tuneTexture(texturedMaterial.roughnessMap, maxAnisotropy);
  tuneTexture(texturedMaterial.metalnessMap, maxAnisotropy);
  tuneTexture(texturedMaterial.aoMap, maxAnisotropy);
  tuneTexture(texturedMaterial.emissiveMap, maxAnisotropy);
}

function tuneChestMaterial(material: Material, maxAnisotropy: number) {
  tuneMaterial(material, maxAnisotropy);
  const chestMaterial = material as ChestMaterial;

  chestMaterial.color?.set('#ffb06f');
  chestMaterial.emissive?.set('#2b1003');
  chestMaterial.emissiveIntensity = 0.025;
  chestMaterial.envMapIntensity = 1.18;

  if ('clearcoat' in chestMaterial) {
    chestMaterial.clearcoat = 0.38;
  }

  if ('clearcoatRoughness' in chestMaterial) {
    chestMaterial.clearcoatRoughness = 0.28;
  }

  chestMaterial.needsUpdate = true;
}

function tuneCoinMaterial(
  material: Material,
  rarity: string,
  maxAnisotropy: number,
  environmentMap: Texture,
) {
  tuneMaterial(material, maxAnisotropy);
  const coinMaterial = material as CoinMaterial;
  const glowIntensity = rarity === 'SSR' ? 0.13 : rarity === 'SR' ? 0.11 : 0.09;

  coinMaterial.color?.set('#e8a11f');
  coinMaterial.emissive?.set('#5f2802');
  coinMaterial.emissiveIntensity = glowIntensity;

  coinMaterial.envMap = environmentMap;
  coinMaterial.envMapIntensity = 0.82;
  coinMaterial.roughness = 0.18;
  coinMaterial.metalness = 0.64;
  coinMaterial.needsUpdate = true;
}

function isChestMaterial(material: Material) {
  return material.name.toLowerCase().includes('chest');
}

function isCoinMesh(mesh: Mesh) {
  const meshName = mesh.name.toLowerCase();
  const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];

  return (
    meshName.includes('coin') ||
    materials.some((material) => material?.name.toLowerCase().includes('coin'))
  );
}

function easeOutCubic(value: number) {
  return 1 - Math.pow(1 - value, 3);
}

function burstOpenProgress(value: number) {
  if (value <= 0.28) {
    return easeOutCubic(value / 0.28) * 0.82;
  }

  return 0.82 + easeOutCubic((value - 0.28) / 0.72) * 0.18;
}

function getAdaptiveDpr() {
  if (typeof window === 'undefined') {
    return 1.5;
  }

  const screenDpr = window.devicePixelRatio || 1;
  const cap = window.innerWidth >= 1024 ? 1.75 : 1.5;

  return Math.min(Math.max(screenDpr, 1.25), cap);
}

function useAdaptiveDpr() {
  const [dpr, setDpr] = useState(getAdaptiveDpr);

  useEffect(() => {
    const updateDpr = () => {
      setDpr(getAdaptiveDpr());
    };

    window.addEventListener('resize', updateDpr);

    return () => {
      window.removeEventListener('resize', updateDpr);
    };
  }, []);

  return dpr;
}

function CanvasResolutionController({ dpr }: { dpr: number }) {
  const gl = useThree((state) => state.gl);
  const setDpr = useThree((state) => state.setDpr);

  useLayoutEffect(() => {
    const syncRendererSize = () => {
      const parent = gl.domElement.parentElement;
      const width = parent?.clientWidth || gl.domElement.clientWidth;
      const height = parent?.clientHeight || gl.domElement.clientHeight;

      if (!width || !height) {
        return;
      }

      setDpr(dpr);
      gl.setPixelRatio(dpr);
      gl.setSize(width, height, true);
    };

    syncRendererSize();
    const animationFrame = window.requestAnimationFrame(syncRendererSize);
    const settledTimer = window.setTimeout(syncRendererSize, 650);

    window.addEventListener('resize', syncRendererSize);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.clearTimeout(settledTimer);
      window.removeEventListener('resize', syncRendererSize);
    };
  }, [dpr, gl, setDpr]);

  return null;
}

function ChestAsset({ onReady, rarity, onAnimationComplete }: ChestAssetProps) {
  const { scene } = useLoader(GLTFLoader, chestModelPath);
  const gl = useThree((state) => state.gl);
  const model = useMemo(() => scene.clone(true), [scene]);
  const coinEnvironmentMap = useMemo(() => {
    const pmremGenerator = new PMREMGenerator(gl);
    const roomEnvironment = new RoomEnvironment();
    const environmentMap = pmremGenerator.fromScene(roomEnvironment, 0.04).texture;

    roomEnvironment.dispose();
    pmremGenerator.dispose();

    return environmentMap;
  }, [gl]);
  const maxAnisotropy = useMemo(
    () => Math.min(gl.capabilities.getMaxAnisotropy(), 4),
    [gl],
  );
  const chestRef = useRef<Group>(null);
  const lidRef = useRef<Object3D | null>(null);
  const lidClosedQuaternionRef = useRef<Quaternion | null>(null);
  const elapsedRef = useRef(0);
  const hasCompletedAnimationRef = useRef(false);

  useEffect(() => {
    return () => {
      coinEnvironmentMap.dispose();
    };
  }, [coinEnvironmentMap]);

  useLayoutEffect(() => {
    model.traverse((object) => {
      if ('isMesh' in object) {
        const mesh = object as Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        const material = mesh.material;
        const materials = Array.isArray(material) ? material : [material];
        materials.forEach((item) => {
          if (!item) {
            return;
          }

          if (isChestMaterial(item)) {
            tuneChestMaterial(item, maxAnisotropy);
            return;
          }

          tuneMaterial(item, maxAnisotropy);
        });

        if (isCoinMesh(mesh)) {
          if (Array.isArray(material)) {
            material.forEach((item) =>
              tuneCoinMaterial(item, rarity, maxAnisotropy, coinEnvironmentMap),
            );
          } else if (material) {
            tuneCoinMaterial(material, rarity, maxAnisotropy, coinEnvironmentMap);
          }
        }
      }
    });

    const lid = model.getObjectByName('Chest_Lid');
    lidRef.current = lid ?? null;
    lidClosedQuaternionRef.current = lid ? lid.quaternion.clone() : null;
    onReady?.();
  }, [coinEnvironmentMap, maxAnisotropy, model, onReady, rarity]);

  useFrame((state: RootState, delta) => {
    if (hasCompletedAnimationRef.current) {
      return;
    }

    elapsedRef.current = Math.min(elapsedRef.current + delta, chestAnimationDuration);

    const elapsed = elapsedRef.current;
    const shakeProgress = Math.min(elapsed / chestShakeDuration, 1);
    const shakeEnvelope =
      elapsed < chestShakeDuration ? Math.sin(shakeProgress * Math.PI) : 0;
    const rawOpenProgress = Math.min(Math.max((elapsed - chestShakeDuration) / chestOpenDuration, 0), 1);
    const openProgress = burstOpenProgress(rawOpenProgress);
    const burstProgress = rawOpenProgress > 0 ? Math.sin(Math.min(rawOpenProgress / 0.34, 1) * Math.PI) : 0;
    const shakeX = Math.sin(elapsed * 76) * 0.032 * shakeEnvelope;
    const shakePitch = Math.sin(elapsed * 58) * 0.026 * shakeEnvelope;
    const shakeRoll = Math.sin(elapsed * 88) * 0.055 * shakeEnvelope;
    const launchLift = burstProgress * 0.075;
    const launchPitch = burstProgress * -0.035;
    const launchRoll = burstProgress * -0.035;

    if (chestRef.current) {
      chestRef.current.rotation.set(
        chestCameraView.modelRotation[0] + shakePitch + launchPitch,
        chestCameraView.modelRotation[1],
        chestCameraView.modelRotation[2] + shakeRoll + launchRoll,
      );
      chestRef.current.position.x = shakeX;
      chestRef.current.position.y =
        -0.36 -
        Math.sin(shakeProgress * Math.PI) * 0.025 +
        Math.sin(openProgress * Math.PI) * 0.035 +
        launchLift;
    }

    if (lidRef.current && lidClosedQuaternionRef.current) {
      const openQuaternion = new Quaternion().setFromAxisAngle(lidOpenAxis, openProgress * lidOpenAngle);
      lidRef.current.quaternion.copy(lidClosedQuaternionRef.current).multiply(openQuaternion);
    }

    if (elapsedRef.current >= chestAnimationDuration) {
      hasCompletedAnimationRef.current = true;
      state.invalidate();
      onAnimationComplete();
    }
  });

  return (
    <group ref={chestRef} position={[0, 0, 0]} rotation={chestCameraView.modelRotation} scale={1.52}>
      <primitive object={model} />
    </group>
  );
}

export function ChestModel({ onReady, rarity }: ChestModelProps) {
  const dpr = useAdaptiveDpr();
  const [frameloop, setFrameloop] = useState<'always' | 'demand'>('always');

  useEffect(() => {
    setFrameloop('always');
  }, [rarity]);

  return (
    <Canvas
      className="absolute inset-0 h-full w-full"
      camera={{ position: chestCameraView.cameraPosition, fov: 22.6 }}
      dpr={dpr}
      frameloop={frameloop}
      gl={{
        alpha: true,
        antialias: true,
        outputColorSpace: SRGBColorSpace,
        powerPreference: 'default',
        toneMapping: ACESFilmicToneMapping,
        toneMappingExposure: 1.08,
      }}
      style={{ width: '100%', height: '100%', background: 'transparent' }}
    >
      <CanvasResolutionController dpr={dpr} />
      <ambientLight color="#ead2bd" intensity={0.32} />
      <hemisphereLight color="#fff0d8" groundColor="#2c140c" intensity={0.52} />
      <directionalLight color="#ffe1ad" position={[-1.8, 2.4, 2.8]} intensity={2.7} />
      <directionalLight color="#d18443" position={[1.4, 1.1, 2.2]} intensity={0.72} />
      <directionalLight color="#c9d2ff" position={[2.8, 1.6, -2.6]} intensity={0.38} />
      <pointLight color="#fff0bd" position={[0.08, 0.38, 1.7]} intensity={0.52} distance={3.4} />
      <pointLight color="#ffc04a" position={[0.1, 0.68, 0.95]} intensity={1.35} distance={1.45} />
      <pointLight color="#ff9f1f" position={[0.05, 0.42, 0.62]} intensity={0.82} distance={0.92} />
      <Suspense fallback={null}>
        <ChestAsset
          onReady={onReady}
          rarity={rarity}
          onAnimationComplete={() => setFrameloop('demand')}
        />
      </Suspense>
    </Canvas>
  );
}
