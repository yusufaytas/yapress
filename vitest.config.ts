import path from "node:path";

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    restoreMocks: true,
    clearMocks: true,
    env: {
      CONTENT_DIR: "content-starter",
    },
  },
  resolve: {
    alias: [
      {
        find: /^@\/site\.config$/,
        replacement: path.resolve(__dirname, "./site.config.ts"),
      },
      {
        find: /^@\/plugins\.config$/,
        replacement: path.resolve(__dirname, "./plugins.config.ts"),
      },
      {
        find: /^@\/content\/(.*)$/,
        replacement: path.resolve(__dirname, "./content-starter/$1"),
      },
      {
        find: /^@\/(.*)$/,
        replacement: path.resolve(__dirname, "./src/$1"),
      },
    ],
  },
});
