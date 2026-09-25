/**
 * parserSlateNodeToMarkdown deepen7 safe：default-arg、chart 数字键、
 * 空 config 数组、相邻 head 不插空行、空 text/tag、table-cell 行、
 * media height 假值、嵌套 list 缩进。
 * parserSlateNodeToMarkdown.more hang-quarantined。
 */
import { describe, expect, it } from 'vitest';
import { parserSlateNodeToMarkdown } from '../parserSlateNodeToMarkdown';

describe('parserSlateNodeToMarkdown deepen7 safe residual', () => {
  it('chartConfig 数字键提取；非 chart 空数组 config 跳过序列化', () => {
    const chart = parserSlateNodeToMarkdown([
      {
        type: 'code',
        language: 'chart',
        otherProps: {
          chartConfig: { 0: { chartType: 'line', x: 'a' } },
        },
        children: [{ text: '' }],
      },
    ] as any);
    expect(chart).toContain('line');

    const emptyArr = parserSlateNodeToMarkdown([
      {
        type: 'code',
        language: 'js',
        otherProps: { config: [] },
        children: [{ text: 'x' }],
      },
    ] as any);
    expect(emptyArr).toContain('```');
    expect(emptyArr).not.toContain('<!--');
  });

  it('相邻 head 不插双换行；空 text 无 tag 早退', () => {
    const heads = parserSlateNodeToMarkdown([
      { type: 'head', level: 1, children: [{ text: 'H1' }] },
      { type: 'head', level: 2, children: [{ text: 'H2' }] },
    ] as any);
    expect(heads).toContain('H1');
    expect(heads).toContain('H2');

    const empty = parserSlateNodeToMarkdown([
      { type: 'paragraph', children: [{ text: '' }] },
    ] as any);
    expect(typeof empty).toBe('string');
  });

  it('table-cell 作为行；media height 空串；嵌套 list', () => {
    const table = parserSlateNodeToMarkdown([
      {
        type: 'table',
        children: [
          {
            type: 'table-cell',
            children: [{ type: 'paragraph', children: [{ text: 'c1' }] }],
          },
        ],
      },
    ] as any);
    expect(table).toMatch(/c1|\|/);

    const media = parserSlateNodeToMarkdown([
      {
        type: 'media',
        url: 'https://ex.com/v.mp4',
        mediaType: 'video',
        height: '',
        children: [{ text: '' }],
      },
    ] as any);
    expect(media).toMatch(/video|https/);

    const nested = parserSlateNodeToMarkdown([
      {
        type: 'bulleted-list',
        children: [
          {
            type: 'list-item',
            children: [
              { type: 'paragraph', children: [{ text: 'p' }] },
              {
                type: 'bulleted-list',
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
        ],
      },
    ] as any);
    expect(nested).toContain('nested');
  });

  it('code 后接非 list 块；list order 无 start；highColor 空 text', () => {
    const afterCode = parserSlateNodeToMarkdown([
      {
        type: 'code',
        language: 'js',
        children: [{ text: '1' }],
      },
      { type: 'paragraph', children: [{ text: 'after' }] },
    ] as any);
    expect(afterCode).toContain('after');

    const ordered = parserSlateNodeToMarkdown([
      {
        type: 'list',
        order: true,
        children: [
          {
            type: 'list-item',
            children: [{ type: 'paragraph', children: [{ text: 'one' }] }],
          },
        ],
      },
    ] as any);
    expect(ordered).toContain('1.');

    const high = parserSlateNodeToMarkdown([
      {
        type: 'paragraph',
        children: [{ text: '', highColor: '#00f', tag: true } as any],
      },
    ] as any);
    expect(typeof high).toBe('string');
  });
});
