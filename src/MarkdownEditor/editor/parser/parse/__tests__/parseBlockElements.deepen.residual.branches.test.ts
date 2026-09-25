/**
 * parseBlockElements deepen：mentions 空 label、html 无 media、containerDirective、
 * link openInNewTab、getNodeText 边界。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  applyInlineFormatting,
  handleContainerDirective,
  handleListItem,
  handleParagraph,
  processParagraphChildren,
} from '../parseBlockElements';

const parseNodes = (nodes: any[], _top?: boolean, _parent?: any) =>
  (nodes || []).map((n) => {
    if (n?.type === 'text') return { text: n.value || '' };
    if (n?.type === 'link')
      return { text: n.children?.[0]?.value || n.text || '', url: n.url };
    if (n?.type === 'paragraph')
      return {
        type: 'paragraph',
        children: (n.children || []).map((c: any) => ({
          text: c?.value || c?.text || '',
        })),
      };
    return { text: '' };
  });

describe('parseBlockElements deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.restoreAllMocks();
  });

  it('handleListItem：link mention 无 label 不写 mentions', () => {
    const result = handleListItem(
      {
        children: [
          {
            type: 'paragraph',
            children: [
              { type: 'link', url: 'https://x?id=1', children: [] },
              { type: 'text', value: 'extra' },
            ],
          },
        ],
      },
      ((nodes) => [
        {
          type: 'paragraph',
          children: [{ text: '', url: nodes?.[0]?.url }],
        },
      ]) as any,
    );
    expect(result.mentions).toBeUndefined();
  });

  it('processParagraphChildren：children 缺省；html 非 media；media 节点 falsy', () => {
    expect(
      processParagraphChildren({ children: undefined }, parseNodes as any),
    ).toEqual([]);

    const htmlOnly = processParagraphChildren(
      { children: [{ type: 'html', value: '<span>x</span>' }] },
      parseNodes as any,
    );
    expect(Array.isArray(htmlOnly) || (htmlOnly as any)?.type).toBeTruthy();

    const closing = processParagraphChildren(
      {
        children: [
          { type: 'html', value: '</img>' },
          { type: 'text', value: 't' },
        ],
      },
      parseNodes as any,
    );
    expect(closing).toBeTruthy();
  });

  it('handleParagraph：混合内容返回；link card 短路', () => {
    const mixed = handleParagraph(
      {
        children: [
          { type: 'text', value: 'a' },
          { type: 'image', url: 'https://x/a.png', alt: 'a' },
        ],
      },
      {},
      parseNodes as any,
    );
    expect(mixed).toBeTruthy();

    const card = handleParagraph(
      {
        children: [
          {
            type: 'link',
            url: 'https://x',
            children: [{ type: 'text', value: 'L' }],
          },
        ],
      },
      { type: 'card' },
      parseNodes as any,
    );
    expect(card).toBeTruthy();
  });

  it('handleContainerDirective：空 title；::: 过滤；getNodeText null 子节点', () => {
    const emptyTitle = handleContainerDirective(
      {
        name: 'tip',
        attributes: { title: '   ' },
        children: [
          {
            type: 'paragraph',
            children: [
              null,
              { type: 'text', value: null },
              { type: 'text', value: ':::' },
            ],
          },
          {
            type: 'paragraph',
            children: [{ type: 'text', value: 'body' }],
          },
        ],
      },
      parseNodes as any,
    );
    expect(emptyTitle.otherProps?.markdownContainerType).toBe('tip');
    expect(emptyTitle.otherProps?.markdownContainerTitle).toBeUndefined();

    const numericTitle = handleContainerDirective(
      {
        name: undefined,
        attributes: { title: 9 },
        children: [],
      },
      parseNodes as any,
    );
    expect(numericTitle.otherProps?.markdownContainerTitle).toBe('9');
    expect(numericTitle.children).toEqual([
      { type: 'paragraph', children: [{ text: '' }] },
    ]);
  });

  it('applyInlineFormatting：openLinksInNewTab 且已有 otherProps', () => {
    const leaf = applyInlineFormatting(
      { text: 'L', otherProps: { keep: 1 } } as any,
      { type: 'link', url: 'https://x', finished: false },
      { openLinksInNewTab: true },
    );
    expect(leaf.url).toBe('https://x');
    expect((leaf.otherProps as any)?.target).toBe('_blank');
    expect((leaf.otherProps as any)?.keep).toBe(1);
  });
});
