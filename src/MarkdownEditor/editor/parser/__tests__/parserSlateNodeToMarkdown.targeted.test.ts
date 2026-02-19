import { describe, expect, it, vi } from 'vitest';
import { parserSlateNodeToMarkdown } from '../parserSlateNodeToMarkdown';

describe('parserSlateNodeToMarkdown targeted coverage', () => {
  it('覆盖 numeric key 排序与数组 config 序列化分支（408,475,491,492）', () => {
    const node = {
      type: 'paragraph',
      children: [{ text: 'P' }],
      otherProps: {
        '10': { v: 10 },
        '2': { v: 2 },
      },
    } as any;
    const result = parserSlateNodeToMarkdown([node]);
    expect(result).toContain('<!--');
    expect(result).toContain('"config"');
  });

  it('覆盖 chartConfig 的多条包装分支（445,451,453,454,456）', () => {
    const baseChildren = [
      {
        type: 'table-row',
        children: [{ type: 'table-cell', children: [{ text: 'H' }] }],
      },
    ];

    const nodes = [
      {
        type: 'chart',
        children: baseChildren,
        otherProps: { config: { 0: { chartType: 'line' } } },
      },
      {
        type: 'chart',
        children: baseChildren,
        otherProps: { config: { foo: 'bar' } },
      },
      {
        type: 'chart',
        children: baseChildren,
        otherProps: { config: 'x' },
      },
      {
        type: 'chart',
        children: baseChildren,
        otherProps: { foo: 1 },
      },
    ] as any[];

    const result = parserSlateNodeToMarkdown(nodes);
    expect(result).toContain('| H |');
  });

  it('覆盖 list-item parent 与 blockquote parent 分支（507,515）', () => {
    const parentListItem = [{ root: true }, { type: 'list-item' }];
    const listItemCtx = parserSlateNodeToMarkdown(
      [{ type: 'paragraph', children: [{ text: 'In item' }] }],
      '',
      parentListItem as any,
    );
    expect(listItemCtx).toContain('In item');

    const parentQuote = [{ root: true }, { type: 'blockquote' }];
    const quoteCtx = parserSlateNodeToMarkdown(
      [
        { type: 'paragraph', children: [{ text: 'L1' }] },
        { type: 'paragraph', children: [{ text: 'L2' }] },
      ],
      '',
      parentQuote as any,
    );
    expect(quoteCtx).toContain('> ');
  });

  it('覆盖 table-row 与 list 后置换行分支（613,625）', () => {
    const nodes = [
      { type: 'table-row', children: [] },
      { type: 'list', children: [] },
      { type: 'paragraph', children: [{ text: 'tail' }] },
    ] as any[];
    const result = parserSlateNodeToMarkdown(nodes);
    expect(result).toContain('tail');
  });

  it('覆盖 blockquote 尾部标记与 code/media 非末尾换行（671,679）', () => {
    const nestedParent = [{ root: true }, { type: 'blockquote' }, { type: 'blockquote' }];
    const q = parserSlateNodeToMarkdown(
      [{ type: 'paragraph', children: [{ text: 'nested' }] }],
      '',
      nestedParent as any,
    );
    expect(q).toContain('\n> ');

    const shared = { type: 'code', language: 'js', value: 'a=1' } as any;
    const c = parserSlateNodeToMarkdown([shared, shared]);
    expect(c).toContain('```js');
  });

  it('覆盖 composeText 早退和 URL 分支（856,869）', () => {
    const emptyText = parserSlateNodeToMarkdown([
      { type: 'paragraph', children: [{ text: '', tag: true }] },
    ] as any);
    expect(emptyText).toContain('`${placeholder:-}`');

    const withUrl = parserSlateNodeToMarkdown([
      {
        type: 'paragraph',
        children: [{ text: 'link', url: 'https://example.com/a b' }],
      },
    ] as any);
    expect(withUrl).toContain('[link](');
  });

  it('覆盖表格默认处理中的空行与非 table-cell 单元格（949,973）', () => {
    const node = {
      type: 'table',
      children: [
        {
          type: 'table-row',
          children: [{ type: 'table-cell', children: [{ text: 'H1' }] }],
        },
        null,
        {
          type: 'table-row',
          children: [{ type: 'paragraph', children: [{ text: 'not-cell' }] }],
        },
      ],
    };
    const result = parserSlateNodeToMarkdown([node as any]);
    expect(result).toContain('| H1 |');
  });

  it('覆盖未知 align 的默认对齐策略（1036）', () => {
    const node = {
      type: 'table',
      children: [
        {
          type: 'table-row',
          children: [
            { type: 'table-cell', align: 'mystery', children: [{ text: 'HEAD' }] },
          ],
        },
        { type: 'table-row', children: [{ type: 'table-cell', children: [{ text: 'a' }] }] },
      ],
    };
    const result = parserSlateNodeToMarkdown([node as any]);
    expect(result).toContain('|');
  });

  it('覆盖 code 对象 stringify 失败与 think 标记恢复（1219,1233）', () => {
    const circular: any = {};
    circular.self = circular;
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    expect(() =>
      parserSlateNodeToMarkdown([
        { type: 'code', language: 'json', value: circular },
      ] as any),
    ).toThrow();

    const marker = '\u200B';
    const thinkValue = `${marker}【CODE_BLOCK:js】\nconsole.log(1)\n【/CODE_BLOCK】${marker}`;
    const result = parserSlateNodeToMarkdown([
      { type: 'code', language: 'think', value: thinkValue },
    ] as any);

    expect(warnSpy).toHaveBeenCalled();
    expect(result).toContain('```js');
    warnSpy.mockRestore();
  });

  it('覆盖 handleBlockquote 的空 children 和空内容分支（1291,1308）', () => {
    const parent = [{ root: true }, { type: 'list-item' }];
    const empty = parserSlateNodeToMarkdown(
      [{ type: 'blockquote', children: [] }],
      '',
      parent as any,
    );
    expect(empty).toContain('> ');

    const blank = parserSlateNodeToMarkdown(
      [
        {
          type: 'blockquote',
          children: [{ type: 'paragraph', children: [{ text: '   ' }] }],
        },
      ],
      '',
      parent as any,
    );
    expect(blank).toContain('> ');
  });

  it('覆盖 invalid image URL 回退与 media 特殊分支（1341,1342,1362,1373）', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const result = parserSlateNodeToMarkdown([
      { type: 'image', url: 'http://[::1', alt: 'bad' },
      { type: 'media', mediaType: 'video', url: 'https://x.com/v.mp4' },
      { type: 'media', mediaType: 'iframe', url: 'https://x.com/if', height: 100 },
    ] as any);
    expect(warnSpy).toHaveBeenCalled();
    expect(result).toContain('<video src="https://x.com/v.mp4"/>');
    warnSpy.mockRestore();
  });
});

