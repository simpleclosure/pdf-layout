import { describe, expect, test, vi, beforeEach } from 'vitest';

let loadCount = 0;

vi.mock('yoga-layout/load', () => ({
  loadYoga: () =>
    new Promise((resolve) => {
      loadCount += 1;
      const callId = loadCount;
      // Simulate the WASM module taking a tick to instantiate, so concurrent
      // callers overlap while it's in flight.
      setTimeout(() => {
        resolve({
          Config: { create: () => ({ callId, setPointScaleFactor: () => {} }) },
          Node: {
            createWithConfig: (config) => {
              if (config.callId !== callId) {
                throw new Error(
                  `BindingError: Expected null or instance of Config, got an instance of Config`,
                );
              }
              return { config };
            },
          },
        });
      }, 0);
    }),
}));

describe('yoga loadYoga', () => {
  beforeEach(() => {
    loadCount = 0;
    vi.resetModules();
  });

  test('Should only instantiate the WASM module once when called concurrently', async () => {
    const { loadYoga } = await import('../../src/yoga/index');

    const [a, b, c] = await Promise.all([loadYoga(), loadYoga(), loadYoga()]);

    expect(loadCount).toBe(1);
    expect(() => a.node.create()).not.toThrow();
    expect(() => b.node.create()).not.toThrow();
    expect(() => c.node.create()).not.toThrow();
  });
});
