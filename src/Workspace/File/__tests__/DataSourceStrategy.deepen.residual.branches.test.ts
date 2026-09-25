/**
 * DataSourceStrategy deepen：空 url 扩展名；createObjectURL 不可用。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ContentDataSourceStrategy,
  FileDataSourceStrategy,
  UrlDataSourceStrategy,
} from '../DataSourceStrategy';

describe('DataSourceStrategy deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.restoreAllMocks();
  });

  it('Url 无扩展名归为 Other', () => {
    const s = new UrlDataSourceStrategy();
    expect(s.canHandle({ name: 'a', url: '' } as any)).toBe(false);
    const r = s.process({
      name: 'a',
      url: 'https://example.com/noext',
    } as any);
    expect(r.previewUrl).toBe('https://example.com/noext');
  });

  it('Content 在 createObjectURL 假值时无 previewUrl', () => {
    vi.spyOn(URL, 'createObjectURL').mockImplementation(undefined as any);
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      writable: true,
      value: undefined,
    });
    const s = new ContentDataSourceStrategy();
    const r = s.process({ name: 't.txt', content: 'hello' } as any);
    expect(r.content).toBe('hello');
    expect(r.previewUrl).toBeUndefined();
    expect(r.needsCleanup).toBe(false);
  });

  it('File 在 createObjectURL 假值时 needsCleanup 为 false', () => {
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      writable: true,
      value: undefined,
    });
    const s = new FileDataSourceStrategy();
    const file = new File(['x'], 'a.png', { type: 'image/png' });
    const r = s.process({ name: 'a.png', file } as any);
    expect(r.needsCleanup).toBe(false);
  });
});
