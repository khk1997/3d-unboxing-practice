import { Environment, Lightformer, useGLTF } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ACESFilmicToneMapping, Quaternion, SRGBColorSpace, Vector3 } from 'three';
import type { Color, Group, Material, Mesh, Object3D, Texture } from 'three';
import type { RootState } from '@react-three/fiber';

type ChestModelProps = {
  rarity: string;
};

type ChestAssetProps = ChestModelProps & {
  onAnimationComplete: () => void;
};

const chestCameraView = {
  cameraPosition: [0.08, 0.54, 5.35] as [number, number, number],
  modelRotation: [0.1, -2.08, 0] as [number, number, number],
};

const chestModelPath = `${import.meta.env.BASE_URL}models/chests/chest.glb`;
const lidOpenAxis = new Vector3(0, 0, 1);
const chestShakeDuration = 0.62;
const chestOpenDuration = 0.72;
const chestAnimationDuration = chestShakeDuration + chestOpenDuration;
const lidOpenAngle = 0.58;

type CoinMaterial = Material & {
  color?: Color;
  emissive?: Color;
  emissiveIntensity?: number;
  envMapIntensity?: number;
  metalness?: number;
  roughness?: number;
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

function tuneCoinMaterial(material: Material, rarity: string, maxAnisotropy: number) {
  tuneMaterial(material, maxAnisotropy);
  const coinMaterial = material as CoinMaterial;
  const glowIntensity = rarity === 'SSR' ? 0.22 : rarity === 'SR' ? 0.18 : 0.14;

  coinMaterial.color?.set('#f3b63f');
  coinMaterial.emissive?.set('#ffb433');
  coinMaterial.emissiveIntensity = glowIntensity;

  coinMaterial.envMapIntensity = 2.7;
  coinMaterial.roughness = 0.18;
  coinMaterial.metalness = 0.92;
  coinMaterial.needsUpdate = true;
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

function ChestAsset({ rarity, onAnimationComplete }: ChestAssetProps) {
  const { scene } = useGLTF(chestModelPath);
  const gl = useThree((state) => state.gl);
  const model = useMemo(() => scene.clone(true), [scene]);
  const maxAnisotropy = useMemo(
    () => Math.min(gl.capabilities.getMaxAnisotropy(), 4),
    [gl],
  );
  const chestRef = useRef<Group>(null);
  const lidRef = useRef<Object3D | null>(null);
  const lidClosedQuaternionRef = useRef<Quaternion | null>(null);
  const elapsedRef = useRef(0);
  const hasCompletedAnimationRef = useRef(false);

  useLayoutEffect(() => {
    model.traverse((object) => {
      if ('isMesh' in object) {
        const mesh = object as Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        const material = mesh.material;
        if (Array.isArray(material)) {
          material.forEach((item) => tuneMaterial(item, maxAnisotropy));
        } else if (material) {
          tuneMaterial(material, maxAnisotropy);
        }

        if (isCoinMesh(mesh)) {
          if (Array.isArray(material)) {
            material.forEach((item) => tuneCoinMaterial(item, rarity, maxAnisotropy));
          } else if (material) {
            tuneCoinMaterial(material, rarity, maxAnisotropy);
          }
        }
      }
    });

    const lid = model.getObjectByName('Chest_Lid');
    lidRef.current = lid ?? null;
    lidClosedQuaternionRef.current = lid ? lid.quaternion.clone() : null;
  }, [maxAnisotropy, model, rarity]);

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

export function ChestModel({ rarity }: ChestModelProps) {
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
        toneMappingExposure: 1.18,
      }}
      style={{ width: '100%', height: '100%', background: 'transparent' }}
    >
      <CanvasResolutionController dpr={dpr} />
      <ambientLight color="#f0c59a" intensity={0.42} />
      <directionalLight color="#ffe0a8" position={[-1.8, 2.4, 2.8]} intensity={2.35} />
      <directionalLight color="#ffb65f" position={[1.4, 1.1, 2.2]} intensity={1.25} />
      <directionalLight color="#8aa0ff" position={[2.8, 1.6, -2.6]} intensity={1.1} />
      <Environment resolution={128}>
        <Lightformer color="#fff1cf" form="rect" intensity={3.6} position={[-1.4, 1.3, 2.4]} scale={[2.4, 0.5, 1]} />
        <Lightformer color="#ffb15c" form="rect" intensity={2.2} position={[1.4, 0.2, 1.5]} scale={[1.1, 1.4, 1]} />
        <Lightformer color="#6f86ff" form="rect" intensity={1.4} position={[2.4, 1.2, -2.2]} scale={[1.3, 1.1, 1]} />
      </Environment>
      <Suspense fallback={null}>
        <ChestAsset rarity={rarity} onAnimationComplete={() => setFrameloop('demand')} />
      </Suspense>
    </Canvas>
  );
}
