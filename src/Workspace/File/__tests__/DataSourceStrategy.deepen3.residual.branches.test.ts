/**
 * DataSourceStrategy deepen3：空 url 扩展；query/hash 剥离后无扩展。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { UrlDataSourceStrategy } from '../DataSourceStrategy';

describe('DataSourceStrategy deepen3 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('仅 query 的 url 无扩展名', () => {
    const s = new UrlDataSourceStrategy();
    const r = s.process({
      name: 'q',
      url: 'https://cdn.example.com/download?id=1',
    });
    expect(r.previewUrl).toBeTruthy();
  });
});
