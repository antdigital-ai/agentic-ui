import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright 测试配置
 * 参考: https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:4172', // preview 服务器端口
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: process.env.SKIP_WEBSERVER
    ? undefined // 如果设置了 SKIP_WEBSERVER，跳过自动启动（假设服务器已运行）
    : {
        // 先构建文档，然后启动预览服务器（比 dev 启动快得多）
        command: 'pnpm run docs:build && pnpm run preview',
        url: 'http://localhost:4172',
        reuseExistingServer: !process.env.CI, // 本地开发时复用已有服务器
        timeout: 180 * 1000, // 3 分钟超时（构建 + 预览启动通常比 dev 快）
        stdout: 'pipe', // 减少输出，提升性能
        stderr: 'pipe',
      },
});
