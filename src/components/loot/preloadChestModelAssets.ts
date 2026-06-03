import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { chestModelPath } from '@/components/loot/chestModelConfig';

export function preloadChestModelAssets() {
  useLoader.preload(GLTFLoader, chestModelPath);
}
