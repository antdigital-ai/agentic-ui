import { describe, expect, it, vi } from 'vitest';
import { getMediaType, getSelRect, slugify } from '../dom';

describe('dom utils 分支覆盖', () => {
  it('slugify 清理特殊字符与数字前缀', () => {
    expect(slugify('Hello World!')).toBe('hello-world');
    expect(slugify('  --a--b--  ')).toBe('a-b');
    expect(slugify('123abc')).toBe('_123abc');
  });

  it('getMediaType：blob + alt / 非字符串 / data url / 扩展名', () => {
    expect(getMediaType('blob:abc', 'data:image')).toBe('image');
    expect(getMediaType('blob:abc', 'video:x')).toBe('video');
    expect(getMediaType('blob:abc', 'audio:x')).toBe('audio');
    expect(getMediaType('blob:abc', 'attachment:x')).toBe('attachment');
    expect(getMediaType('blob:abc', 'image')).toBe('image');
    expect(getMediaType('blob:abc')).toBe('image');

    expect(getMediaType(undefined)).toBe('other');
    expect(getMediaType(1 as any)).toBe('other');

    expect(getMediaType('x.png', 'data:')).toBe('image');
    expect(getMediaType('x.bin', 'video:')).toBe('video');
    expect(getMediaType('x.bin', 'audio:')).toBe('audio');
    expect(getMediaType('x.bin', 'attachment:')).toBe('attachment');

    expect(getMediaType('data:image/png;base64,aa')).toBe('image');
    expect(getMediaType('data:video/mp4;base64,aa')).toBe('video');
    expect(getMediaType('data:audio/mp3;base64,aa')).toBe('audio');
    expect(getMediaType('data:application/pdf;base64,aa')).toBe('other');

    expect(getMediaType('https://a.com/x.png?q=1')).toBe('image');
    expect(getMediaType('https://a.com/x?q=1')).toBe('image');
    expect(getMediaType('file.md')).toBe('markdown');
    expect(getMediaType('a.mp3')).toBe('audio');
    expect(getMediaType('a.mp4')).toBe('video');
    expect(getMediaType('a.pdf')).toBe('document');
    expect(getMediaType('a.xyz')).toBe('other');
    expect(getMediaType('noext')).toBe('other');
  });

  it('getSelRect：无 selection / rangeCount 0', () => {
    const orig = window.getSelection;
    vi.spyOn(window, 'getSelection').mockReturnValue(null as any);
    expect(getSelRect()).toBeNull();
    vi.spyOn(window, 'getSelection').mockReturnValue({
      rangeCount: 0,
    } as any);
    expect(getSelRect()).toBeNull();
    window.getSelection = orig;
  });
});
