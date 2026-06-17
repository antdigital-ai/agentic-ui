import fs from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';

/**
 * CI 构建环境配置回归测试。
 *
 * 这些断言守护 CI 修复（见 PR #595）不被无意改回：
 * - pnpm 11 默认 strictDepBuilds=true，带构建脚本的依赖若未在
 *   pnpm-workspace.yaml 的 allowBuilds 中放行，会触发 ERR_PNPM_IGNORED_BUILDS
 *   使 `pnpm install` 直接失败。
 * - Playwright 的 webServer 需先构建（father build）+ 构建文档（dumi build）
 *   再启动 preview，CI 上整体耗时可能超过 3 分钟，超时过短会偶发失败。
 */
const repoRoot = process.cwd();

const readRepoFile = (relativePath: string): string =>
  fs.readFileSync(path.join(repoRoot, relativePath), 'utf-8');

describe('CI 构建环境配置', () => {
  describe('pnpm-workspace.yaml allowBuilds', () => {
    const requiredBuildDependencies = [
      '@parcel/watcher',
      '@swc/core',
      'core-js',
      'core-js-pure',
      'esbuild',
      'less',
    ];

    const workspaceConfig = readRepoFile('pnpm-workspace.yaml');

    it('应包含 allowBuilds 配置块', () => {
      expect(workspaceConfig).toMatch(/^\s*allowBuilds:/m);
    });

    it.each(requiredBuildDependencies)(
      '应放行 %s 的构建脚本（值为 true）',
      (dependency) => {
        const escaped = dependency.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const entryPattern = new RegExp(
          `^\\s*'?${escaped}'?\\s*:\\s*true\\s*$`,
          'm',
        );
        expect(workspaceConfig).toMatch(entryPattern);
      },
    );
  });

  describe('playwright webServer 超时', () => {
    const MIN_WEBSERVER_TIMEOUT_MS = 360 * 1000;
    const playwrightConfig = readRepoFile('playwright.config.ts');

    /** 解析 webServer 块内 `N * M` 或 `timeout: N * M` 形式的毫秒值 */
    const resolveWebServerTimeoutMs = (source: string): number | null => {
      const webServerIndex = source.indexOf('webServer');
      if (webServerIndex === -1) {
        return null;
      }
      const scoped = source.slice(webServerIndex);
      const matches = [...scoped.matchAll(/(\d+)\s*\*\s*(\d+)/g)];
      if (matches.length === 0) {
        return null;
      }
      return Math.max(
        ...matches.map((match) => Number(match[1]) * Number(match[2])),
      );
    };

    it('应配置 webServer 自动启动命令', () => {
      expect(playwrightConfig).toContain('webServer');
      expect(playwrightConfig).toContain('pnpm run preview');
    });

    it('webServer 启动超时应不少于 6 分钟以避免 CI 偶发超时', () => {
      const timeout = resolveWebServerTimeoutMs(playwrightConfig);
      expect(timeout).not.toBeNull();
      expect(timeout as number).toBeGreaterThanOrEqual(
        MIN_WEBSERVER_TIMEOUT_MS,
      );
    });
  });
});
