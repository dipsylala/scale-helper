import { defineConfig } from "vite";

export default defineConfig({
  // Must match the GitHub Pages repository subpath.
  // e.g. https://dipsylala.github.io/scale-helper/ → base: "/scale-helper/"
  base: "/scale-helper/",
  test: {
    // Run in Node — the modules under test are all pure functions with no DOM
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
