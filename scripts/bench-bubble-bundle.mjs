import {
  copyFile,
  cp,
  mkdir,
  mkdtemp,
  rm,
  symlink,
  writeFile,
} from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

// Use the repository's installed Vite toolchain; no extra dependency is needed.
const require = createRequire(import.meta.url);
const { build, transform } = createRequire(require.resolve('vite'))('esbuild');
const { build: viteBuild } = await import('vite');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const useDist = process.argv.includes('--dist');
const splitting = !process.argv.includes('--no-splitting');
const engineArg = process.argv.indexOf('--engine');
const engine = engineArg === -1 ? 'vite' : process.argv[engineArg + 1];
if (!['vite', 'esbuild'].includes(engine))
  throw new Error('Expected --engine vite or esbuild');
if (process.argv.includes('--check') && !useDist)
  throw new Error('--check requires --dist');
const source = useDist ? 'dist' : 'src';
const extension = useDist ? 'js' : 'tsx';
const rootEntry = useDist
  ? '@ant-design/agentic-ui'
  : path.join(root, source, 'index.ts');
const entries = {
  BubbleRoot: `export { Bubble } from ${JSON.stringify(rootEntry)};`,
  BubbleSubpath: `export { Bubble } from ${JSON.stringify(useDist ? '@ant-design/agentic-ui/Bubble' : path.join(root, source, 'Bubble', `index.${extension}`))};`,
  BubbleListRoot: `export { BubbleList } from ${JSON.stringify(rootEntry)};`,
  MessageMapper: `export { mapOpenAIMessagesToMessageBubbleData } from ${JSON.stringify(rootEntry)};`,
  ReadonlyMarkdownEditorView: `export { default as ReadonlyMarkdownEditorView } from ${JSON.stringify(useDist ? '@ant-design/agentic-ui/ReadonlyMarkdownEditorView' : path.join(root, source, 'MarkdownEditor', `ReadonlyMarkdownEditorView.${extension}`))};`,
};
const entryArg = process.argv.indexOf('--entry');
const entryNames =
  entryArg === -1 ? Object.keys(entries) : [process.argv[entryArg + 1]];
if (entryNames.some((name) => !entries[name])) {
  throw new Error(
    'Unknown --entry; expected one of ' + Object.keys(entries).join(', '),
  );
}
const scratch = await mkdtemp(path.join(tmpdir(), 'agentic-bubble-bundle-'));

try {
  const consumerRoot = path.join(scratch, 'consumer');
  if (useDist) {
    // Install a physical package snapshot so resolver metadata is tested in the
    // same node_modules scope as a consumer, without workspace/self-reference
    // behavior or realpath escapes through symlinks.
    const packageRoot = path.join(
      consumerRoot,
      'node_modules/@ant-design/agentic-ui',
    );
    await mkdir(packageRoot, { recursive: true });
    await copyFile(
      path.join(root, 'package.json'),
      path.join(packageRoot, 'package.json'),
    );
    await cp(path.join(root, 'dist'), path.join(packageRoot, 'dist'), {
      recursive: true,
    });
    await symlink(
      path.join(root, 'node_modules'),
      path.join(packageRoot, 'node_modules'),
      'dir',
    );
  }
  const reports = [];
  const metafiles = {};
  for (const name of entryNames) {
    // Independent builds model independent applications; sharing one build would
    // merge exports from the root barrel into a common chunk across the probes.
    let result;
    if (engine === 'vite') {
      const entryFile = path.join(
        useDist ? consumerRoot : scratch,
        `${name}.js`,
      );
      await writeFile(entryFile, entries[name]);
      const generated = await viteBuild({
        configFile: false,
        root: useDist ? consumerRoot : root,
        logLevel: 'silent',
        define: { 'process.env.NODE_ENV': '"production"' },
        plugins: [
          {
            name: 'benchmark-exclude-css',
            enforce: 'pre',
            load(id) {
              if (/\.(?:css|less|scss)(?:\?.*)?$/.test(id)) return '';
            },
          },
        ],
        build: {
          write: false,
          minify: 'esbuild',
          target: 'es2020',
          lib: {
            entry: entryFile,
            formats: ['es'],
            fileName: () => `${name}.js`,
          },
          rollupOptions: {
            external: (id) => /^(?:react|react-dom|antd)(?:\/|$)/.test(id),
          },
        },
      });
      const files = (
        Array.isArray(generated) ? generated : [generated]
      ).flatMap((output) => output.output);
      const outputs = {};
      const inputs = {};
      const outputFiles = [];
      for (const file of files) {
        if (file.type !== 'chunk') continue;
        // Vite preserves whitespace in ES library output to keep annotations.
        // Measure the minified consumer chunk while retaining its split graph.
        const minified = await transform(file.code, {
          minify: true,
          format: 'esm',
          target: 'es2020',
          legalComments: 'none',
        });
        const contents = Buffer.from(minified.code);
        outputs[file.fileName] = {
          entryPoint: file.isEntry ? `${name}.js` : undefined,
          bytes: contents.length,
          imports: [
            ...file.imports.map((dependency) => ({
              kind: 'import-statement',
              path: dependency,
            })),
            ...file.dynamicImports.map((dependency) => ({
              kind: 'dynamic-import',
              path: dependency,
            })),
          ],
          inputs: Object.fromEntries(
            Object.entries(file.modules).map(([id, module]) => {
              inputs[id] = {};
              return [id, { bytesInOutput: module.renderedLength }];
            }),
          ),
        };
        outputFiles.push({ path: path.resolve(root, file.fileName), contents });
      }
      result = { metafile: { inputs, outputs }, outputFiles };
    } else {
      // esbuild splitting can keep a large shared chunk for otherwise-unused
      // barrel exports. Keep it available for diagnostics, not the default
      // production split-bundle measurement.
      result = await build({
        absWorkingDir: root,
        stdin: {
          contents: entries[name],
          sourcefile: `${name}.js`,
          resolveDir: useDist ? consumerRoot : root,
        },
        // A published-package consumer must resolve exports rather than the
        // development tsconfig alias mapping this package name back to src.
        ...(useDist ? { tsconfigRaw: {} } : {}),
        nodePaths: [path.join(root, 'node_modules')],
        bundle: true,
        format: 'esm',
        splitting,
        write: false,
        outdir: path.join(scratch, 'output', name),
        platform: 'browser',
        minify: true,
        metafile: true,
        external: ['react', 'react-dom', 'react-dom/*', 'antd', 'antd/*'],
        define: { 'process.env.NODE_ENV': '"production"' },
        loader: {
          '.png': 'dataurl',
          '.svg': 'dataurl',
          '.woff2': 'dataurl',
          '.woff': 'dataurl',
          '.ttf': 'dataurl',
          '.html': 'text',
          '.less': 'empty',
          '.css': 'empty',
        },
        logLevel: 'error',
      });
    }
    metafiles[name] = result.metafile;
    if (
      useDist &&
      Object.keys(result.metafile.inputs).some(
        (input) =>
          input.startsWith('src/') ||
          input.includes(path.join(root, 'src') + path.sep),
      )
    ) {
      throw new Error(
        'The dist probe resolved source aliases rather than package exports',
      );
    }

    const outputs = result.metafile.outputs;
    const outputContent = new Map(
      result.outputFiles.map((file) => [
        path.resolve(file.path),
        file.contents,
      ]),
    );
    const [entry] = Object.entries(outputs).find(
      ([, output]) =>
        output.entryPoint && path.basename(output.entryPoint) === `${name}.js`,
    );
    const visited = new Set();
    const visit = (file) => {
      if (visited.has(file)) return;
      visited.add(file);
      for (const dependency of outputs[file].imports) {
        // Dynamic chunks are emitted but not part of the initial download.
        if (
          dependency.kind === 'import-statement' &&
          outputs[dependency.path]
        ) {
          visit(dependency.path);
        }
      }
    };
    visit(entry);

    const inputs = new Set();
    let bytes = 0;
    let gzipBytes = 0;
    for (const file of visited) {
      bytes += outputs[file].bytes;
      gzipBytes += gzipSync(outputContent.get(path.resolve(root, file))).length;
      for (const [input, usage] of Object.entries(outputs[file].inputs)) {
        if (usage.bytesInOutput > 0) inputs.add(input);
      }
    }

    const included = (pattern) =>
      [...inputs].some((input) => pattern.test(input));
    const report = {
      entry: name,
      initialBytes: bytes,
      initialGzipBytes: gzipBytes,
      initialChunks: visited.size,
      initialModules: inputs.size,
      slate: included(/\/slate(?:-react|-dom)?\//),
      schemaEditorBridge: included(/SchemaEditorBridgeManager|host-sdk/),
      workspaceView: included(
        /(?:src|dist)\/Workspace\/(?:index|Workspace|File\/index)\./,
      ),
      robot: included(/(?:src|dist)\/Components\/Robot\//),
      officeViewer: included(/(?:src|dist)\/Components\/OfficeViewer\//),
      allEmittedBytes: Object.values(outputs).reduce(
        (sum, output) => sum + output.bytes,
        0,
      ),
    };
    reports.push(report);
  }

  const metafileArg = process.argv.indexOf('--metafile');
  if (metafileArg !== -1 && process.argv[metafileArg + 1]) {
    await writeFile(process.argv[metafileArg + 1], JSON.stringify(metafiles));
  }

  console.log(
    JSON.stringify(
      {
        source,
        engine,
        splitting: engine === 'vite' ? true : splitting,
        external: ['react', 'react-dom', 'antd'],
        css: 'excluded',
        metrics:
          'minified ESM; all statically imported chunks, gzip summed per chunk',
        entries: reports,
      },
      null,
      2,
    ),
  );
  if (process.argv.includes('--check')) {
    for (const report of reports) {
      if (
        report.schemaEditorBridge ||
        report.workspaceView ||
        report.robot ||
        report.officeViewer
      ) {
        throw new Error(
          `Unused components survived tree shaking: ${report.entry}`,
        );
      }
      if (
        (report.entry === 'MessageMapper' ||
          report.entry === 'ReadonlyMarkdownEditorView') &&
        report.slate
      ) {
        throw new Error(`${report.entry} pulled in Slate`);
      }
    }
  }
} finally {
  await rm(scratch, { recursive: true, force: true });
}
