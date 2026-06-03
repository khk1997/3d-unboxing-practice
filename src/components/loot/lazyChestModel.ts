import { lazy } from 'react';

type ChestModelModule = typeof import('@/components/loot/ChestModel');

let chestModelModulePromise: Promise<ChestModelModule> | null = null;

export function preloadChestModel() {
  chestModelModulePromise ??= Promise.all([
    import('@/components/loot/preloadChestModelAssets').then((module) => {
      module.preloadChestModelAssets();
    }),
    import('@/components/loot/ChestModel'),
  ]).then(([, chestModelModule]) => chestModelModule);

  return chestModelModulePromise;
}

export const LazyChestModel = lazy(() =>
  preloadChestModel().then((module) => ({ default: module.ChestModel })),
);
