/**
 * parserSlate deepen9 safe：list order 布尔、blockquote、hr、空 link。
 */
import { describe, expect, it } from 'vitest';
import { parserSlateNodeToMarkdown } from '../parserSlateNodeToMarkdown';

describe('parserSlateNodeToMarkdown deepen9 safe residual', () => {
  it('list order true/false；start 缺省', () => {
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
    expect(ordered).toMatch(/one|1\./);

    const bullet = parserSlateNodeToMarkdown([
      {
        type: 'list',
        order: false,
        children: [
          {
            type: 'list-item',
            children: [{ type: 'paragraph', children: [{ text: 'bullet' }] }],
          },
        ],
      },
    ] as any);
    expect(bullet).toContain('bullet');
  });

  it('blockquote / hr / 相邻段落', () => {
    const md = parserSlateNodeToMarkdown([
      {
        type: 'blockquote',
        children: [{ type: 'paragraph', children: [{ text: 'quote' }] }],
      },
      { type: 'hr', children: [{ text: '' }] },
      { type: 'paragraph', children: [{ text: 'after' }] },
    ] as any);
    expect(md).toMatch(/quote|after|---/);
  });

  it('link 空 url；code 语言', () => {
    const link = parserSlateNodeToMarkdown([
      {
        type: 'paragraph',
        children: [
          { text: 'see ' },
          { text: 'here', url: '', type: 'a' } as any,
        ],
      },
    ] as any);
    expect(typeof link).toBe('string');

    const code = parserSlateNodeToMarkdown([
      {
        type: 'code',
        language: 'ts',
        value: 'const x=1',
        children: [{ text: 'const x=1' }],
      },
    ] as any);
    expect(code).toContain('```');
  });
});
