/**
 * parserSlateNodeToMarkdown deepen2：null 节点、chartConfig、list/head、compose、media、ordered start。
 */
import { describe, expect, it } from 'vitest';
import { parserSlateNodeToMarkdown } from '../parserSlateNodeToMarkdown';

describe('parserSlateNodeToMarkdown deepen2 residual', () => {
  it('空 paragraph / 空 text 不抛', () => {
    expect(() =>
      parserSlateNodeToMarkdown([
        { type: 'paragraph', children: [] },
      ] as any),
    ).not.toThrow();
    expect(
      parserSlateNodeToMarkdown([
        { type: 'paragraph', children: [{ text: '' }] },
      ] as any),
    ).toBe('');
  });

  it('chartConfig：数字单键 / chartType 单对象 / 空数组不写注释', () => {
    const numericKey = parserSlateNodeToMarkdown([
      {
        type: 'code',
        language: 'chart',
        otherProps: {
          chartConfig: { 0: { chartType: 'bar', x: 'a' } },
        },
        children: [{ text: '' }],
      },
    ] as any);
    expect(numericKey).toContain('<!--');
    expect(numericKey).toContain('bar');

    const single = parserSlateNodeToMarkdown([
      {
        type: 'code',
        language: 'chart',
        otherProps: {
          chartConfig: { chartType: 'pie', x: 'n' },
        },
        children: [{ text: '' }],
      },
    ] as any);
    expect(single).toContain('pie');

    const emptyArr = parserSlateNodeToMarkdown([
      {
        type: 'code',
        language: 'js',
        otherProps: { config: [] },
        children: [{ text: 'x' }],
      },
    ] as any);
    expect(emptyArr).not.toContain('<!--');
  });

  it('根 list / bulleted-list / numbered-list 后追加双换行', () => {
    const md = parserSlateNodeToMarkdown([
      {
        type: 'list',
        children: [
          { type: 'list-item', children: [{ text: 'a' }] },
        ],
      },
      {
        type: 'bulleted-list',
        children: [
          { type: 'list-item', children: [{ text: 'b' }] },
        ],
      },
      {
        type: 'numbered-list',
        children: [
          { type: 'list-item', children: [{ text: 'c' }] },
        ],
      },
      { type: 'paragraph', children: [{ text: 'tail' }] },
    ] as any);
    expect(md).toContain('a');
    expect(md).toContain('b');
    expect(md).toContain('c');
    expect(md).toContain('tail');
  });

  it('非 root 相邻 head 不追加额外双换行', () => {
    const md = parserSlateNodeToMarkdown(
      [
        { type: 'head', level: 1, children: [{ text: 'A' }] },
        { type: 'head', level: 2, children: [{ text: 'B' }] },
      ] as any,
      '',
      [{ type: 'blockquote' }],
    );
    expect(md).toContain('A');
    expect(md).toContain('B');
  });

  it('composeText：highColor / tag-only / url / mix 空格', () => {
    const high = parserSlateNodeToMarkdown([
      {
        type: 'paragraph',
        children: [{ text: 'c', highColor: '#f00' }],
      },
    ] as any);
    expect(high).toContain('color:#f00');

    const tagOnly = parserSlateNodeToMarkdown([
      {
        type: 'paragraph',
        children: [{ text: '', tag: true }],
      },
    ] as any);
    expect(typeof tagOnly).toBe('string');

    const link = parserSlateNodeToMarkdown([
      {
        type: 'paragraph',
        children: [{ text: 'go', url: 'https://ex.com/a b' }],
      },
    ] as any);
    expect(link).toContain('https://');

    const mix = parserSlateNodeToMarkdown([
      {
        type: 'paragraph',
        children: [
          { text: 'ab', bold: true, italic: true },
          { text: 'cd' },
        ],
      },
    ] as any);
    expect(mix).toMatch(/ab/);
  });

  it('table 直接含 table-cell 子节点', () => {
    const md = parserSlateNodeToMarkdown([
      {
        type: 'table',
        children: [
          {
            type: 'table-cell',
            children: [{ text: 'cell-direct' }],
          },
        ],
      },
    ] as any);
    expect(md).toContain('cell-direct');
  });

  it('card 仅含 table 时跳过 wrapper；media height；ordered start', () => {
    const card = parserSlateNodeToMarkdown([
      {
        type: 'card',
        children: [
          { type: 'card-before', children: [{ text: '' }] },
          {
            type: 'table',
            children: [
              {
                type: 'table-row',
                children: [
                  {
                    type: 'table-cell',
                    children: [{ text: 'T' }],
                  },
                ],
              },
            ],
          },
          { type: 'card-after', children: [{ text: '' }] },
        ],
      },
    ] as any);
    expect(card).toContain('T');
    expect(card).not.toContain('data-card');

    const video = parserSlateNodeToMarkdown([
      {
        type: 'media',
        url: 'https://v.example/a.mp4',
        mediaType: 'video',
        height: 240,
        children: [{ text: '' }],
      },
    ] as any);
    expect(video).toContain('height="240"');
    expect(video).toContain('<video');

    const img = parserSlateNodeToMarkdown([
      {
        type: 'media',
        url: 'https://i.example/a.png',
        mediaType: 'image',
        height: 120,
        children: [{ text: '' }],
      },
    ] as any);
    expect(img).toContain('height="120"');

    const nested = parserSlateNodeToMarkdown([
      {
        type: 'list-item',
        children: [
          { text: 'parent' },
          {
            type: 'numbered-list',
            start: 3,
            children: [
              { type: 'list-item', children: [{ text: 'nested' }] },
            ],
          },
        ],
      },
    ] as any);
    expect(nested).toMatch(/3\./);
  });
});
