/**
 * dom residual：getMediaType 文档类扩展；getSelRect 有 range。
 */
import { describe, expect, it, vi } from 'vitest';
import { getMediaType, getOffsetLeft, getOffsetTop, getSelRect } from '../dom';

describe('dom residual branches', () => {
  it('getMediaType：document / zip / 空 name 回退', () => {
    expect(getMediaType('a.docx')).toBe('document');
    expect(getMediaType('a.doc')).toBe('document');
    expect(getMediaType('a.xlsx')).toBe('document');
    expect(getMediaType('a.zip')).toBe('other');
    expect(getMediaType('')).toBe('other');
  });

  it('getSelRect：有 range 返回 rect 或 null', () => {
    const rect = { top: 1, left: 2, width: 3, height: 4 } as DOMRect;
    vi.spyOn(window, 'getSelection').mockReturnValue({
      rangeCount: 1,
      getRangeAt: () => ({ getBoundingClientRect: () => rect }),
    } as any);
    expect(getSelRect()).toEqual(rect);
    vi.spyOn(window, 'getSelection').mockReturnValue({
      rangeCount: 1,
      getRangeAt: () => ({ getBoundingClientRect: () => null }),
    } as any);
    expect(getSelRect()).toBeNull();
    vi.restoreAllMocks();
  });

  it('getOffsetLeft/Top：默认 target=body', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    Object.defineProperty(el, 'offsetLeft', { value: 5, configurable: true });
    Object.defineProperty(el, 'offsetTop', { value: 7, configurable: true });
    Object.defineProperty(el, 'offsetParent', {
      value: document.body,
      configurable: true,
    });
    expect(typeof getOffsetLeft(el)).toBe('number');
    expect(typeof getOffsetTop(el)).toBe('number');
    el.remove();
  });
});
