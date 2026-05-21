import { describe, expect, it } from 'vitest';
import {
  hasDangerousEventHandlers,
  looksLikeHtmlSnippet,
  serializeHastElement,
  shouldElementRenderAsPlainText,
  shouldRenderUrlAsPlainText,
} from '../htmlUrlSafety';

describe('htmlUrlSafety', () => {
  describe('shouldRenderUrlAsPlainText', () => {
    it('应将含 onerror 的 HTML 片段识别为纯文本', () => {
      expect(
        shouldRenderUrlAsPlainText('<img src=x onerror=alert(1)>'),
      ).toBe(true);
    });

    it('应将含 onload 的字符串识别为纯文本', () => {
      expect(shouldRenderUrlAsPlainText('<body onload=alert(1)>')).toBe(true);
    });

    it('应将 javascript: URL 识别为纯文本', () => {
      expect(shouldRenderUrlAsPlainText('javascript:alert(1)')).toBe(true);
    });

    it('应允许正常 https URL', () => {
      expect(
        shouldRenderUrlAsPlainText('https://example.com/img.png'),
      ).toBe(false);
    });
  });

  describe('shouldElementRenderAsPlainText', () => {
    it('img 含 onerror 时应降级', () => {
      expect(
        shouldElementRenderAsPlainText({
          type: 'element',
          tagName: 'img',
          properties: { src: 'x', onerror: 'alert(1)' },
        }),
      ).toBe(true);
    });

    it('div 含 onclick 时不应降级（仅剥离属性）', () => {
      expect(
        shouldElementRenderAsPlainText({
          type: 'element',
          tagName: 'div',
          properties: { onclick: 'alert(1)' },
        }),
      ).toBe(false);
    });
  });

  describe('serializeHastElement', () => {
    it('应序列化 void 标签', () => {
      expect(
        serializeHastElement({
          tagName: 'img',
          properties: { src: 'x', onerror: 'alert(1)' },
        }),
      ).toBe('<img src="x" onerror="alert(1)">');
    });
  });

  describe('hasDangerousEventHandlers / looksLikeHtmlSnippet', () => {
    it('应检测 onerror', () => {
      expect(hasDangerousEventHandlers('onerror=alert(1)')).toBe(true);
    });

    it('应检测 HTML 片段', () => {
      expect(looksLikeHtmlSnippet('<img src=x>')).toBe(true);
      expect(looksLikeHtmlSnippet('https://a.com')).toBe(false);
    });
  });
});
