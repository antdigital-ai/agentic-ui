/**
 * DataSourceStrategy deepen2：无扩展名 url；cleanup 非 blob。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  dataSourceManager,
  UrlDataSourceStrategy,
} from '../DataSourceStrategy';

describe('DataSourceStrategy deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('无扩展名与 cleanup 非 blob', () => {
    const s = new UrlDataSourceStrategy();
    const r = s.process({
      name: 'a',
      url: 'https://cdn.example.com/path/file',
    } as any);
    expect(r.mimeType).toBeTruthy();
    dataSourceManager.cleanupResult({
      needsCleanup: true,
      previewUrl: 'https://x.com/a',
    } as any);
    dataSourceManager.cleanupResult({
      needsCleanup: false,
      previewUrl: 'blob:x',
    } as any);
  });
});
