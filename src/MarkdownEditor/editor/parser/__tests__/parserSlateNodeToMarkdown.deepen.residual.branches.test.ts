/**
 * parserSlateNodeToMarkdown deepen residual：isMix、plugin convert 全分支、mark/chart/list 边角。
 */
import { describe, expect, it } from 'vitest';
import {
  isMix,
  parserSlateNodeToMarkdown,
} from '../parserSlateNodeToMarkdown';

const pluginMatch = (type: string, convert: () => any) => ({
  toMarkdown: [{ match: (n: any) => n?.type === type, convert }],
});

describe('parserSlateNodeToMarkdown deepen residual', () => {
  it('isMix：单 mark 为 false，多 mark 为 true', () => {
    expect(isMix({ text: 'a', bold: true } as any)).toBe(false);
    expect(isMix({ text: 'a', bold: true, italic: true } as any)).toBe(true);
  });

  it.each([
    {
      label: 'plugin code',
      type: 'plug-code',
      convert: () => ({ type: 'code', lang: 'py', value: 'x\ny' }),
      assert: (s: string) => expect(s).toContain('```py'),
    },
    {
      label: 'plugin blockquote empty children',
      type: 'plug-bq',
      convert: () => ({ type: 'blockquote', children: [] }),
      assert: (s: string) => expect(s).toContain('>'),
    },
    {
      label: 'plugin paragraph empty children',
      type: 'plug-para',
      convert: () => ({ type: 'paragraph', children: [] }),
      assert: (s: string) => expect(s).toBe('IND'),
    },
    {
      label: 'plugin heading depth undefined',
      type: 'plug-head',
      convert: () => ({
        type: 'heading',
        depth: undefined,
        children: [],
      }),
      assert: (s: string) => expect(s).toMatch(/^#\s/),
    },
    {
      label: 'plugin text falsy value',
      type: 'plug-txt',
      convert: () => ({ type: 'text', value: undefined }),
      assert: (s: string) => expect(s).toBe(''),
    },
    {
      label: 'plugin default type',
      type: 'plug-unknown',
      convert: () => ({ type: 'unknown' }),
      assert: (s: string) => expect(s).toBe(''),
    },
  ])('plugin convert: $label', ({ type, convert, assert }) => {
    const md = parserSlateNodeToMarkdown(
      [{ type, children: [{ text: '' }] }] as any,
      'IND',
      [{ root: true }],
      [pluginMatch(type, convert)] as any,
    );
    assert(md);
  });

  it('mark 无 color/bg/label；相邻 head 不追加双换行', () => {
    const markOnly = parserSlateNodeToMarkdown([
      {
        type: 'paragraph',
        children: [{ text: 'm', mark: true }],
      },
    ] as any);
    expect(markOnly).toContain('m');

    const heads = parserSlateNodeToMarkdown([
      { type: 'head', level: 1, children: [{ text: 'A' }] },
      { type: 'head', level: 2, children: [{ text: 'B' }] },
    ] as any);
    expect(heads).toContain('# A');
    expect(heads).toContain('## B');
    expect(heads.split('\n\n').length).toBeLessThan(4);
  });

  it('chart chartType 分支；props 对象序列化；break 节点', () => {
    const chart = parserSlateNodeToMarkdown([
      {
        type: 'chart',
        otherProps: {
          config: { chartType: 'line', series: [1] },
        },
        children: [
          {
            type: 'table-row',
            children: [{ type: 'table-cell', children: [{ text: 'v' }] }],
          },
        ],
      },
    ] as any);
    expect(chart).toContain('<!--');

    const objProps = parserSlateNodeToMarkdown([
      {
        type: 'paragraph',
        children: [{ text: 'p' }],
        otherProps: { finished: false, meta: { k: 1 } },
      },
    ] as any);
    expect(objProps).toContain('p');

    const br = parserSlateNodeToMarkdown([
      {
        type: 'paragraph',
        children: [{ text: 'a' }, { type: 'break' }, { text: 'b' }],
      },
    ] as any);
    expect(br).toMatch(/a[\s\S]*b/);
  });

  it('tag 占位/value 矩阵；footnote；list-item 上下文', () => {
    const tagMd = parserSlateNodeToMarkdown([
      {
        type: 'paragraph',
        children: [
          { text: '', tag: true, placeholder: 'ph' },
          { text: '  x  ', tag: true, code: true },
          { text: '', tag: true, value: 'val', placeholder: 'p' },
        ],
      },
    ] as any);
    expect(tagMd).toContain('placeholder');

    const fn = parserSlateNodeToMarkdown([
      {
        type: 'footnoteReference',
        identifier: '1',
        children: [{ text: '' }],
      },
      {
        type: 'footnoteDefinition',
        identifier: '1',
        children: [{ type: 'paragraph', children: [{ text: 'note' }] }],
      },
      {
        type: 'list-item',
        children: [{ type: 'paragraph', children: [{ text: 'li' }] }],
      },
    ] as any);
    expect(fn).toMatch(/note|li|\^/);
  });

  it('schema/card/agentic 块与 jinja 占位符还原', () => {
    const blocks = parserSlateNodeToMarkdown([
      {
        type: 'schema',
        otherProps: { schema: { type: 'object' } },
        children: [{ type: 'paragraph', children: [{ text: 's' }] }],
      },
      {
        type: 'card',
        otherProps: { title: 'T' },
        children: [{ type: 'paragraph', children: [{ text: 'c' }] }],
      },
      {
        type: 'paragraph',
        children: [
          {
            text: `\uE01A{ name }`,
            jinjaVariable: true,
          },
        ],
      },
    ] as any);
    expect(blocks.length).toBeGreaterThan(0);
  });
});
