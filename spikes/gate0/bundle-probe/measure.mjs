import { build, version } from 'esbuild';
import { createHash } from 'node:crypto';
import { brotliCompressSync, gzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';

export const PROFILES = Object.freeze(['idna', 'psl', 'combined']);

const config = Object.freeze({
  platform: 'browser',
  format: 'esm',
  target: 'chrome120',
  bundle: true,
  sourcemap: false,
  charset: 'utf8',
  legalComments: 'inline',
});

const entrypoint = (name) => {
  if (!PROFILES.includes(name)) throw new Error('Unapproved measurement profile: ' + name);
  return fileURLToPath(new URL('./entries/' + name + '.mjs', import.meta.url));
};

function packageInputs(meta) {
  const names = new Set();
  for (const path of Object.keys(meta.inputs)) {
    const matched = path.replaceAll('\\', '/').match(/(?:^|\/)node_modules\/((?:@[^/]+\/)?[^/]+)/u);
    if (matched) names.add(matched[1]);
  }
  return [...names].sort();
}

async function buildProfile(name, minify) {
  const result = await build({
    ...config,
    entryPoints: [entrypoint(name)],
    write: false,
    metafile: true,
    minify,
    logLevel: 'silent',
  });
  if (result.outputFiles.length !== 1) {
    throw new Error('Expected one JS bundle for ' + name);
  }
  const bytes = Buffer.from(result.outputFiles[0].contents);
  return {
    metrics: {
      rawBytes: bytes.length,
      gzipBytes: gzipSync(bytes, { level: 9, mtime: 0 }).length,
      brotliBytes: brotliCompressSync(bytes).length,
      sha256: createHash('sha256').update(bytes).digest('hex'),
      packageInputs: packageInputs(result.metafile),
    },
    output: bytes,
  };
}

/** Gate 0 measurement, NOT a runtime API and NOT an extension bundle. */
export async function measureBundles({ includeOutput = false } = {}) {
  if (version !== '0.25.12') throw new Error('Unexpected bundler version: ' + version);
  const profiles = {};
  const output = new Map();
  for (const name of PROFILES) {
    profiles[name] = {};
    for (const [mode, minify] of [['unminified', false], ['minified', true]]) {
      const result = await buildProfile(name, minify);
      profiles[name][mode] = result.metrics;
      if (includeOutput) output.set(name + ':' + mode, result.output);
    }
  }
  return {
    tool: 'esbuild@' + version,
    config: { ...config },
    profiles,
    ...(includeOutput ? { output } : {}),
  };
}
