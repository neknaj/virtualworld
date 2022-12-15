import { build } from "esbuild";
import { readFile } from 'fs/promises';

const pkg = JSON.parse(
  await readFile(
    new URL('./package.json', import.meta.url)
  )
);


const dependencies = Object.keys(pkg.dependencies ?? {});
const peerDependencies = Object.keys(pkg.peerDependencies ?? {});

const external = [...dependencies, ...peerDependencies];

/** @type {import('esbuild').BuildOptions} */
const options = {
  entryPoints: ["./src/world.ts"],
  minify: true,
  bundle: true,
  outfile: "./data/world.js",
  target: "node14.11",
  platform: "node",
  format: "cjs",
  external,
};

if (process.env.WATCH === "true") {
  options.watch = {
    onRebuild(error, result) {
      if (error) {
        console.error("watch build failed:", error);
      } else {
        console.log("watch build succeeded:", result);
      }
    },
  };
  options.sourcemap = "linked";
}

build(options).catch((err) => {
  process.stderr.write(err.stderr);
  process.exit(1);
});