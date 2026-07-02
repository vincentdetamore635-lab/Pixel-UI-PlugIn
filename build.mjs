import esbuild from "esbuild";
import { existsSync, mkdirSync, copyFileSync, readdirSync } from "fs";
import { join } from "path";

const PLUGINS_DIR = "plugins";
const DIST_DIR = "dist";

mkdirSync(DIST_DIR, { recursive: true });

if (!existsSync(PLUGINS_DIR)) {
  console.error("ERROR: plugins/ directory not found at repo root.");
  console.log("Repo root contents:", readdirSync("."));
  process.exit(1);
}

const pluginDirs = readdirSync(PLUGINS_DIR).filter((name) => {
  return existsSync(join(PLUGINS_DIR, name, "manifest.json"));
});

console.log("Found plugins:", pluginDirs);

for (const pluginName of pluginDirs) {
  const srcDir = join(PLUGINS_DIR, pluginName, "src");
  const outDir = join(DIST_DIR, pluginName);

  mkdirSync(outDir, { recursive: true });

  copyFileSync(
    join(PLUGINS_DIR, pluginName, "manifest.json"),
    join(outDir, "manifest.json")
  );

  await esbuild.build({
    entryPoints: [join(srcDir, "index.ts")],
    bundle: true,
    format: "iife",
    globalName: "plugin",
    outfile: join(outDir, "index.js"),
    external: ["@vendetta", "@vendetta/*"],
    footer: {
      js: "var _pluginExports = plugin.default ?? plugin; module$1 && (module$1.exports = _pluginExports);",
    },
    define: {
      __DEV__: "false",
    },
  });

  console.log("Built:", pluginName);
}

console.log("Done.");
