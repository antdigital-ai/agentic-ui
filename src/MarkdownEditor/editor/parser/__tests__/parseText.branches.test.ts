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

describe('parseText 分支覆盖', () => {
  it('textDirective 空 children 且 leaf 有 mark 时生成空文本节点', () => {
    const leaf = { data: {}, mark: true } as any;
    const result = parseText(
      [{ type: 'textDirective', children: [] } as any],
      leaf,
    );
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ mark: true, text: '' });
  });

  it('leafDirective 解析 children 文本', () => {
    const result = parseText([
      {
        type: 'leafDirective',
        children: [{ type: 'text', value: 'directive' }],
      } as any,
    ]);
    expect(result[0].text).toBe('directive');
  });

  it('inlineMath 非字符串 value 时使用空字符串', () => {
    const result = parseText([{ type: 'inlineMath', value: 42 } as any]);
    expect(result[0].text).toBe('$$');
  });

  it('applyHtmlTagsToElement mark 带 markColor/markBg/markLabel', () => {
    const result = applyHtmlTagsToElement(
      { text: 'hi' },
      [{ tag: 'mark', markColor: 'red', markBg: 'yellow', markLabel: '@' }],
    );
    expect(result).toMatchObject({
      text: 'hi',
      mark: true,
      markColor: 'red',
      markBg: 'yellow',
      markLabel: '@',
    });
  });

  it('applyHtmlTagsToElement a 无 url 时不设置 url', () => {
    const result = applyHtmlTagsToElement({ text: 'x' }, [{ tag: 'a' }]);
    expect(result.url).toBeUndefined();
  });

  it('applyHtmlTagsToElement font 带 color 与 span color 叠加 highColor', () => {
    const result = applyHtmlTagsToElement(
      { text: 'x' },
      [
        { tag: 'font', color: '#111' },
        { tag: 'span', color: '#222' },
      ],
    );
    expect(result.color).toBe('#111');
    expect(result.highColor).toBe('#222');
  });

  it('handleTextAndInlineElementsPure text 空 value 时不应用 htmlTag', () => {
    const result = handleTextAndInlineElementsPure(
      { type: 'text', value: '' },
      [{ tag: 'b' }],
      (leaf) => leaf,
      vi.fn(),
    );
    expect(result).toEqual({ text: '' });
    expect(result.bold).toBeUndefined();
  });

  it('handleTextAndInlineElementsPure emphasis 走 parseText 分支', () => {
    const result = handleTextAndInlineElementsPure(
      {
        type: 'emphasis',
        children: [{ type: 'text', value: 'em' }],
      },
      [],
      (leaf, el) => ({
        ...leaf,
        ...(el.type === 'emphasis' ? { italic: true } : {}),
      }),
      vi.fn(),
    );
    expect(Array.isArray(result)).toBe(true);
    expect(result[0]).toMatchObject({ italic: true, text: 'em' });
  });

  it('handleTextAndInlineElementsPure delete 走 parseText 分支', () => {
    const result = handleTextAndInlineElementsPure(
      {
        type: 'delete',
        children: [{ type: 'text', value: 'del' }],
      },
      [],
      (leaf, el) => ({
        ...leaf,
        ...(el.type === 'delete' ? { strikethrough: true } : {}),
      }),
      vi.fn(),
    );
    expect(result[0]).toMatchObject({ strikethrough: true, text: 'del' });
  });

  it('handleTextAndInlineElementsPure textDirective 递归 parseNodesFn', () => {
    const parseNodesFn = vi.fn(() => [{ text: 'from-directive' }]);
    const result = handleTextAndInlineElementsPure(
      {
        type: 'textDirective',
        children: [{ type: 'text', value: 'x' }],
      },
      [],
      (leaf) => leaf,
      parseNodesFn,
    );
    expect(parseNodesFn).toHaveBeenCalled();
    expect(result).toEqual({ text: 'from-directive' });
  });

  it('handleTextAndInlineElementsPure textDirective 空 children 返回空文本', () => {
    const parseNodesFn = vi.fn(() => []);
    const result = handleTextAndInlineElementsPure(
      { type: 'leafDirective', children: [] },
      [],
      (leaf) => leaf,
      parseNodesFn,
    );
    expect(result).toEqual({ text: '' });
  });

  it('parseText strong 嵌套 text 正常 concat', () => {
    const result = parseText([
      {
        type: 'strong',
        children: [{ type: 'text', value: 'bold' }],
      } as any,
    ]);
    expect(result[0]).toMatchObject({ bold: true, text: 'bold' });
  });

  it('parseText link 无 url 递归 children 保留 leaf 格式', () => {
    const leaf = { data: {}, bold: true } as any;
    const result = parseText(
      [
        {
          type: 'link',
          url: undefined,
          children: [{ type: 'text', value: 'text' }],
        } as any,
      ],
      leaf,
    );
    expect(result[0]).toMatchObject({ bold: true, text: 'text' });
  });

  it('handleTextAndInlineElementsPure footnoteReference finished=false', () => {
    const result = handleTextAndInlineElementsPure(
      { type: 'footnoteReference', identifier: '1', finished: false },
      [],
      (leaf) => leaf,
      vi.fn(),
    );
    expect(result.otherProps?.finished).toBe(false);
    expect(result.fnc).toBe(true);
  });

  it('setFinishedProp 非 false 原样返回', () => {
    const leaf = { text: 'a', bold: true };
    expect(setFinishedProp(leaf, true)).toBe(leaf);
    expect(setFinishedProp(leaf, undefined)).toBe(leaf);
  });

  it('strong/emphasis/delete 空 children 保留格式空文本', () => {
    expect(
      parseText([{ type: 'strong', children: [] } as any], { bold: true } as any),
    ).toEqual([expect.objectContaining({ bold: true, text: '' })]);
    expect(
      parseText([{ type: 'emphasis', children: [] } as any], {
        italic: true,
      } as any),
    ).toEqual([expect.objectContaining({ italic: true, text: '' })]);
    expect(
      parseText([{ type: 'delete', children: [] } as any], {
        strikethrough: true,
      } as any),
    ).toEqual([expect.objectContaining({ strikethrough: true, text: '' })]);
  });

  it('link 有 url 空 children 保留 url 空文本', () => {
    const result = parseText([
      { type: 'link', url: 'https://x.com', children: [] } as any,
    ]);
    expect(result[0]).toMatchObject({ url: 'https://x.com', text: '' });
  });

  it('applyHtmlTagsToElement 多种 html tag', () => {
    expect(
      applyHtmlTagsToElement({ text: 't' }, [
        { tag: 'b' },
        { tag: 'i' },
        { tag: 'code' },
        { tag: 'del' },
        { tag: 'sup' },
        { tag: 'a', url: 'https://a.com' },
        { tag: 'span', color: '#f00' },
      ]),
    ).toMatchObject({
      bold: true,
      italic: true,
      code: true,
      strikethrough: true,
      identifier: 't',
      url: 'https://a.com',
      highColor: '#f00',
    });
  });

  it('applyHtmlTagsToElement 空 htmlTag 原样返回', () => {
    const el = { text: 'x' };
    expect(applyHtmlTagsToElement(el, [])).toEqual(el);
  });

  it('handleTextAndInlineElementsPure text/break/inlineCode', () => {
    expect(
      handleTextAndInlineElementsPure(
        { type: 'text', value: 'hi' },
        [],
        (l) => l,
        vi.fn(),
      ),
    ).toMatchObject({ text: 'hi' });
    expect(
      handleTextAndInlineElementsPure(
        { type: 'break' },
        [],
        (l) => l,
        vi.fn(),
      ),
    ).toMatchObject({ text: '\n' });
    expect(
      handleTextAndInlineElementsPure(
        { type: 'inlineCode', value: 'c', finished: false },
        [],
        (l) => l,
        vi.fn(),
      ),
    ).toMatchObject({ code: true });
  });
});
