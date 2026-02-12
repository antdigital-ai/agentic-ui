/**
 * parseText 及相关函数单元测试
 * 覆盖 parseText.ts 中 setFinishedProp、parseText、applyHtmlTagsToElement、handleTextAndInlineElementsPure
 */

import { describe, expect, it, vi } from 'vitest';
import {
  applyHtmlTagsToElement,
  handleTextAndInlineElementsPure,
  parseText,
  setFinishedProp,
} from '../parse/parseText';

vi.mock('../parse/parseElements', () => ({
  handleInlineCode: vi.fn((n: any) => ({ code: true, text: n?.value ?? '' })),
}));

vi.mock('../parse/parseMath', () => ({
  shouldTreatInlineMathAsText: vi.fn((value: string) => {
    if (!value?.trim()) return true;
    if (/[=^_\\{}]/.test(value)) return false;
    return (
      /^[+-]?\d{1,3}(?:,\d{3})*(?:\.\d+)?(?:%|[kKmMbB]|千|万|亿|兆|万亿|百万|亿万)?$/.test(
        value,
      ) ||
      /^[+-]?\d+(?:\.\d+)?(?:%|[kKmMbB]|千|万|亿|兆|万亿|百万|亿万)?$/.test(
        value,
      )
    );
  }),
}));

describe('parseText', () => {
  describe('setFinishedProp', () => {
    it('finished 不为 false 时返回原 leaf', () => {
      const leaf = { data: {}, text: 'x' } as any;
      expect(setFinishedProp(leaf, true)).toBe(leaf);
      expect(setFinishedProp(leaf, undefined)).toBe(leaf);
    });

    it('finished 为 false 时返回带 otherProps.finished 的新 leaf', () => {
      const leaf = { data: {}, text: 'x', otherProps: { a: 1 } } as any;
      const result = setFinishedProp(leaf, false);
      expect(result).not.toBe(leaf);
      expect(result.otherProps).toEqual({ a: 1, finished: false });
      expect(result.text).toBe('x');
    });
  });

  describe('parseText', () => {
    it('strong 空子节点且 leaf 有格式时生成空文本节点以保留格式', () => {
      const leaf = { data: {}, bold: true } as any;
      const result = parseText([{ type: 'strong', children: [] } as any], leaf);
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({ bold: true, text: '' });
    });

    it('strong 带 finished: false 时应用 setFinishedProp', () => {
      const leaf = { data: {} } as any;
      const result = parseText(
        [{ type: 'strong', children: [], finished: false } as any],
        leaf,
      );
      expect(result[0].otherProps?.finished).toBe(false);
    });

    it('emphasis 空子节点且 leaf 有格式时生成空文本节点', () => {
      const leaf = { data: {}, italic: true } as any;
      const result = parseText(
        [{ type: 'emphasis', children: [] } as any],
        leaf,
      );
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({ italic: true, text: '' });
    });

    it('delete 空子节点且 leaf 有格式时生成空文本节点', () => {
      const leaf = { data: {}, strikethrough: true } as any;
      const result = parseText([{ type: 'delete', children: [] } as any], leaf);
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({ strikethrough: true, text: '' });
    });

    it('link 有 url 且空子节点且 leaf 有格式时生成空文本节点', () => {
      const leaf = { data: {} } as any;
      const result = parseText(
        [{ type: 'link', url: 'https://a.com', children: [] } as any],
        leaf,
      );
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({ url: 'https://a.com', text: '' });
    });

    it('link 无 url 时按普通文本处理子节点', () => {
      const leaf = { data: {} } as any;
      const result = parseText(
        [
          {
            type: 'link',
            url: '',
            children: [{ type: 'text', value: 'link text' } as any],
          } as any,
        ],
        leaf,
      );
      expect(result).toHaveLength(1);
      expect(result[0].text).toBe('link text');
    });

    it('inlineCode 时调用 handleInlineCode 并合并结果', () => {
      const result = parseText([{ type: 'inlineCode', value: 'code' } as any]);
      expect(result[0].code).toBe(true);
      expect(result[0].text).toBe('code');
    });

    it('inlineMath 当 shouldTreatInlineMathAsText 为 false 时生成 inline-katex', () => {
      const result = parseText([{ type: 'inlineMath', value: 'x^2' } as any]);
      expect(result[0].type).toBe('inline-katex');
      expect(result[0].children).toEqual([{ text: 'x^2' }]);
    });

    it('inlineMath 当 shouldTreatInlineMathAsText 为 true 时生成文本', () => {
      const result = parseText([{ type: 'inlineMath', value: '1' } as any]);
      expect(result[0].text).toBe('$1$');
    });

    it('text 节点走默认 value 分支', () => {
      const result = parseText([{ type: 'text', value: 'hello' } as any]);
      expect(result).toHaveLength(1);
      expect(result[0].text).toBe('hello');
    });
  });

  describe('applyHtmlTagsToElement', () => {
    it('htmlTag 为空时返回原元素', () => {
      const el = { text: 'x' };
      expect(applyHtmlTagsToElement(el, [])).toBe(el);
    });

    it('应用 font、sup、sub、code、i、b、del、span color、a url', () => {
      const el = { text: 'content' };
      const htmlTag = [
        { tag: 'font', color: '#f00' },
        { tag: 'sup' },
        { tag: 'code' },
        { tag: 'i' },
        { tag: 'b' },
        { tag: 'del' },
        { tag: 'span', color: '#0f0' },
        { tag: 'a', url: 'https://x.com' },
      ];
      const result = applyHtmlTagsToElement(el, htmlTag);
      expect(result.color).toBe('#f00');
      expect(result.identifier).toBe('content');
      expect(result.code).toBe(true);
      expect(result.italic).toBe(true);
      expect(result.bold).toBe(true);
      expect(result.strikethrough).toBe(true);
      expect(result.highColor).toBe('#0f0');
      expect(result.url).toBe('https://x.com');
    });

    it('tag 为 sub 时设置 identifier', () => {
      const el = { text: 'sub' };
      const result = applyHtmlTagsToElement(el, [{ tag: 'sub' }]);
      expect(result.identifier).toBe('sub');
    });

    it('tag 为 strong 时设置 bold', () => {
      const result = applyHtmlTagsToElement({ text: 'x' }, [{ tag: 'strong' }]);
      expect(result.bold).toBe(true);
    });
  });

  describe('handleTextAndInlineElementsPure', () => {
    const identityFormat = (leaf: any, el: any) => {
      void el;
      return leaf;
    };
    const inlineFormatWithProps = (leaf: any, el: any) => ({
      ...leaf,
      ...(el.type === 'strong' ? { bold: true } : {}),
      ...(el.type === 'link' && el.url ? { url: el.url } : {}),
    });
    const parseNodesFn = vi.fn((children: any[]) =>
      children.length ? [{ text: (children[0] as any)?.value ?? '' }] : [],
    );

    it('elementType 为 text 且有 htmlTag 和 value 时应用 applyHtmlTagsToElement', () => {
      const result = handleTextAndInlineElementsPure(
        { type: 'text', value: 'hi' },
        [{ tag: 'b' }],
        identityFormat,
        parseNodesFn,
      );
      expect(result.text).toBe('hi');
      expect(result.bold).toBe(true);
    });

    it('elementType 为 text 且无 htmlTag 时返回纯文本', () => {
      const result = handleTextAndInlineElementsPure(
        { type: 'text', value: 'hi' },
        [],
        identityFormat,
        parseNodesFn,
      );
      expect(result).toEqual({ text: 'hi' });
    });

    it('elementType 为 break 时返回换行', () => {
      const result = handleTextAndInlineElementsPure(
        { type: 'break' },
        [],
        identityFormat,
        parseNodesFn,
      );
      expect(result).toEqual({ text: '\n' });
    });

    it('elementType 为 inlineCode 时走 inlineCode 分支', () => {
      const result = handleTextAndInlineElementsPure(
        { type: 'inlineCode', value: 'code' },
        [],
        identityFormat,
        parseNodesFn,
      );
      expect(result.code).toBe(true);
      expect(result.text).toBe('code');
    });

    it('elementType 为 inlineCode 且 finished 为 false 时保留 otherProps.finished', () => {
      const result = handleTextAndInlineElementsPure(
        { type: 'inlineCode', value: 'x', finished: false },
        [],
        identityFormat,
        parseNodesFn,
      );
      expect(result.otherProps?.finished).toBe(false);
    });

    it('elementType 为 strong 且无 html 子节点时调用 parseText', () => {
      const result = handleTextAndInlineElementsPure(
        {
          type: 'strong',
          children: [{ type: 'text', value: 'bold' }],
        },
        [],
        inlineFormatWithProps,
        parseNodesFn,
      );
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(1);
      expect(result[0].text).toBe('bold');
      expect(result[0].bold).toBe(true);
    });

    it('elementType 为 strong 且 children 为空时用空 value 调用 parseText', () => {
      const result = handleTextAndInlineElementsPure(
        { type: 'strong', children: [] } as any,
        [],
        identityFormat,
        parseNodesFn,
      );
      expect(Array.isArray(result)).toBe(true);
      expect(result[0]?.text).toBe('');
    });

    it('elementType 为 link 且有 html 子节点时走 parseNodesFn 并合并 url', () => {
      parseNodesFn.mockReturnValueOnce([{ text: 'from-html' }]);
      const result = handleTextAndInlineElementsPure(
        {
          type: 'link',
          url: 'https://link.com',
          children: [{ type: 'html', value: '<b>x</b>' }],
        } as any,
        [],
        inlineFormatWithProps,
        parseNodesFn,
      );
      expect(parseNodesFn).toHaveBeenCalled();
      expect(result.url).toBe('https://link.com');
      expect(result.text).toBe('from-html');
    });

    it('未知 elementType 时返回空文本', () => {
      const result = handleTextAndInlineElementsPure(
        { type: 'unknown' },
        [],
        identityFormat,
        parseNodesFn,
      );
      expect(result).toEqual({ text: '' });
    });
  });
});
