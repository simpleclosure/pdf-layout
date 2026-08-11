/* eslint-disable import/prefer-default-export */

import { loadYoga as yogaLoadYoga } from 'yoga-layout/load';

let instancePromise;

export const loadYoga = async () => {
  if (!instancePromise) {
    // Yoga WASM binaries must be asynchronously compiled and loaded
    // to prevent Event emitter memory leak warnings, Yoga must be loaded only once.
    // Memoize the in-flight promise (not just the resolved value) so concurrent
    // callers await the same WASM instantiation instead of each starting their
    // own, which produces distinct Embind classes and cross-instance BindingErrors.
    instancePromise = yogaLoadYoga();
  }

  const instance = await instancePromise;

  const config = instance.Config.create();

  config.setPointScaleFactor(0);

  const node = { create: () => instance.Node.createWithConfig(config) };

  return { node };
};
