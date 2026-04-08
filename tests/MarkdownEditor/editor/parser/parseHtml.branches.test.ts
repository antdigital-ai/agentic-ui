/**
 * parseHtml 分支覆盖补充测试
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/* ---------- mock ---------- */
vi.mock(
  '../../../../src/MarkdownEditor/editor/utils',
  () => ({
    EditorUtils: {
      createMediaNode: vi.fn((url: string, type: string, opts?: any) => ({
        type: 'media',
        src: url,
        mediaType: type,
        ...opts,
      })),
    },
  }),
);

vi.mock(
  '../../../../src/MarkdownEditor/editor/plugins/insertParsedHtmlNodes',
  () => ({
    htmlToFragmentList: vi.fn(() => [
      { type: 'paragraph', children: [{ text: '' }] },
    ]),
  }),
);

// mock partialJsonParse 使其抛出，触发 parseCommentContextProps 双重失败
const mockPartialJsonParse = vi.fn();
vi.mock(
  '../../../../src/MarkdownEditor/editor/parser/json-parse',
  () => ({
    default: (...args: any[]) => mockPartialJsonParse(...args),
  }),
);

import {
  findImageElement,
  handleHtml,
} from '../../../../src/MarkdownEditor/editor/parser/parse/parseHtml';

describe('parseHtml 分支覆盖', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    // 默认让 partialJsonParse 抛出
    mockPartialJsonParse.mockImplementation(() => {
      throw new Error('partial parse failed');
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /* ====== parseCommentContextProps 双重 parse 失败 ====== */

  describe('parseCommentContextProps 双重 JSON 解析失败', () => {
    it('json5 和 partialJsonParse 均失败时返回空 contextProps 并打印警告', () => {
      const el = { value: '<!-- {invalid!@#$json} -->' };
      const r = handleHtml(el, null, [], undefined);
      expect(r.contextProps).toEqual({});
      expect(console.warn).toHaveBeenCalled();
    });

    it('json5 和 partialJsonParse 均失败后仍返回空对象', () => {
      const el = { value: '<!-- [broken array -->' };
      const r = handleHtml(el, null, [], undefined);
      expect(r.contextProps).toEqual({});
    });
  });

  /* ====== <p align> 非 paragraph 首节点但有 children ====== */

  describe('handleBlockHtml <p align> 分支', () => {
    it('parseMarkdownFn 返回非 paragraph 类型但有 children 时使用该节点', () => {
      const el = { value: '<p align="center">**heading**</p>' };
      const parseMarkdownFn = () => ({
        schema: [
          {
            type: 'head',
            level: 1,
            children: [{ text: 'heading', bold: true }],
          },
        ],
      });
      const r = handleHtml(el, null, [], parseMarkdownFn);
      expect(r.el.align).toBe('center');
      expect(r.el.type).toBe('head');
      expect(r.el.children).toBeDefined();
      expect(r.el.otherProps?.align).toBe('center');
    });
  });

  /* ====== 块级非标准非注释 HTML → return text ====== */

  describe('handleBlockHtml 非标准 HTML 回退', () => {
    it('非注释非标准 HTML 块级元素返回纯文本节点', () => {
      const el = { value: '<my-component>content</my-component>' };
      const r = handleHtml(el, null, [], undefined);
      expect(r.el).toEqual({
        text: '<my-component>content</my-component>',
      });
    });
  });

  /* ====== unclosed comment → isUnclosedComment → finished=false ====== */

  describe('applyElementConfig isUnclosedComment', () => {
    it('未闭合注释时 otherProps.finished 设为 false', () => {
      const el = { value: '<!-- <span>partial' };
      const r = handleHtml(el, null, [], undefined);
      expect(r.el?.otherProps?.finished).toBe(false);
    });
  });

  /* ====== processATag 无 href 匹配 ====== */

  describe('processATag 无 href', () => {
    it('<a> 无 href 属性时不添加 url 到 htmlTag', () => {
      const parent = { type: 'paragraph' };
      const el = { value: '<a class="link">' };
      const r = handleHtml(el, parent, [], undefined);
      // processATag 无 href 匹配时返回原始 htmlTag，不添加任何条目
      expect(r.htmlTag).toHaveLength(0);
      expect(r.el).toBeNull();
    });
  });

  /* ====== processFontTag 无 color 匹配 ====== */

  describe('processFontTag 无 color', () => {
    it('<font> 无 color 属性时不添加 color 到 htmlTag', () => {
      const parent = { type: 'paragraph' };
      const el = { value: '<font size="3">' };
      const r = handleHtml(el, parent, [], undefined);
      // processFontTag 无 color 匹配时返回原始 htmlTag
      expect(r.htmlTag).toHaveLength(0);
      expect(r.el).toBeNull();
    });
  });

  /* ====== processSpanTag 无 style 匹配 ====== */

  describe('processSpanTag 无 style', () => {
    it('<span> 无 style 属性时不添加 color 到 htmlTag', () => {
      const parent = { type: 'paragraph' };
      const el = { value: '<span class="test">' };
      const r = handleHtml(el, parent, [], undefined);
      // processSpanTag 无 style 匹配时返回原始 htmlTag
      expect(r.htmlTag).toHaveLength(0);
      expect(r.el).toBeNull();
    });
  });

  /* ====== extractVideoSource source 标签回退 ====== */

  describe('extractVideoSource video source 回退', () => {
    it('video 标签无直接 src 时尝试从 source 标签获取', () => {
      const r = findImageElement('<video controls>');
      expect(r).not.toBeNull();
      expect(r?.tagName).toBe('video');
      expect(r?.url).toBeUndefined();
    });

    it('video 标签无直接 src 但有 poster 时仍走 source 回退', () => {
      const r = findImageElement('<video poster="thumb.jpg">');
      expect(r).not.toBeNull();
      expect(r?.tagName).toBe('video');
      expect(r?.poster).toBe('thumb.jpg');
      expect(r?.url).toBeUndefined();
    });
  });

  /* ====== 块级 media 元素 → createMediaNodeFromElement ====== */

  describe('handleBlockHtml 块级媒体元素', () => {
    it('块级 img 标签应通过 createMediaNodeFromElement 返回 media 节点', () => {
      const el = { value: '<img src="https://a.com/x.png" />' };
      const r = handleHtml(el, null, [], undefined);
      expect(r.el).toBeDefined();
      expect(r.el?.type).toBe('media');
      expect(r.el?.src).toBe('https://a.com/x.png');
    });

    it('块级 video 标签也应创建 media 节点', () => {
      const el = { value: '<video src="https://a.com/v.mp4"></video>' };
      const r = handleHtml(el, null, [], undefined);
      expect(r.el).toBeDefined();
      expect(r.el?.type).toBe('media');
    });
  });

  /* ====== processSpanTag 有 style 但无 color ====== */

  describe('processSpanTag 有 style 无 color', () => {
    it('<span style="font-size:12px"> 有 style 但无 color 时返回原始 htmlTag', () => {
      const parent = { type: 'paragraph' };
      const el = { value: '<span style="font-size:12px">' };
      const r = handleHtml(el, parent, [], undefined);
      // processSpanTag 有 style 但 stylesMap 没有 color 键，falls through 到 return htmlTag
      expect(r.htmlTag).toHaveLength(0);
      expect(r.el).toBeNull();
    });
  });

  /* ====== findThinkElement / findAnswerElement catch ====== */

  describe('findThinkElement 和 findAnswerElement 异常处理', () => {
    it('handleBlockHtml 中 value 为 undefined 时触发 catch 分支', () => {
      const el = { value: undefined as any };
      expect(() => handleHtml(el, null, [], undefined)).toThrow();
    });
  });
});
