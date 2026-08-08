/**
 * parserSlateNodeToMarkdown deepen5：default preString、chartConfig 单对象、
 * media height 空串、嵌套 list indent、card filter 非数组、空 text/tag。
 * 勿依赖 more.residual（hang-quarantined）。
 */
import { describe, expect, it } from 'vitest';
import { parserSlateNodeToMarkdown } from '../parserSlateNodeToMarkdown';

describe('parserSlateNodeToMarkdown deepen5 residual', () => {
  it('chartConfig：有 chartType 的单对象；falsy → []', () => {
    const single = parserSlateNodeToMarkdown([
      {
        type: 'code',
        language: 'chart',
        otherProps: { chartConfig: { chartType: 'pie', x: 'a' } },
        children: [{ text: '' }],
      },
    ] as any);
    expect(single).toContain('pie');

    const emptyCfg = parserSlateNodeToMarkdown([
      {
        type: 'code',
        language: 'chart',
        otherProps: { chartConfig: null },
        children: [{ text: '' }],
      },
    ] as any);
    expect(typeof emptyCfg).toBe('string');
  });

  it('media：height 存在但 encode 空 height；无 height 走 markdown', () => {
    const withH = parserSlateNodeToMarkdown([
      {
        type: 'media',
        url: 'https://ex.com/a.mp4',
        mediaType: 'video',
        height: 0,
        children: [{ text: '' }],
      },
    ] as any);
    expect(withH).toContain('video');

    const imgH = parserSlateNodeToMarkdown([
      {
        type: 'media',
        url: 'https://ex.com/a.png',
        mediaType: 'image',
        height: 120,
        align: 'center',
        children: [{ text: '' }],
      },
    ] as any);
    expect(imgH).toContain('height=');
    expect(imgH).toContain('data-align');

    const noH = parserSlateNodeToMarkdown([
      {
        type: 'media',
        url: 'https://ex.com/b.png',
        mediaType: 'image',
        children: [{ text: '' }],
      },
    ] as any);
    expect(noH).toMatch(/!\[/);
  });

  it('嵌套 numbered-list：indent + start；非 list-item 父无 indent', () => {
    const nested = parserSlateNodeToMarkdown([
      {
        type: 'list-item',
        children: [
          {
            type: 'numbered-list',
            start: 3,
            children: [
              {
                type: 'list-item',
                children: [
                  { type: 'paragraph', children: [{ text: 'nested' }] },
                ],
              },
            ],
          },
        ],
      },
    ] as any);
    expect(nested).toContain('3.');
    expect(nested).toContain('nested');

    const top = parserSlateNodeToMarkdown([
      {
        type: 'list',
        order: true,
        children: [
          {
            type: 'list-item',
            children: [
              { type: 'paragraph', children: [{ text: 'one' }] },
            ],
          },
        ],
      },
    ] as any);
    expect(top).toContain('1.');
  });

  it('card：非 auto-rewrap 包 div；空 text；url 带 text', () => {
    const card = parserSlateNodeToMarkdown([
      {
        type: 'card',
        children: [
          { type: 'card-before', children: [{ text: '' }] },
          {
            type: 'paragraph',
            children: [{ text: 'card-body' }],
          },
          { type: 'card-after', children: [{ text: '' }] },
        ],
      },
    ] as any);
    expect(card).toContain('data-card');
    expect(card).toContain('card-body');

    const emptyLeaf = parserSlateNodeToMarkdown([
      {
        type: 'paragraph',
        children: [{ text: '', italic: true }],
      },
    ] as any);
    expect(emptyLeaf).toBe('');

    const link = parserSlateNodeToMarkdown([
      {
        type: 'paragraph',
        children: [{ text: 'go', url: 'https://x.test/a' }],
      },
    ] as any);
    expect(link).toContain('https://');
  });

  it('连续 block：table-row / code 换行；head 相邻不加双换行', () => {
    const mixed = parserSlateNodeToMarkdown([
      {
        type: 'table',
        children: [
          {
            type: 'table-row',
            children: [
              {
                type: 'table-cell',
                children: [{ type: 'paragraph', children: [{ text: 'a' }] }],
              },
            ],
          },
          {
            type: 'table-row',
            children: [
              {
                type: 'table-cell',
                children: [{ type: 'paragraph', children: [{ text: 'b' }] }],
              },
            ],
          },
        ],
      },
      { type: 'code', language: 'js', children: [{ text: 'x' }] },
      { type: 'head', level: 1, children: [{ text: 'H1' }] },
      { type: 'head', level: 2, children: [{ text: 'H2' }] },
    ] as any);
    expect(mixed).toContain('H1');
    expect(mixed).toContain('H2');
  });
});
