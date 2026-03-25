import path from 'path';
import { defineConfig } from 'vitest/config';

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
    exclude: ['**/node_modules/**', '**/dist/**'],
    alias: {
      '@ant-design/agentic-ui': path.resolve(__dirname, './src'),
      '@schema-element-editor/host-sdk/core': path.resolve(
        __dirname,
        './tests/_mocks_/schemaEditorHostSdkMock.ts',
      ),
      '@schema-element-editor/host-sdk': path.resolve(
        __dirname,
        './tests/_mocks_/schemaEditorHostSdkMock.ts',
      ),
    },
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'json', 'html'],
      include: ['src/**'],
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
