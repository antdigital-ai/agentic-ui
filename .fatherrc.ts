import { defineConfig } from 'father';

// 不参与 dist 打包的测试相关文件 / 目录
const TEST_IGNORES = [
  'src/**/__tests__/**',
  'src/**/*.test.ts',
  'src/**/*.test.tsx',
  'src/**/*.spec.ts',
  'src/**/*.spec.tsx',
];

export default defineConfig({
  // more father config: https://github.com/umijs/father/blob/master/docs/config.md
  esm: {
    output: 'dist',
    transformer: 'swc',
    ignores: TEST_IGNORES,
  },
});
