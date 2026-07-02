import esbuild from "esbuild";

import { existsSync, mkdirSync, copyFileSync, readdirSync } from "fs";

import { join } from "path";



const PLUGINS_DIR = "plugins";

const DIST_DIR = "dist";



// Find all plugin folders (each has a manifest.json at root and src/index.ts)

const pluginDirs = readdirSync(PLUGINS_DIR).filter((name) => {

  return existsSync(join(PLUGINS_DIR, name, "manifest.json"));

});



for (const pluginName of pluginDirs) {

  const srcDir = join(PLUGINS_DIR, pluginName, "src");

  const outDir = join(DIST_DIR, pluginName);



  mkdirSync(outDir, { recursive: true });



  // Copy manifest

  copyFileSync(

    join(PLUGINS_DIR, pluginName, "manifest.json"),

    join(outDir, "manifest.json")

  );



  // Bundle index.ts -> index.js

  await esbuild.build({

    entryPoints: [join(srcDir, "index.ts")],

    bundle: true,

    format: "iife",

    globalName: "plugin",

    outfile: join(outDir, "index.js"),

    // All @vendetta/* imports are provided at runtime by Revenge

    external: [

      "@vendetta",

      "@vendetta/*",

    ],

    // Wrap in the format Revenge expects

    footer: {

      js: "var _pluginExports = plugin.default ?? plugin; module$1 && (module$1.exports = _pluginExports);",

    },

    define: {

      __DEV__: "false",

    },

  });



  console.log(`Built: ${pluginName}`);

}



console.log("Done.");
