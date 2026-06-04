import { defineConfig, devices } from '@playwright/test';

import { E2E_VIEWPORT } from './_test_helpers/utils/e2eTimeouts';

const isCi = !!process.env.CI;

/**
 * Playwright 测试配置
 * 参考: https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: isCi,
  retries: isCi ? 2 : 0,
  workers: 1,
  timeout: isCi ? 120_000 : 90_000,
  expect: {
    timeout: isCi ? 15_000 : 10_000,
  },
  reporter: isCi ? [['github'], ['html', { open: 'never' }]] : 'html',
  use: {
    baseURL: 'http://localhost:4172',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    navigationTimeout: isCi ? 90_000 : 60_000,
    actionTimeout: isCi ? 20_000 : 15_000,
    viewport: E2E_VIEWPORT,
    locale: 'zh-CN',
    launchOptions: {
      args: [
        '--disable-dev-shm-usage',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-gpu',
      ],
    },
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: E2E_VIEWPORT,
      },
    },
  ],

  webServer: process.env.SKIP_WEBSERVER
    ? undefined // 如果设置了 SKIP_WEBSERVER，跳过自动启动（假设服务器已运行）
    : {
        // 先编译库产物再构建文档，确保 demo 中 `@ant-design/agentic-ui` 指向的 dist 与当前 src 一致。
        // CI 可设 E2E_PREBUILT=1，在 workflow 中先 build + docs:build，此处只启动 preview。
        command: process.env.E2E_PREBUILT
          ? 'pnpm run preview'
          : 'pnpm run build && pnpm run docs:build && pnpm run preview',
        url: 'http://localhost:4172',
        reuseExistingServer: !process.env.CI, // 本地开发时复用已有服务器
        // 全量 build + dumi build 在 CI 上常超过 6 分钟；预构建路径仅等 preview 启动。
        timeout: process.env.E2E_PREBUILT ? 180 * 1000 : 720 * 1000,
        stdout: 'pipe', // 减少输出，提升性能
        stderr: 'pipe',
      },
});
