import { useLoader } from '@react-three/fiber';
import { peek } from 'suspend-react';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { chestModelPath } from '@/components/loot/chestModelConfig';

const chestModelCacheKey = [GLTFLoader, chestModelPath];
const preloadPollInterval = 40;
const preloadTimeout = 12000;
let chestModelAssetPromise: Promise<void> | null = null;

export function preloadChestModelAssets() {
  useLoader.preload(GLTFLoader, chestModelPath);

  chestModelAssetPromise ??= new Promise<void>((resolve, reject) => {
    const startedAt = performance.now();

    const checkCache = () => {
      if (peek(chestModelCacheKey)) {
        resolve();
        return;
      }

      if (performance.now() - startedAt > preloadTimeout) {
        reject(new Error(`Timed out preloading chest model: ${chestModelPath}`));
        return;
      }

      window.setTimeout(checkCache, preloadPollInterval);
    };

    checkCache();
  }).catch((error: unknown) => {
    chestModelAssetPromise = null;
    throw error;
  });

  return chestModelAssetPromise;
}
