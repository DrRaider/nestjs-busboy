import { defineConfig } from "vitest/config";

export default defineConfig({
  // Nest DI needs legacy decorators with their emitted metadata.
  oxc: { decorator: { emitDecoratorMetadata: true, legacy: true } },
  test: {
    globals: true,
    include: ["test/**/*.spec.ts"],
    setupFiles: ["reflect-metadata"],
  },
});
