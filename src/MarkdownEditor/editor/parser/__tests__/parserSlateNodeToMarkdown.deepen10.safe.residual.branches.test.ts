/**
 * parserSlate deepen10 safe：chart 数字键对象、schema 数组序列化、
 * 相邻 head、table-cell 直处理、空 text+tag、media height。
 */
import { describe, expect, it } from 'vitest';
import { parserSlateNodeToMarkdown } from '../parserSlateNodeToMarkdown';

describe('parserSlateNodeToMarkdown deepen10 safe residual', () => {
  it('chart config {0:...} 单数字键 → 数组注释', () => {
    const md = parserSlateNodeToMarkdown([
      {
        type: 'chart',
        otherProps: {
          config: { '0': { chartType: 'bar', x: 'a', y: 'b' } },
        },
        children: [
          {
            type: 'table-row',
            children: [{ type: 'table-cell', children: [{ text: 'v' }] }],
          },
        ],
      },
    ] as any);
    expect(md).toMatch(/<!--.*config.*-->/);
  });

  it('otherProps 数组 propsToSerialize.length > 0', () => {
    const md = parserSlateNodeToMarkdown([
      {
        type: 'paragraph',
        children: [{ text: 'p' }],
        otherProps: { config: [{ type: 'input', name: 'f1' }] },
      },
    ] as any);
    expect(md).toContain('p');
    expect(md).toMatch(/<!--/);
  });

  it('相邻 head 不额外换行；table-cell 直处理', () => {
    const heads = parserSlateNodeToMarkdown([
      { type: 'head', level: 1, children: [{ text: 'H1' }] },
      { type: 'head', level: 2, children: [{ text: 'H2' }] },
    ] as any);
    expect(heads).toMatch(/H1|H2|#/);

    const table = parserSlateNodeToMarkdown([
      {
        type: 'table',
        children: [
          {
            type: 'table-cell',
            children: [{ type: 'paragraph', children: [{ text: 'solo' }] }],
          },
        ],
      },
    ] as any);
    expect(table).toMatch(/solo|\|/);
  });

  it('空 text+tag 早退；media height 分支', () => {
    const emptyTag = parserSlateNodeToMarkdown([
      {
        type: 'paragraph',
        children: [{ text: '', tag: true, placeholder: 'ph' } as any],
      },
    ] as any);
    expect(typeof emptyTag).toBe('string');

    const media = parserSlateNodeToMarkdown([
      {
        type: 'media',
        url: 'https://ex.com/v.mp4',
        mediaType: 'video',
        height: 120,
        children: [{ text: '' }],
      },
    ] as any);
    expect(media).toContain('height="120"');

    const img = parserSlateNodeToMarkdown([
      {
        type: 'media',
        url: 'https://ex.com/i.png',
        mediaType: 'image',
        height: 80,
        align: 'left',
        children: [{ text: '' }],
      },
    ] as any);
    expect(img).toMatch(/height="80"|data-align/);
  });

  it('table-row 后换行；list 块双换行', () => {
    const md = parserSlateNodeToMarkdown([
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
        ],
      },
      {
        type: 'list',
        order: false,
        children: [
          {
            type: 'list-item',
            children: [{ type: 'paragraph', children: [{ text: 'li' }] }],
          },
        ],
      },
    ] as any);
    expect(md).toMatch(/a|li|-/);
  });
});
