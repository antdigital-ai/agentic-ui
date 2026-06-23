/// <reference types="vitest/config" />
import path from 'path';
import { defineConfig } from 'vite';

/**
 * 默认排除「非单元」或「纯覆盖率补洞」测试，降低 pnpm test 用例数量与耗时。
 * 全量套件（与 Codecov 任务一致）用以下任一方式：
 * - pnpm run test:full / pnpm run test:coverage:full（推荐，使用 --mode full）
 * - VITEST_FULL_SUITE=1 pnpm test（兼容仅设环境变量、无 --mode 的场景）
 *
 * 备注：所有测试文件已从 tests/ 迁移到 src/Component/__tests__/，
 * 故路径模式从 tests/X 改为 src/X/__tests__。
 */
const defaultTestExcludes = [
  '**/node_modules/**',
  '**/dist/**',
  /** Playwright E2E（由 `pnpm run test:e2e` 运行） */
  '**/e2e/**',
  '**/*.spec.ts',
  '**/*.spec.tsx',
  /**
   * 性能 / 基准（按需：`pnpm run bench:parsemd` 或 `pnpm run test:full`）
   * 已统一为 .benchmark 后缀
   */
  '**/*.benchmark.test.ts',
  '**/*.benchmark.test.tsx',
  /**
   * 分支补洞（统一后缀，原 .coverage / .targeted / .targeted-coverage /
   * .comprehensive / .disabled-coverage / .enhanced 已合并到 .branches）
   */
  '**/*.branches.test.ts',
  '**/*.branches.test.tsx',
  /** 迁移产生的冲突保留文件：与原 src/__tests__ 重复，全量再跑 */
  '**/*.from-tests.test.ts',
  '**/*.from-tests.test.tsx',
  /** Workspace 子系统用例体量大，与 E2E 重叠多；改 Workspace 时用 `pnpm test src/Workspace/__tests__` 或 `pnpm run test:full` */
  '**/src/Workspace/__tests__/**',
  /** 体量大的集成区：默认套件外跑，见 `pnpm run test:full` 或按目录单跑 */
  '**/src/Plugins/chart/__tests__/**',
  '**/src/Plugins/code/__tests__/**',
  '**/src/Plugins/katex/__tests__/**',
  '**/src/Plugins/mermaid/__tests__/**',
  '**/src/MarkdownEditor/__tests__/editor/**',
  '**/src/Bubble/__tests__/**',
  '**/src/Schema/**/__tests__/**',
  '**/src/History/__tests__/**',
  '**/src/MarkdownInputField/**',
  '**/src/Utils/__tests__/language.test.ts',
];

const fullSuiteTestExcludes = ['**/node_modules/**', '**/dist/**', '**/e2e/**'];

const isFullSuite = (mode: string | undefined) =>
  mode === 'full' || process.env.VITEST_FULL_SUITE === '1';

export default defineConfig(({ mode }) => ({
  esbuild: {
    //jsxInject: "import React from 'react'",
  },
  server: {
    host: '127.0.0.1',
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: './_test_helpers/setupTests.ts',
    testTimeout: 30000,
    exclude: isFullSuite(mode) ? fullSuiteTestExcludes : defaultTestExcludes,
    // 限制并发：full 模式文件多、内存占用大，降低并行度防止 OOM / 卡死
    maxConcurrency: isFullSuite(mode) ? 5 : 10,
    fileParallelism: !isFullSuite(mode),
    pool: 'forks',
    maxWorkers: isFullSuite(mode) ? 2 : undefined,
    minWorkers: 1,
    alias: [
      {
        find: '@ant-design/agentic-ui',
        replacement: path.resolve(__dirname, './src'),
      },
      {
        find: '@schema-element-editor/host-sdk/core',
        replacement: path.resolve(
          __dirname,
          './_test_helpers/_mocks_/schemaEditorHostSdkMock.ts',
        ),
      },
      {
        find: '@schema-element-editor/host-sdk',
        replacement: path.resolve(
          __dirname,
          './_test_helpers/_mocks_/schemaEditorHostSdkMock.ts',
        ),
      },
      {
        find: /^ace-builds\/src-noconflict\/(mode|theme)-.+/,
        replacement: path.resolve(
          __dirname,
          './_test_helpers/_mocks_/aceBuildsSideEffectStub.ts',
        ),
      },
    ],
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx,js,jsx}'],
      all: true,
      exclude: [
        /** 不把源码树内的测试文件 / 测试支撑文件计入覆盖率，避免拉低分支等指标 */
        '**/src/**/__tests__/**',
        '**/_test_helpers/**',
        '**/src/**/*.test.ts',
        '**/src/**/*.test.tsx',
        '**/src/**/*.spec.ts',
        '**/src/**/*.spec.tsx',
        '**/MarkdownEditor/editor/slate-react/**',
        '**/slate-table/**',
        '**/icons/**',
        '**/Icons/animated/**',
        'test/**',
        '**/Hooks/useIntersectionOnce.ts',
        /** ThoughtChainList 已废弃，不再计入覆盖率 */
        '**/ThoughtChainList/**',
      ],
      // 启用 COVERAGE_ENFORCE=1 时强制覆盖率阈值；src 内 *.test / __tests__ 已排除在覆盖率外
      ...(process.env.COVERAGE_ENFORCE === '1' && {
        thresholds: {
          lines: 90,
          functions: 90,
          branches: 84,
          statements: 90,
        },
      }),
    },
  },
}));
