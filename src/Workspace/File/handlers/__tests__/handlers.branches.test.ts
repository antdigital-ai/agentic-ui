/**
 * Workspace File handlers 分支。
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  ensureNodeWithId,
  getPreviewSource,
  handleDefaultShare,
  handleFileDownload,
  handleKeyboardEvent,
} from '../index';

describe('Workspace File handlers branches', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('handleKeyboardEvent：仅 Enter/Space 触发', () => {
    const cb = vi.fn();
    handleKeyboardEvent({ key: 'a' } as React.KeyboardEvent, cb);
    expect(cb).not.toHaveBeenCalled();
    handleKeyboardEvent({ key: 'Enter' } as React.KeyboardEvent, cb);
    handleKeyboardEvent({ key: ' ' } as React.KeyboardEvent, cb);
    expect(cb).toHaveBeenCalledTimes(2);
  });

  it('handleFileDownload：url / content / File / Blob / 无源早退', () => {
    const click = vi.fn();
    const append = vi
      .spyOn(document.body, 'appendChild')
      .mockImplementation((n) => n);
    const remove = vi
      .spyOn(document.body, 'removeChild')
      .mockImplementation((n) => n);
    vi.spyOn(document, 'createElement').mockImplementation(() => {
      return {
        href: '',
        download: '',
        click,
      } as any;
    });
    const createObjectURL = vi.fn().mockReturnValue('blob:x');
    const revoke = vi.fn();
    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL: revoke });

    handleFileDownload({ name: 'a.txt', url: 'https://x' } as any);
    expect(click).toHaveBeenCalled();

    handleFileDownload({ name: 'b.txt', content: 'hi' } as any);
    expect(createObjectURL).toHaveBeenCalled();
    expect(revoke).toHaveBeenCalled();

    handleFileDownload({
      name: '',
      file: new File(['x'], 'f.txt'),
    } as any);
    handleFileDownload({
      name: 'blob.bin',
      file: new Blob(['x']),
    } as any);

    click.mockClear();
    handleFileDownload({ name: 'empty' } as any);
    expect(click).not.toHaveBeenCalled();

    append.mockRestore();
    remove.mockRestore();
    vi.unstubAllGlobals();
  });

  it('handleDefaultShare：url / previewUrl / location；clipboard 失败静默', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { clipboard: { writeText } });
    await handleDefaultShare({ url: 'https://share' } as any);
    expect(writeText).toHaveBeenCalledWith('https://share');

    await handleDefaultShare({ previewUrl: 'https://prev' } as any);
    expect(writeText).toHaveBeenCalledWith('https://prev');

    await handleDefaultShare({} as any);
    expect(writeText).toHaveBeenCalledWith(window.location.href);

    writeText.mockRejectedValue(new Error('denied'));
    await expect(handleDefaultShare({ url: 'u' } as any)).resolves.toBeUndefined();
    vi.unstubAllGlobals();
  });

  it('ensureNodeWithId / getPreviewSource', () => {
    const withId = ensureNodeWithId({ id: 'keep', name: 'a' } as any);
    expect(withId.id).toBe('keep');
    const generated = ensureNodeWithId({ name: 'b.txt' } as any);
    expect(generated.id).toBeTruthy();

    expect(getPreviewSource({ previewUrl: 'p', url: 'u' } as any)).toBe('p');
    expect(getPreviewSource({ url: 'u' } as any)).toBe('u');
    expect(getPreviewSource({} as any)).toBe('');
  });
});
