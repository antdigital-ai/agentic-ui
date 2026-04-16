import path from 'path';
import { defineConfig } from 'vitest/config';

/**
 * 默认排除「非单元」或「纯覆盖率补洞」测试，降低 `pnpm test` 用例数量与耗时。
 * 目标约 5000 条用例；CI 全量：`VITEST_FULL_SUITE=1 pnpm test` 或 `pnpm run test:full`
 */
const defaultTestExcludes = [
  '**/node_modules/**',
  '**/dist/**',
  /** Playwright E2E（由 `pnpm run test:e2e` 运行） */
  '**/e2e/**',
  '**/*.spec.ts',
  '**/*.spec.tsx',
  /** 性能 / 基准，按需：`pnpm run bench:parsemd` 或 `VITEST_FULL_SUITE=1` */
  '**/*.benchmark.test.ts',
  '**/*.benchmark.test.tsx',
  '**/*.performance.test.ts',
  '**/*.performance.test.tsx',
  /** 覆盖率定向 / 大而全的重复场景，全量 CI 再跑 */
  '**/*targeted-coverage*.test.ts',
  '**/*targeted-coverage*.test.tsx',
  '**/*comprehensive*.test.ts',
  '**/*comprehensive*.test.tsx',
  /** 分支 / 覆盖率补洞 / 增强断言等重复套件（`src/Plugins/chart` 单测仍保留） */
  '**/tests/plugins/chart/**',
  '**/tests/plugins/chart.test.tsx',
  '**/*.branches.test.ts',
  '**/*.branches.test.tsx',
  '**/*.coverage.test.ts',
  '**/*.coverage.test.tsx',
  '**/*.enhanced.test.ts',
  '**/*.enhanced.test.tsx',
  '**/*.assertions.test.ts',
  '**/*.assertions.test.tsx',
  '**/*.targeted.test.ts',
  '**/*.targeted.test.tsx',
  '**/*missing-coverage.test.ts',
  '**/*missing-coverage.test.tsx',
  /** Workspace 子系统用例体量大，与 E2E 重叠多；改 Workspace 时用 `pnpm test tests/Workspace` 或 `pnpm run test:full` */
  '**/tests/Workspace/**',
  /** 体量大的集成区：默认套件外跑，见 `pnpm run test:full` 或按目录单跑 */
  '**/tests/plugins/**',
  '**/tests/MarkdownEditor/editor/**',
  '**/tests/Bubble/**',
  '**/tests/Bubble*.tsx',
  '**/tests/schema/**',
  '**/tests/MarkdownInputField/**',
  '**/tests/History/**',
  '**/src/MarkdownRenderer/**',
  '**/src/MarkdownInputField/**',
  '**/tests/editor/utils/editorUtils.test.ts',
  '**/tests/utils/language.test.ts',
];

const testExclude =
  process.env.VITEST_FULL_SUITE === '1'
    ? ['**/node_modules/**', '**/dist/**', '**/e2e/**']
    : defaultTestExcludes;

export default defineConfig({
  esbuild: {
    //jsxInject: "import React from 'react'",
  },
  server: {
    host: '127.0.0.1',
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './tests/setupTests.ts',
    testTimeout: 500000,
    exclude: testExclude,
    alias: [
      {
        find: '@ant-design/agentic-ui',
        replacement: path.resolve(__dirname, './src'),
      },
      {
        find: '@schema-element-editor/host-sdk/core',
        replacement: path.resolve(
          __dirname,
          './tests/_mocks_/schemaEditorHostSdkMock.ts',
        ),
      },
      {
        find: '@schema-element-editor/host-sdk',
        replacement: path.resolve(
          __dirname,
          './tests/_mocks_/schemaEditorHostSdkMock.ts',
        ),
      },
      {
        find: /^ace-builds\/src-noconflict\/(mode|theme)-.+/,
        replacement: path.resolve(
          __dirname,
          './tests/_mocks_/aceBuildsSideEffectStub.ts',
        ),
      },
    ],
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx,js,jsx}'],
      all: true,
      exclude: [
        'tests/**',
        /** 不把源码树内的测试文件计入覆盖率，避免拉低分支等指标 */
        '**/src/**/__tests__/**',
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
});
