/**
 * htmlUrlSafety 分支覆盖：危险 URL、hast 序列化、元素降级边界。
 */
import { describe, expect, it } from 'vitest';
import {
  DANGEROUS_URL_SCHEMES,
  hasDangerousEventHandlers,
  hasDangerousUrlScheme,
  looksLikeHtmlSnippet,
  serializeHastElement,
  shouldElementRenderAsPlainText,
  shouldRenderUrlAsPlainText,
  UNSAFE_URL_PLAIN_TEXT_STYLE,
} from '../htmlUrlSafety';

describe('htmlUrlSafety branches', () => {
  describe('shouldRenderUrlAsPlainText', () => {
    it('空值与非字符串返回 false', () => {
      expect(shouldRenderUrlAsPlainText('')).toBe(false);
      expect(shouldRenderUrlAsPlainText('   ')).toBe(false);
      expect(shouldRenderUrlAsPlainText(null as unknown as string)).toBe(false);
      expect(shouldRenderUrlAsPlainText(undefined as unknown as string)).toBe(
        false,
      );
    });

    it('vbscript 协议识别为危险', () => {
      expect(shouldRenderUrlAsPlainText('vbscript:msgbox(1)')).toBe(true);
      expect(DANGEROUS_URL_SCHEMES).toContain('vbscript:');
    });

    it('正常相对路径返回 false', () => {
      expect(shouldRenderUrlAsPlainText('/assets/logo.png')).toBe(false);
    });
  });

  describe('hasDangerousUrlScheme', () => {
    it('前导空白后仍识别 javascript', () => {
      expect(hasDangerousUrlScheme('  javascript:void(0)')).toBe(true);
    });

    it('安全 mailto 返回 false', () => {
      expect(hasDangerousUrlScheme('mailto:user@example.com')).toBe(false);
    });
  });

  describe('shouldElementRenderAsPlainText', () => {
    it('非 element 类型返回 false', () => {
      expect(shouldElementRenderAsPlainText({ type: 'text' })).toBe(false);
      expect(shouldElementRenderAsPlainText({ type: 'element' })).toBe(false);
    });

    it('非媒体/链接标签含危险属性时不降级', () => {
      expect(
        shouldElementRenderAsPlainText({
          type: 'element',
          tagName: 'span',
          properties: { onclick: 'alert(1)' },
        }),
      ).toBe(false);
    });

    it('video 标签 href 含 javascript 时降级', () => {
      expect(
        shouldElementRenderAsPlainText({
          type: 'element',
          tagName: 'video',
          properties: { poster: 'javascript:alert(1)' },
        }),
      ).toBe(true);
    });

    it('iframe src 含 onerror 片段时降级', () => {
      expect(
        shouldElementRenderAsPlainText({
          type: 'element',
          tagName: 'iframe',
          properties: { src: '<img onerror=alert(1)>' },
        }),
      ).toBe(true);
    });

    it('audio 标签危险 href 降级', () => {
      expect(
        shouldElementRenderAsPlainText({
          type: 'element',
          tagName: 'audio',
          properties: { src: 'javascript:alert(1)' },
        }),
      ).toBe(true);
    });

    it('svg 标签 on* 属性降级', () => {
      expect(
        shouldElementRenderAsPlainText({
          type: 'element',
          tagName: 'svg',
          properties: { onload: 'evil()' },
        }),
      ).toBe(true);
    });

    it('img 安全 src 不降级', () => {
      expect(
        shouldElementRenderAsPlainText({
          type: 'element',
          tagName: 'img',
          properties: { src: 'https://cdn.example.com/a.png' },
        }),
      ).toBe(false);
    });

    it('a 标签非 URL 属性不触发降级', () => {
      expect(
        shouldElementRenderAsPlainText({
          type: 'element',
          tagName: 'a',
          properties: { className: 'link', title: 'safe' },
        }),
      ).toBe(false);
    });

    it('非字符串属性值跳过 URL 检查', () => {
      expect(
        shouldElementRenderAsPlainText({
          type: 'element',
          tagName: 'img',
          properties: { src: 123 as unknown as string },
        }),
      ).toBe(false);
    });
  });

  describe('serializeHastElement', () => {
    it('数组属性值 join 为空格', () => {
      expect(
        serializeHastElement({
          tagName: 'div',
          properties: { class: ['a', 'b'] },
        }),
      ).toBe('<div class="a b"></div>');
    });

    it('嵌套 element 子节点递归序列化', () => {
      expect(
        serializeHastElement({
          tagName: 'div',
          children: [
            { type: 'text', value: 'hi' },
            {
              type: 'element',
              tagName: 'span',
              children: [{ type: 'text', value: 'inner' }],
            },
            { type: 'comment', value: 'ignored' },
          ],
        }),
      ).toBe('<div>hi<span>inner</span></div>');
    });

    it('void 标签 br 不闭合', () => {
      expect(serializeHastElement({ tagName: 'br' })).toBe('<br>');
    });

    it('无 properties 时使用空属性串', () => {
      expect(
        serializeHastElement({
          tagName: 'p',
          children: [{ type: 'text', value: 'x' }],
        }),
      ).toBe('<p>x</p>');
    });
  });

  describe('常量与辅助', () => {
    it('UNSAFE_URL_PLAIN_TEXT_STYLE 含 boxSizing', () => {
      expect(UNSAFE_URL_PLAIN_TEXT_STYLE.boxSizing).toBe('border-box');
    });

    it('hasDangerousEventHandlers 大小写不敏感', () => {
      expect(hasDangerousEventHandlers('OnClick=1')).toBe(true);
      expect(hasDangerousEventHandlers('safe-text')).toBe(false);
    });

    it('looksLikeHtmlSnippet 需含标签形态', () => {
      expect(looksLikeHtmlSnippet('  <div>')).toBe(true);
      expect(looksLikeHtmlSnippet('plain')).toBe(false);
    });
  });

  describe('补充 URL / 标签分支', () => {
    it('javascript: 协议识别为危险', () => {
      expect(shouldRenderUrlAsPlainText('javascript:alert(1)')).toBe(true);
      expect(hasDangerousUrlScheme('JavaScript:void(0)')).toBe(true);
    });

    it('含 onerror 事件处理器字符串降级', () => {
      expect(shouldRenderUrlAsPlainText('<img src=x onerror=alert(1)>')).toBe(
        true,
      );
    });

    it('embed 标签危险 src 降级', () => {
      expect(
        shouldElementRenderAsPlainText({
          type: 'element',
          tagName: 'embed',
          properties: { src: 'javascript:alert(1)' },
        }),
      ).toBe(true);
    });

    it('object 标签 on* 属性降级', () => {
      expect(
        shouldElementRenderAsPlainText({
          type: 'element',
          tagName: 'object',
          properties: { onload: 'evil()' },
        }),
      ).toBe(true);
    });

    it('source 标签 xlink:href 危险降级', () => {
      expect(
        shouldElementRenderAsPlainText({
          type: 'element',
          tagName: 'source',
          properties: { 'xlink:href': 'javascript:alert(1)' },
        }),
      ).toBe(true);
    });

    it('a 标签 href 含 data: 但无危险时不降级', () => {
      expect(
        shouldElementRenderAsPlainText({
          type: 'element',
          tagName: 'a',
          properties: { href: 'https://example.com' },
        }),
      ).toBe(false);
    });

    it('serializeHastElement 数字属性值转字符串', () => {
      expect(
        serializeHastElement({
          tagName: 'input',
          properties: { maxLength: 10 as unknown as string },
        }),
      ).toBe('<input maxLength="10">');
    });

    it('elementHasDangerousProperties 非 URL 键的 on* 属性', () => {
      expect(
        shouldElementRenderAsPlainText({
          type: 'element',
          tagName: 'img',
          properties: { onclick: 'alert(1)' },
        }),
      ).toBe(true);
    });

    it('serializeHastElement：数组属性、空属性、嵌套 element/text、非 void', () => {
      expect(
        serializeHastElement({
          tagName: 'div',
          properties: { className: ['a', 'b'] as unknown as string },
          children: [
            { type: 'text', value: 'hi' },
            { type: 'element', tagName: 'span', children: [{ type: 'text', value: 'x' }] },
            { type: 'comment' as any },
          ],
        }),
      ).toContain('className="a b"');
      expect(
        serializeHastElement({
          tagName: 'br',
          properties: {},
        }),
      ).toBe('<br>');
      expect(
        serializeHastElement({
          tagName: 'p',
        }),
      ).toBe('<p></p>');
    });

    it('shouldRenderUrlAsPlainText：HTML 片段', () => {
      expect(shouldRenderUrlAsPlainText('<img src=x onerror=1>')).toBe(true);
      expect(shouldRenderUrlAsPlainText('   ')).toBe(false);
    });
  });
});
