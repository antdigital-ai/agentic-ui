/**
 * htmlUrlSafety residual：serialize void/嵌套、危险属性矩阵。
 */
import { describe, expect, it } from 'vitest';
import {
  hasDangerousEventHandlers,
  looksLikeHtmlSnippet,
  serializeHastElement,
  shouldElementRenderAsPlainText,
  shouldRenderUrlAsPlainText,
} from '../htmlUrlSafety';

describe('htmlUrlSafety residual branches', () => {
  it('serializeHastElement：void / 嵌套 / 数组属性 / 空 children', () => {
    expect(
      serializeHastElement({
        tagName: 'img',
        properties: { src: 'a.png', className: ['a', 'b'] },
      }),
    ).toBe('<img src="a.png" className="a b">');

    expect(
      serializeHastElement({
        tagName: 'a',
        properties: { href: 'https://x' },
        children: [
          { type: 'text', value: 'hi' },
          {
            type: 'element',
            tagName: 'span',
            children: [{ type: 'text', value: '!' }],
          } as any,
          { type: 'comment' } as any,
        ],
      }),
    ).toContain('<a href="https://x">');

    expect(serializeHastElement({ tagName: 'div' })).toBe('<div></div>');
  });

  it('shouldElementRenderAsPlainText：on* / javascript src / html snippet href', () => {
    expect(
      shouldElementRenderAsPlainText({
        type: 'element',
        tagName: 'img',
        properties: { onerror: 'alert(1)' },
      }),
    ).toBe(true);
    expect(
      shouldElementRenderAsPlainText({
        type: 'element',
        tagName: 'img',
        properties: { src: 'javascript:alert(1)' },
      }),
    ).toBe(true);
    expect(
      shouldElementRenderAsPlainText({
        type: 'element',
        tagName: 'a',
        properties: { href: '<img src=x onerror=1>' },
      }),
    ).toBe(true);
    expect(
      shouldElementRenderAsPlainText({
        type: 'element',
        tagName: 'img',
        properties: { width: 1 },
      }),
    ).toBe(false);
  });

  it('looksLikeHtmlSnippet / hasDangerousEventHandlers 边界', () => {
    expect(looksLikeHtmlSnippet('<div>')).toBe(true);
    expect(looksLikeHtmlSnippet('plain')).toBe(false);
    expect(hasDangerousEventHandlers('onclick=x')).toBe(true);
    expect(shouldRenderUrlAsPlainText('<script>')).toBe(true);
  });

  it('shouldElementRenderAsPlainText：非 element / 无 tag / 安全媒体', () => {
    expect(shouldElementRenderAsPlainText({ type: 'text' })).toBe(false);
    expect(
      shouldElementRenderAsPlainText({ type: 'element' } as any),
    ).toBe(false);
    expect(
      shouldElementRenderAsPlainText({
        type: 'element',
        tagName: 'img',
        properties: { src: 'https://ok.png' },
      }),
    ).toBe(false);
    expect(
      shouldElementRenderAsPlainText({
        type: 'element',
        tagName: 'a',
        properties: undefined,
      }),
    ).toBe(false);
  });
});
