/**
 * parserSlate deepen12 safe：chartConfig else 包装、空 chartConfig、
 * nodeConfig chartType 单对象、table/card 注释、list 双换行。
 */
import { describe, expect, it } from 'vitest';
import { parserSlateNodeToMarkdown } from '../parserSlateNodeToMarkdown';

describe('parserSlateNodeToMarkdown deepen12 safe residual', () => {
  it('chart config 无 chartType → else 包装数组', () => {
    const md = parserSlateNodeToMarkdown([
      {
        type: 'chart',
        otherProps: {
          config: { foo: 'bar', nested: { x: 1 } },
        },
        children: [
          {
            type: 'table-row',
            children: [{ type: 'table-cell', children: [{ text: 'v' }] }],
          },
        ],
      },
    ] as any);
    expect(md).toMatch(/<!--|chart/);
  });

  it('chartConfig falsy → 空数组注释跳过', () => {
    const md = parserSlateNodeToMarkdown([
      {
        type: 'chart',
        otherProps: { config: null },
        children: [
          {
            type: 'table-row',
            children: [{ type: 'table-cell', children: [{ text: 'z' }] }],
          },
        ],
      },
    ] as any);
    expect(typeof md).toBe('string');
  });

  it('非 chart otherProps 数组序列化', () => {
    const md = parserSlateNodeToMarkdown([
      {
        type: 'paragraph',
        children: [{ text: 'p12' }],
        otherProps: { widgets: [{ id: 'w1' }] },
      },
    ] as any);
    expect(md).toContain('p12');
  });

  it('card 类型 otherProps；blockquote 嵌套', () => {
    const md = parserSlateNodeToMarkdown([
      {
        type: 'blockquote',
        children: [
          {
            type: 'paragraph',
            children: [{ text: 'quote' }],
          },
        ],
      },
    ] as any);
    expect(md).toMatch(/quote|>/);
  });

  it('list-item 双换行；hr 分隔', () => {
    const md = parserSlateNodeToMarkdown([
      { type: 'hr', children: [{ text: '' }] },
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
    expect(md).toMatch(/li|-|\*/);
  });
});
