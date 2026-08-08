/**
 * handlers deepen：download 名空时回退 File.name；share 无 url。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getPreviewSource,
  handleDefaultShare,
  handleFileDownload,
  handleKeyboardEvent,
} from '../index';

describe('handlers deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('download：无 name 时用 File.name', () => {
    const click = vi.fn();
    const append = vi.spyOn(document.body, 'appendChild').mockImplementation((n: any) => {
      n.click = click;
      return n;
    });
    vi.spyOn(document.body, 'removeChild').mockImplementation((n: any) => n);
    const file = new File(['x'], 'from-file.txt', { type: 'text/plain' });
    handleFileDownload({ name: '', file } as any);
    expect(click).toHaveBeenCalled();
    append.mockRestore();
  });

  it('share / preview / keyboard 边角', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    await handleDefaultShare({ name: 'a' } as any);
    expect(writeText).toHaveBeenCalled();
    expect(getPreviewSource({ name: 'a' } as any)).toBe('');
    const cb = vi.fn();
    handleKeyboardEvent({ key: 'Enter' } as any, cb);
    expect(cb).toHaveBeenCalled();
  });
});
