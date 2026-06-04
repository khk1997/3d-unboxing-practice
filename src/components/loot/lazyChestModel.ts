import { lazy } from 'react';

type ChestModelModule = typeof import('@/components/loot/ChestModel');

let chestModelModulePromise: Promise<ChestModelModule> | null = null;
const chunkReloadStorageKey = 'loot-vault:chest-model-chunk-reload';

function isDynamicImportError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  return /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module/i.test(
    error.message,
  );
}

function reloadOnceForFreshChunks(error: unknown) {
  if (!isDynamicImportError(error) || typeof window === 'undefined') {
    throw error;
  }

  if (window.sessionStorage.getItem(chunkReloadStorageKey) === 'true') {
    throw error;
  }

  window.sessionStorage.setItem(chunkReloadStorageKey, 'true');
  window.location.reload();

  return new Promise<ChestModelModule>(() => {
    // The page is reloading. Keep React.lazy pending so the app does not render a rejected boundary first.
  });
}

export function preloadChestModel() {
  chestModelModulePromise ??= Promise.all([
    import('@/components/loot/preloadChestModelAssets').then((module) => {
      return module.preloadChestModelAssets();
    }),
    import('@/components/loot/ChestModel'),
  ])
    .then(([, chestModelModule]) => {
      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem(chunkReloadStorageKey);
      }

      return chestModelModule;
    })
    .catch((error: unknown) => reloadOnceForFreshChunks(error));

  return chestModelModulePromise;
}

export const LazyChestModel = lazy(() =>
  preloadChestModel().then((module) => ({ default: module.ChestModel })),
);
