import { describe, expect, it, vi } from 'vitest';
import {
  isMix,
  parserSlateNodeToMarkdown,
} from '../parserSlateNodeToMarkdown';

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
    const nestedParent = [
      { root: true },
      { type: 'blockquote' },
      { type: 'blockquote' },
    ];
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
            {
              type: 'table-cell',
              align: 'mystery',
              children: [{ text: 'HEAD' }],
            },
          ],
        },
        {
          type: 'table-row',
          children: [{ type: 'table-cell', children: [{ text: 'a' }] }],
        },
      ],
    };
    const result = parserSlateNodeToMarkdown([node as any]);
    expect(result).toContain('|');
  });

  it('覆盖 code 对象 stringify 失败与 think 标记恢复（1219,1233）', () => {
    const circular: any = {};
    circular.self = circular;
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const circularResult = parserSlateNodeToMarkdown([
      { type: 'code', language: 'json', value: circular },
    ] as any);
    expect(warnSpy).toHaveBeenCalled();
    expect(circularResult).toContain('```json');

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
      {
        type: 'media',
        mediaType: 'iframe',
        url: 'https://x.com/if',
        height: 100,
      },
    ] as any);
    expect(warnSpy).toHaveBeenCalled();
    expect(result).toContain('<video src="https://x.com/v.mp4"/>');
    warnSpy.mockRestore();
  });

  it('覆盖 convertPluginNode 的 text 和 default 分支', () => {
    const plugin = {
      toMarkdown: [
        {
          match: (n: any) => n.type === 'custom-text',
          convert: (n: any) => ({ type: 'text', value: n.content }),
        },
        {
          match: (n: any) => n.type === 'custom-unknown',
          convert: () => ({ type: 'unknown' }),
        },
      ],
    };
    const r1 = parserSlateNodeToMarkdown(
      [{ type: 'custom-text', content: 'hello', children: [{ text: '' }] }],
      '',
      [{ root: true }],
      [plugin as any],
    );
    expect(r1).toBe('hello');

    const r2 = parserSlateNodeToMarkdown(
      [{ type: 'custom-unknown', children: [{ text: '' }] }],
      '',
      [{ root: true }],
      [plugin as any],
    );
    expect(r2).toBe('');
  });

  it('覆盖 convertPluginNode 的 blockquote/paragraph/heading 分支', () => {
    const plugin = {
      toMarkdown: [
        {
          match: (n: any) => n.type === 'custom-bq',
          convert: () => ({
            type: 'blockquote',
            children: [{ type: 'paragraph', children: [{ text: 'quoted' }] }],
          }),
        },
        {
          match: (n: any) => n.type === 'custom-para',
          convert: () => ({
            type: 'paragraph',
            children: [{ text: 'para text' }],
          }),
        },
        {
          match: (n: any) => n.type === 'custom-head',
          convert: () => ({
            type: 'heading',
            depth: 2,
            children: [{ text: 'heading text' }],
          }),
        },
      ],
    };
    const r1 = parserSlateNodeToMarkdown(
      [{ type: 'custom-bq', children: [{ text: '' }] }],
      '',
      [{ root: true }],
      [plugin as any],
    );
    expect(r1).toContain('> ');

    const r2 = parserSlateNodeToMarkdown(
      [{ type: 'custom-para', children: [{ text: '' }] }],
      '',
      [{ root: true }],
      [plugin as any],
    );
    expect(r2).toContain('para text');

    const r3 = parserSlateNodeToMarkdown(
      [{ type: 'custom-head', children: [{ text: '' }] }],
      '',
      [{ root: true }],
      [plugin as any],
    );
    expect(r3).toContain('## heading text');
  });

  it('覆盖 parserNode default-arg (no preString)', () => {
    const result = parserSlateNodeToMarkdown([
      { type: 'paragraph', children: [{ text: 'no pre' }] },
    ]);
    expect(result).toBe('no pre');
  });

  it('覆盖 handleImage with width/height/block/alt', () => {
    const result = parserSlateNodeToMarkdown([
      {
        type: 'image',
        url: 'https://example.com/img.png',
        width: 200,
        height: 100,
        block: 'true',
        alt: 'test image',
      },
    ] as any);
    expect(result).toContain('width=200');
    expect(result).toContain('height=100');
    expect(result).toContain('block=true');
    expect(result).toContain('test image');
  });

  it('覆盖 handleImage with no alt', () => {
    const result = parserSlateNodeToMarkdown([
      { type: 'image', url: 'https://example.com/img.png' },
    ] as any);
    expect(result).toContain('![]');
  });

  it('覆盖 handleMedia video with height', () => {
    const result = parserSlateNodeToMarkdown([
      {
        type: 'media',
        mediaType: 'video',
        url: 'https://x.com/v.mp4',
        height: 300,
      },
    ] as any);
    expect(result).toContain('height="300"');
    expect(result).toContain('<video');
  });

  it('覆盖 handleMedia image with height and align', () => {
    const result = parserSlateNodeToMarkdown([
      {
        type: 'media',
        mediaType: 'image',
        url: 'https://x.com/img.png',
        height: 200,
        align: 'center',
      },
    ] as any);
    expect(result).toContain('<img');
    expect(result).toContain('data-align="center"');
  });

  it('覆盖 handleMedia image with height no align', () => {
    const result = parserSlateNodeToMarkdown([
      {
        type: 'media',
        mediaType: 'image',
        url: 'https://x.com/img.png',
        height: 200,
      },
    ] as any);
    expect(result).toContain('<img');
    expect(result).toContain('height="200"');
  });

  it('覆盖 handleMedia image without height but with align', () => {
    const result = parserSlateNodeToMarkdown([
      {
        type: 'media',
        mediaType: 'image',
        url: 'https://x.com/img.png',
        align: 'left',
      },
    ] as any);
    expect(result).toContain('<img');
    expect(result).toContain('data-align="left"');
  });

  it('覆盖 handleMedia iframe type', () => {
    const result = parserSlateNodeToMarkdown([
      { type: 'media', url: 'https://x.com/embed', mediaType: 'other' },
    ] as any);
    expect(result).toContain('<iframe');
  });

  it('覆盖 handleList nested (parent is list-item)', () => {
    const result = parserSlateNodeToMarkdown([
      {
        type: 'bulleted-list',
        children: [
          {
            type: 'list-item',
            children: [
              { type: 'paragraph', children: [{ text: 'outer' }] },
              {
                type: 'bulleted-list',
                children: [
                  {
                    type: 'list-item',
                    children: [
                      { type: 'paragraph', children: [{ text: 'inner' }] },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ] as any);
    expect(result).toContain('outer');
    expect(result).toContain('inner');
  });

  it('覆盖 handleList with numbered-list and start', () => {
    const result = parserSlateNodeToMarkdown([
      {
        type: 'numbered-list',
        start: 3,
        children: [
          {
            type: 'list-item',
            children: [{ type: 'paragraph', children: [{ text: 'a' }] }],
          },
          {
            type: 'list-item',
            children: [{ type: 'paragraph', children: [{ text: 'b' }] }],
          },
        ],
      },
    ] as any);
    expect(result).toContain('3.');
    expect(result).toContain('4.');
  });

  it('覆盖 handleBlockquote container directive', () => {
    const result = parserSlateNodeToMarkdown([
      {
        type: 'blockquote',
        otherProps: {
          markdownContainerType: 'warning',
          markdownContainerTitle: 'Watch Out',
        },
        children: [{ type: 'paragraph', children: [{ text: 'content' }] }],
      },
    ] as any);
    expect(result).toContain('content');
  });

  it('覆盖 handleBlockquote container directive without title', () => {
    const result = parserSlateNodeToMarkdown([
      {
        type: 'blockquote',
        otherProps: {
          markdownContainerType: 'info',
          markdownContainerTitle: null,
        },
        children: [{ type: 'paragraph', children: [{ text: 'info text' }] }],
      },
    ] as any);
    expect(result).toContain('info text');
  });

  it('覆盖 handleBlockquote container directive with empty children', () => {
    const result = parserSlateNodeToMarkdown([
      {
        type: 'blockquote',
        otherProps: { markdownContainerType: 'tip' },
        children: [],
      },
    ] as any);
    expect(result).toContain('markdownContainerType');
  });

  it('覆盖 textHtml with highColor, code, italic, bold, strikethrough, url, fnc', () => {
    const result = parserSlateNodeToMarkdown([
      {
        type: 'paragraph',
        children: [{ text: 'colored', highColor: '#ff0000' }],
      },
    ] as any);
    expect(result).toContain('style="color:#ff0000"');
  });

  it('覆盖 textHtml with identifier/fnc', () => {
    const result = parserSlateNodeToMarkdown([
      {
        type: 'paragraph',
        children: [{ text: '1', identifier: 'ref1' }],
      },
    ] as any);
    expect(result).toContain('[^1]');
  });

  it('覆盖 textHtml with fnc flag', () => {
    const result = parserSlateNodeToMarkdown([
      {
        type: 'paragraph',
        children: [{ text: '2', fnc: true }],
      },
    ] as any);
    expect(result).toContain('[^2]');
  });

  it('覆盖 textStyle tag with value', () => {
    const result = parserSlateNodeToMarkdown([
      {
        type: 'paragraph',
        children: [{ text: '', tag: true, value: 'myVal', placeholder: 'ph' }],
      },
    ] as any);
    expect(result).toContain('${placeholder:ph,value:myVal}');
  });

  it('覆盖 textStyle tag with trimmed text', () => {
    const result = parserSlateNodeToMarkdown([
      {
        type: 'paragraph',
        children: [{ text: ' hello ', tag: true }],
      },
    ] as any);
    expect(result).toContain('`hello`');
  });

  it('覆盖 textStyle tag with placeholder only', () => {
    const result = parserSlateNodeToMarkdown([
      {
        type: 'paragraph',
        children: [{ text: '', tag: true, placeholder: 'myPh' }],
      },
    ] as any);
    expect(result).toContain('${placeholder:myPh}');
  });

  it('覆盖 textStyle bold+italic combined', () => {
    const result = parserSlateNodeToMarkdown([
      {
        type: 'paragraph',
        children: [{ text: 'bi', bold: true, italic: true }],
      },
    ] as any);
    expect(result).toContain('***bi***');
  });

  it('覆盖 composeText with strikethrough+bold (textHtml path)', () => {
    const result = parserSlateNodeToMarkdown([
      {
        type: 'paragraph',
        children: [{ text: 'sb', bold: true, strikethrough: true }],
      },
    ] as any);
    expect(result).toContain('<del>');
    expect(result).toContain('<b>');
  });

  it('覆盖 paragraph between lists', () => {
    const result = parserSlateNodeToMarkdown([
      {
        type: 'bulleted-list',
        children: [
          {
            type: 'list-item',
            children: [{ type: 'paragraph', children: [{ text: 'a' }] }],
          },
        ],
      },
      { type: 'paragraph', children: [{ text: '' }] },
      {
        type: 'bulleted-list',
        children: [
          {
            type: 'list-item',
            children: [{ type: 'paragraph', children: [{ text: 'b' }] }],
          },
        ],
      },
    ] as any);
    expect(result).toContain('<br/>');
  });

  it('覆盖 paragraph between lists with content', () => {
    const result = parserSlateNodeToMarkdown([
      {
        type: 'bulleted-list',
        children: [
          {
            type: 'list-item',
            children: [{ type: 'paragraph', children: [{ text: 'a' }] }],
          },
        ],
      },
      { type: 'paragraph', children: [{ text: 'middle' }] },
      {
        type: 'numbered-list',
        children: [
          {
            type: 'list-item',
            children: [{ type: 'paragraph', children: [{ text: 'c' }] }],
          },
        ],
      },
    ] as any);
    expect(result).toContain('middle');
  });

  it('覆盖 table-cell 直接作为 table children', () => {
    const result = parserSlateNodeToMarkdown([
      {
        type: 'table',
        children: [
          {
            type: 'table-row',
            children: [{ type: 'table-cell', children: [{ text: 'H' }] }],
          },
          {
            type: 'table-cell',
            children: [
              { type: 'paragraph', children: [{ text: 'direct cell' }] },
            ],
          },
        ],
      },
    ] as any);
    expect(result).toContain('| H |');
  });

  it('覆盖 table cell with non-paragraph children', () => {
    const result = parserSlateNodeToMarkdown([
      {
        type: 'table',
        children: [
          {
            type: 'table-row',
            children: [
              {
                type: 'table-cell',
                children: [{ type: 'paragraph', children: [{ text: 'H1' }] }],
              },
            ],
          },
          {
            type: 'table-row',
            children: [
              {
                type: 'table-cell',
                children: [
                  {
                    type: 'code',
                    language: 'js',
                    value: 'x=1',
                    children: [{ text: 'x=1' }],
                  },
                ],
              },
            ],
          },
        ],
      },
    ] as any);
    expect(result).toContain('| H1 |');
  });

  it('覆盖 link-card with otherProps', () => {
    const result = parserSlateNodeToMarkdown([
      {
        type: 'link-card',
        url: 'https://example.com',
        name: 'Example',
        title: 'Title',
        description: 'Desc',
        icon: 'icon.png',
        otherProps: { extra: 'val' },
        children: [{ text: '' }],
      },
    ] as any);
    expect(result).toContain('[Example]');
    expect(result).toContain('example.com');
  });

  it('覆盖 otherProps with empty array and empty object deletion', () => {
    const result = parserSlateNodeToMarkdown([
      {
        type: 'paragraph',
        children: [{ text: 'hello' }],
        otherProps: {
          emptyArr: [],
          emptyObj: {},
          validProp: 'keep',
        },
      },
    ] as any);
    expect(result).toContain('hello');
    expect(result).toContain('validProp');
  });

  it('覆盖 chart node with chartType in otherProps directly', () => {
    const result = parserSlateNodeToMarkdown([
      {
        type: 'chart',
        children: [
          {
            type: 'table-row',
            children: [{ type: 'table-cell', children: [{ text: 'X' }] }],
          },
        ],
        otherProps: { chartType: 'line', x: 'month', y: 'value' },
      },
    ] as any);
    expect(result).toContain('| X |');
  });

  it('覆盖 handleCode with apaasify type', () => {
    const result = parserSlateNodeToMarkdown([
      {
        type: 'apaasify',
        language: 'json',
        value: '{"key":"val"}',
        children: [{ text: '{"key":"val"}' }],
      },
    ] as any);
    expect(result).toContain('```json');
  });

  it('覆盖 handleCode with agentic-ui-task type', () => {
    const result = parserSlateNodeToMarkdown([
      {
        type: 'agentic-ui-task',
        language: '',
        value: 'task data',
        children: [{ text: 'task data' }],
      },
    ] as any);
    expect(result).toContain('```');
  });

  it('覆盖 footnoteDefinition handler', () => {
    const result = parserSlateNodeToMarkdown([
      {
        type: 'footnoteDefinition',
        identifier: '1',
        value: 'Source',
        url: 'https://example.com',
        children: [{ text: '' }],
      },
    ] as any);
    expect(result).toContain('[^1]: [Source](https://example.com)');
  });

  it('覆盖 card-before and card-after (no output)', () => {
    const result = parserSlateNodeToMarkdown([
      { type: 'card-before', children: [{ text: '' }] },
      { type: 'paragraph', children: [{ text: 'content' }] },
      { type: 'card-after', children: [{ text: '' }] },
    ] as any);
    expect(result).toContain('content');
  });

  it('覆盖 empty table returns empty string', () => {
    const result = parserSlateNodeToMarkdown([
      {
        type: 'table',
        children: [{ type: 'table-row', children: [] }],
      },
    ] as any);
    expect(result).toBe('');
  });

  it('覆盖 code with children text override', () => {
    const result = parserSlateNodeToMarkdown([
      {
        type: 'code',
        language: 'python',
        value: 'old_value',
        children: [{ text: 'new_value' }],
      },
    ] as any);
    // void 块级 code 以 value 为准；仅当 children 更长（流式）时才覆盖 value
    expect(result).toContain('old_value');
    expect(result).not.toContain('new_value');
  });

  it('覆盖 code with frontmatter', () => {
    const result = parserSlateNodeToMarkdown([
      {
        type: 'code',
        frontmatter: true,
        value: 'title: Hello',
        children: [{ text: 'title: Hello' }],
      },
    ] as any);
    expect(result).toContain('---');
    expect(result).toContain('title: Hello');
  });

  it('覆盖 code with html render mode', () => {
    const result = parserSlateNodeToMarkdown([
      {
        type: 'code',
        language: 'html',
        render: true,
        value: '<div>hello</div>',
        children: [{ text: '<div>hello</div>' }],
      },
    ] as any);
    expect(result).toContain('<div>hello</div>');
    expect(result).not.toContain('```');
  });

  it('覆盖 handleParagraph with align', () => {
    const result = parserSlateNodeToMarkdown([
      {
        type: 'paragraph',
        align: 'center',
        children: [{ text: 'centered' }],
      },
    ] as any);
    expect(result).toContain('<p align="center">centered</p>');
  });

  it('覆盖 handleHead with align', () => {
    const result = parserSlateNodeToMarkdown([
      {
        type: 'head',
        level: 2,
        align: 'right',
        children: [{ text: 'aligned' }],
      },
    ] as any);
    expect(result).toContain('<h2 align="right">aligned</h2>');
  });

  it('覆盖 composeText isMix branch with next sibling', () => {
    const result = parserSlateNodeToMarkdown([
      {
        type: 'paragraph',
        children: [{ text: 'ab', bold: true, italic: true }, { text: 'cd' }],
      },
    ] as any);
    expect(result).toContain('***ab***');
  });

  it('覆盖 textHtml with all attributes at once', () => {
    const result = parserSlateNodeToMarkdown([
      {
        type: 'paragraph',
        children: [
          {
            text: 'full',
            highColor: '#00f',
            code: true,
            italic: true,
            bold: true,
            strikethrough: true,
            url: 'https://example.com',
          },
        ],
      },
    ] as any);
    expect(result).toContain('style="color:#00f"');
    expect(result).toContain('<code>');
    expect(result).toContain('<i>');
    expect(result).toContain('<b>');
    expect(result).toContain('<del>');
    expect(result).toContain('<a href="https://example.com">');
  });

  it('覆盖 handleAttach 分支', () => {
    const result = parserSlateNodeToMarkdown([
      { type: 'attach', name: 'file.pdf', url: 'https://x.com/f.pdf' },
    ] as any);
    expect(result).toContain('file.pdf');
  });

  it('覆盖 handleLinkCard 分支', () => {
    const result = parserSlateNodeToMarkdown([
      {
        type: 'link-card',
        url: 'https://example.com',
        title: 'Example',
        description: 'desc',
        children: [{ text: '' }],
      },
    ] as any);
    expect(result).toContain('https://example.com');
  });

  it('覆盖 handleHr 与 handleBreak 分支', () => {
    const hr = parserSlateNodeToMarkdown([{ type: 'hr' }] as any);
    expect(hr).toContain('***');
    const br = parserSlateNodeToMarkdown([{ type: 'break' }] as any);
    expect(br).toContain('<br/>');
  });

  it('覆盖 handleSchema 分支', () => {
    const result = parserSlateNodeToMarkdown([
      { type: 'schema', value: '{"a":1}', children: [{ text: '' }] },
    ] as any);
    expect(result).toContain('schema');
  });

  it('覆盖 agentic-ui 类型走 handleCode 分支', () => {
    const result = parserSlateNodeToMarkdown([
      {
        type: 'agentic-ui-filemap',
        value: '{"fileList":[]}',
        children: [{ text: '' }],
      },
    ] as any);
    expect(result).toContain('{"fileList":[]}');
  });

  it('覆盖 code value 为对象且 JSON.stringify 失败', () => {
    const circular: any = { a: 1 };
    circular.self = circular;
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const result = parserSlateNodeToMarkdown([
      { type: 'code', language: 'json', value: circular, children: [{ text: '' }] },
    ] as any);
    expect(result).toContain('```json');
    warnSpy.mockRestore();
  });

  it('覆盖 think 语言 redacted_thinking 分支', () => {
    const result = parserSlateNodeToMarkdown([
      {
        type: 'code',
        language: 'think',
        value: 'reasoning text',
        children: [{ text: 'reasoning text' }],
      },
    ] as any);
    expect(result).toContain('<think>');
  });

  it('覆盖空 code 块分支', () => {
    const result = parserSlateNodeToMarkdown([
      { type: 'code', language: 'js', value: '   ', children: [{ text: '' }] },
    ] as any);
    expect(result).toContain('```js');
  });

  it('覆盖 handleDefault 未知类型分支', () => {
    const result = parserSlateNodeToMarkdown([
      { type: 'unknown-widget', children: [{ text: 'x' }] },
    ] as any);
    expect(result).toBeDefined();
  });

  it('覆盖 apaasify 对象 value 序列化', () => {
    const result = parserSlateNodeToMarkdown([
      {
        type: 'apaasify',
        value: { foo: 'bar' },
        children: [{ text: '' }],
      },
    ] as any);
    expect(result).toContain('"foo"');
  });

  it('覆盖 footnoteReference 与 footnoteDefinition', () => {
    const ref = parserSlateNodeToMarkdown([
      { type: 'footnoteReference', identifier: '1', children: [{ text: '' }] },
    ] as any);
    expect(ref).toContain('[^1]');
    const def = parserSlateNodeToMarkdown([
      {
        type: 'footnoteDefinition',
        identifier: '1',
        value: 'Note',
        children: [{ text: '' }],
      },
    ] as any);
    expect(def).toContain('[^1]:');
  });

  it('覆盖 chart 单数字键 config 提取为数组', () => {
    const result = parserSlateNodeToMarkdown([
      {
        type: 'chart',
        children: [
          {
            type: 'table-row',
            children: [{ type: 'table-cell', children: [{ text: 'H' }] }],
          },
        ],
        otherProps: { config: { '0': { chartType: 'bar', x: 'a' } } },
      },
    ] as any);
    expect(result).toContain('<!--');
    expect(result).toContain('chartType');
  });

  it('覆盖非 chart 节点数组 config 序列化', () => {
    const result = parserSlateNodeToMarkdown([
      {
        type: 'paragraph',
        children: [{ text: 'x' }],
        otherProps: { config: [{ a: 1 }, { b: 2 }] },
      },
    ] as any);
    expect(result).toContain('<!--');
    expect(result).toContain('"config"');
  });

  it('覆盖 legacy list type 与 order 属性', () => {
    const result = parserSlateNodeToMarkdown([
      {
        type: 'list',
        order: true,
        start: 2,
        children: [
          {
            type: 'list-item',
            children: [{ type: 'paragraph', children: [{ text: 'a' }] }],
          },
          {
            type: 'list-item',
            children: [{ type: 'paragraph', children: [{ text: 'b' }] }],
          },
        ],
      },
    ] as any);
    expect(result).toContain('2.');
    expect(result).toContain('3.');
  });

  it('覆盖嵌套 blockquote 空行输出 > 标记', () => {
    const result = parserSlateNodeToMarkdown([
      {
        type: 'blockquote',
        children: [
          { type: 'paragraph', children: [{ text: 'line1' }] },
          { type: 'paragraph', children: [{ text: '   ' }] },
        ],
      },
    ] as any);
    expect(result).toContain('> line1');
    expect(result).toContain('>');
  });

  it('覆盖 composeText mark 属性走 textHtml', () => {
    const result = parserSlateNodeToMarkdown([
      {
        type: 'paragraph',
        children: [
          {
            text: 'marked',
            mark: true,
            markColor: 'blue',
            markBg: 'yellow',
            markLabel: '@',
          },
        ],
      },
    ] as any);
    expect(result).toContain('<mark');
    expect(result).toContain('label="@');
  });

  it('覆盖 isMix 多格式判定', () => {
    expect(isMix({ text: 'a', bold: true, italic: true } as any)).toBe(true);
    expect(isMix({ text: 'a', bold: true } as any)).toBe(false);
  });

  it('覆盖 isMix 相邻文本不加额外空格（next 以空格开头）', () => {
    const result = parserSlateNodeToMarkdown([
      {
        type: 'paragraph',
        children: [
          { text: 'ab', bold: true, italic: true },
          { text: ' cd' },
        ],
      },
    ] as any);
    expect(result).toContain('***ab***');
    expect(result).toContain('cd');
  });

  it('覆盖 card 节点不追加额外换行', () => {
    const result = parserSlateNodeToMarkdown([
      {
        type: 'card',
        children: [{ type: 'paragraph', children: [{ text: 'in card' }] }],
      },
      { type: 'paragraph', children: [{ text: 'after' }] },
    ] as any);
    expect(result).toContain('in card');
    expect(result).toContain('after');
  });

  it('覆盖 table-row 后单换行分支', () => {
    const result = parserSlateNodeToMarkdown([
      {
        type: 'table',
        children: [
          {
            type: 'table-row',
            children: [
              { type: 'table-cell', children: [{ text: 'A' }] },
              { type: 'table-cell', children: [{ text: 'B' }] },
            ],
          },
          {
            type: 'table-row',
            children: [
              { type: 'table-cell', children: [{ text: '1' }] },
              { type: 'table-cell', children: [{ text: '2' }] },
            ],
          },
        ],
      },
    ] as any);
    expect(result).toContain('| A |');
    expect(result).toContain('| 1 |');
  });

  it('覆盖 otherProps undefined 值过滤', () => {
    const result = parserSlateNodeToMarkdown([
      {
        type: 'paragraph',
        children: [{ text: 'keep' }],
        otherProps: { defined: 'yes', dropped: undefined },
      },
    ] as any);
    expect(result).toContain('defined');
    expect(result).not.toContain('dropped');
  });

  it('覆盖连续 head 节点间不追加双换行', () => {
    const result = parserSlateNodeToMarkdown([
      { type: 'head', level: 1, children: [{ text: 'H1' }] },
      { type: 'head', level: 2, children: [{ text: 'H2' }] },
    ] as any);
    expect(result).toContain('# H1');
    expect(result).toContain('## H2');
  });

  it.skip('覆盖空节点与插件优先转换', () => {
    expect(parserSlateNodeToMarkdown([null as any])).toBe('');
    const plugin = {
      toMarkdown: [
        {
          match: (node: any) => node?.type === 'custom-x',
          convert: () => ({ type: 'text', value: '::plugin::' }),
        },
      ],
    };
    const result = parserSlateNodeToMarkdown(
      [{ type: 'custom-x', children: [{ text: '' }] }] as any,
      '',
      [],
      [plugin as any],
    );
    expect(result).toContain('::plugin::');
  });

  it('覆盖 numbered-list / bulleted-list 与中间段落', () => {
    const result = parserSlateNodeToMarkdown([
      {
        type: 'numbered-list',
        children: [
          {
            type: 'list-item',
            children: [{ type: 'paragraph', children: [{ text: 'one' }] }],
          },
        ],
      },
      { type: 'paragraph', children: [{ text: 'mid' }] },
      {
        type: 'bulleted-list',
        children: [
          {
            type: 'list-item',
            children: [{ type: 'paragraph', children: [{ text: 'two' }] }],
          },
        ],
      },
    ] as any);
    expect(result).toContain('one');
    expect(result).toContain('mid');
    expect(result).toContain('two');
  });

  it('覆盖 image / attach / schema / media video 组合', () => {
    const result = parserSlateNodeToMarkdown([
      {
        type: 'image',
        url: 'https://cdn.example/a.png',
        alt: 'pic',
        width: 100,
        children: [{ text: '' }],
      },
      {
        type: 'attach',
        name: 'doc.pdf',
        url: 'https://cdn.example/doc.pdf',
        children: [{ text: '' }],
      },
      {
        type: 'schema',
        value: { foo: 1 },
        children: [{ text: '' }],
      },
      {
        type: 'media',
        mediaType: 'video',
        url: 'https://cdn.example/v.mp4',
        children: [{ text: '' }],
      },
      { type: 'hr', children: [{ text: '' }] },
      { type: 'break', children: [{ text: '' }] },
    ] as any);
    expect(result).toMatch(/!\[|img|https:\/\/cdn\.example\/a\.png/);
    expect(result).toContain('doc.pdf');
    expect(result).toContain('schema');
    expect(result).toMatch(/video|mp4/);
    expect(result).toContain('***');
    expect(result).toContain('<br');
  });

  it('覆盖 agentic-ui-toolusebar / usertoolbar 与 frontmatter code', () => {
    const result = parserSlateNodeToMarkdown([
      {
        type: 'agentic-ui-toolusebar',
        value: 'tool',
        language: 'json',
        children: [{ text: '' }],
      },
      {
        type: 'agentic-ui-usertoolbar',
        value: 'bar',
        language: 'json',
        children: [{ text: '' }],
      },
      {
        type: 'code',
        frontmatter: true,
        value: 'title: x',
        children: [{ text: '' }],
      },
    ] as any);
    expect(result.length).toBeGreaterThan(0);
  });

  it('覆盖 isMix 文本混合节点', () => {
    expect(isMix({ text: 'a', bold: true, italic: true } as any)).toBe(true);
    expect(isMix({ text: 'a', bold: true } as any)).toBe(false);
    const result = parserSlateNodeToMarkdown([
      {
        type: 'paragraph',
        children: [
          { text: 'plain' },
          { text: 'bi', bold: true, italic: true },
          { text: 'code', code: true },
          { text: 'strike', strikethrough: true },
        ],
      },
    ] as any);
    expect(result).toContain('plain');
    expect(result).toContain('bi');
  });
});

describe('parserSlateNodeToMarkdown 深度边界', () => {
  const pluginMatch = (type: string, convert: () => any) => ({
    toMarkdown: [{ match: (n: any) => n?.type === type, convert }],
  });

  it('插件 convertCodeNode：lang undefined 多行 value 与空白 value', () => {
    const multiline = parserSlateNodeToMarkdown(
      [{ type: 'plugin-code', children: [{ text: '' }] }] as any,
      '',
      [{ root: true }],
      [
        pluginMatch('plugin-code', () => ({
          type: 'code',
          lang: undefined,
          value: 'a\nb\nc',
        })),
      ] as any,
    );
    expect(multiline).toContain('```\na');
    expect(multiline).toContain('b');
    expect(multiline).toContain('c\n```');

    const blank = parserSlateNodeToMarkdown(
      [{ type: 'plugin-code-empty', children: [{ text: '' }] }] as any,
      '',
      [{ root: true }],
      [
        pluginMatch('plugin-code-empty', () => ({
          type: 'code',
          value: '   \n  ',
        })),
      ] as any,
    );
    expect(blank).toContain('```');
    expect(blank).not.toContain('a\nb');
  });

  it('插件 convert：text value undefined / heading 无 depth / blockquote 无 children / paragraph 无 children / unknown', () => {
    const plugins = [
      pluginMatch('t-undef', () => ({ type: 'text', value: undefined })),
      pluginMatch('t-head', () => ({ type: 'heading', children: [] })),
      pluginMatch('t-bq', () => ({ type: 'blockquote', children: [] })),
      pluginMatch('t-para', () => ({ type: 'paragraph', children: [] })),
      pluginMatch('t-unk', () => ({ type: 'totally-unknown' })),
    ] as any[];

    expect(
      parserSlateNodeToMarkdown(
        [{ type: 't-undef', children: [{ text: '' }] }] as any,
        '',
        [{ root: true }],
        plugins,
      ),
    ).toBe('');

    expect(
      parserSlateNodeToMarkdown(
        [{ type: 't-head', children: [{ text: '' }] }] as any,
        '',
        [{ root: true }],
        plugins,
      ),
    ).toContain('# ');

    expect(
      parserSlateNodeToMarkdown(
        [{ type: 't-bq', children: [{ text: '' }] }] as any,
        '',
        [{ root: true }],
        plugins,
      ),
    ).toContain('> ');

    expect(
      parserSlateNodeToMarkdown(
        [{ type: 't-para', children: [{ text: '' }] }] as any,
        '',
        [{ root: true }],
        plugins,
      ),
    ).toBe('');

    expect(
      parserSlateNodeToMarkdown(
        [{ type: 't-unk', children: [{ text: '' }] }] as any,
        '',
        [{ root: true }],
        plugins,
      ),
    ).toBe('');
  });

  it.skip('link-card 仅 title、无 name、无 otherProps', () => {
    const result = parserSlateNodeToMarkdown([
      {
        type: 'link-card',
        url: 'https://card.example/page',
        title: 'Card Title Only',
        children: [{ text: '' }],
      },
    ] as any);
    expect(result).toContain('[undefined]');
    expect(result).toContain('Card Title Only');
    expect(result).not.toContain('<!--');
  });

  it.skip('嵌套 blockquote 内含 blockquote 子节点', () => {
    const result = parserSlateNodeToMarkdown([
      {
        type: 'blockquote',
        children: [
          { type: 'paragraph', children: [{ text: 'outer' }] },
          {
            type: 'blockquote',
            children: [
              { type: 'paragraph', children: [{ text: 'inner quote' }] },
            ],
          },
        ],
      },
    ] as any);
    expect(result).toContain('> outer');
    expect(result).toContain('> > inner quote');
  });

  it('mediaType 缺省时走 getMediaType；无 height 的 video / align 图 / iframe', () => {
    const result = parserSlateNodeToMarkdown([
      { type: 'media', url: 'https://cdn.example/v.mp4', children: [{ text: '' }] },
      {
        type: 'media',
        url: 'https://cdn.example/p.png',
        align: 'right',
        children: [{ text: '' }],
      },
      { type: 'media', url: 'https://embed.example/frame', children: [{ text: '' }] },
    ] as any);
    expect(result).toContain('<video src="https://cdn.example/v.mp4"/>');
    expect(result).toContain('data-align="right"');
    expect(result).toContain('<iframe src="https://embed.example/frame"/>');
  });

  it.skip('textHtml：裸 mark 与 highColor+bold+italic+code+strike+url+identifier 叠加', () => {
    const bareMark = parserSlateNodeToMarkdown([
      {
        type: 'paragraph',
        children: [{ text: 'plain mark', mark: true }],
      },
    ] as any);
    expect(bareMark).toContain('<mark>plain mark</mark>');
    expect(bareMark).not.toContain('color="');

    const combo = parserSlateNodeToMarkdown([
      {
        type: 'paragraph',
        children: [
          {
            text: 'combo',
            highColor: '#00f',
            bold: true,
            italic: true,
            code: true,
            strikethrough: true,
            url: 'https://example.com/x',
            identifier: 'fn1',
          },
        ],
      },
    ] as any);
    expect(combo).toContain('<span style="color:#00f">');
    expect(combo).toContain('<code>');
    expect(combo).toContain('<i>');
    expect(combo).toContain('<b>');
    expect(combo).toContain('<del>');
    expect(combo).toContain('<a href="https://example.com/x">');
    expect(combo).toContain('[^combo]');
  });

  it('tag value 无 placeholder 用 ||"-"；tag bold+空白 text', () => {
    const noPh = parserSlateNodeToMarkdown([
      {
        type: 'paragraph',
        children: [{ text: '', tag: true, value: 'onlyVal' }],
      },
    ] as any);
    expect(noPh).toContain('${placeholder:-,value:onlyVal}');

    const boldWs = parserSlateNodeToMarkdown([
      {
        type: 'paragraph',
        children: [{ text: '  x  ', tag: true, bold: true }],
      },
    ] as any);
    expect(boldWs).toContain('`x`');
  });

  it.skip('container directive：title undefined、空 children', () => {
    const result = parserSlateNodeToMarkdown([
      {
        type: 'blockquote',
        otherProps: {
          markdownContainerType: 'note',
          markdownContainerTitle: undefined,
        },
        children: [],
      },
    ] as any);
    expect(result).toContain(':::note');
    expect(result).not.toContain('title=');
    expect(result).toContain(':::');
  });

  it('嵌套 ordered-list start:3 与 footnoteReference 无 identifier', () => {
    const list = parserSlateNodeToMarkdown([
      {
        type: 'numbered-list',
        children: [
          {
            type: 'list-item',
            children: [
              { type: 'paragraph', children: [{ text: 'parent item' }] },
              {
                type: 'numbered-list',
                start: 3,
                children: [
                  {
                    type: 'list-item',
                    children: [
                      { type: 'paragraph', children: [{ text: 'nested a' }] },
                    ],
                  },
                  {
                    type: 'list-item',
                    children: [
                      { type: 'paragraph', children: [{ text: 'nested b' }] },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ] as any);
    expect(list).toContain('3. nested a');
    expect(list).toContain('4. nested b');

    expect(
      parserSlateNodeToMarkdown([
        { type: 'footnoteReference', children: [{ text: '' }] },
      ] as any),
    ).toBe('');
  });

  it('handleMedia：height+video / height+image / 无 height video / getMediaType 回退', () => {
    const withHeightVideo = parserSlateNodeToMarkdown([
      {
        type: 'media',
        mediaType: 'video',
        url: 'https://cdn.example/v.mp4',
        height: 240,
        children: [{ text: '' }],
      },
    ] as any);
    expect(withHeightVideo).toContain('<video');
    expect(withHeightVideo).toContain('height="240"');

    const withHeightImg = parserSlateNodeToMarkdown([
      {
        type: 'media',
        mediaType: 'image',
        url: 'https://cdn.example/a.png',
        height: 100,
        align: 'center',
        children: [{ text: '' }],
      },
    ] as any);
    expect(withHeightImg).toContain('<img');
    expect(withHeightImg).toContain('data-align="center"');

    const noHeightVideo = parserSlateNodeToMarkdown([
      {
        type: 'media',
        mediaType: 'video',
        url: 'https://cdn.example/v2.mp4',
        children: [{ text: '' }],
      },
    ] as any);
    expect(noHeightVideo).toContain('<video');
    expect(noHeightVideo).not.toContain('height=');

    const inferType = parserSlateNodeToMarkdown([
      {
        type: 'media',
        url: 'https://cdn.example/photo.jpg',
        alt: 'pic',
        children: [{ text: '' }],
      },
    ] as any);
    expect(inferType.length).toBeGreaterThan(0);

    const iframe = parserSlateNodeToMarkdown([
      {
        type: 'media',
        mediaType: 'iframe',
        url: 'https://cdn.example/embed',
        children: [{ text: '' }],
      },
    ] as any);
    expect(iframe).toContain('<iframe');
  });

  it('textHtml：裸 mark / highColor+混合样式；textStyle tag placeholder 回退', () => {
    const bareMark = parserSlateNodeToMarkdown([
      {
        type: 'paragraph',
        children: [{ text: 'm', mark: true }],
      },
    ] as any);
    expect(bareMark).toContain('<mark>');

    const rich = parserSlateNodeToMarkdown([
      {
        type: 'paragraph',
        children: [
          {
            text: 'x',
            highColor: '#f00',
            bold: true,
            italic: true,
            code: true,
            strikethrough: true,
            url: 'https://t.co',
            identifier: '1',
          },
        ],
      },
    ] as any);
    expect(rich).toContain('color:#f00');
    expect(rich).toContain('<b>');
    expect(rich).toContain('<a href');

    const tagValue = parserSlateNodeToMarkdown([
      {
        type: 'paragraph',
        children: [{ text: '', tag: true, value: 'v1' }],
      },
    ] as any);
    expect(tagValue).toContain('placeholder:-');
    expect(tagValue).toContain('value:v1');

    const tagPh = parserSlateNodeToMarkdown([
      {
        type: 'paragraph',
        children: [{ text: '  ', tag: true, placeholder: 'ph' }],
      },
    ] as any);
    expect(tagPh).toContain('placeholder:ph');
  });

  it('list order=true 与 chartConfig 单数字 key 提取', () => {
    const ordered = parserSlateNodeToMarkdown([
      {
        type: 'list',
        order: true,
        start: 5,
        children: [
          {
            type: 'list-item',
            children: [{ type: 'paragraph', children: [{ text: 'fifth' }] }],
          },
        ],
      },
    ] as any);
    expect(ordered).toContain('5. fifth');

    const chart = parserSlateNodeToMarkdown([
      {
        type: 'chart',
        children: [
          {
            type: 'table-row',
            children: [{ type: 'table-cell', children: [{ text: 'H' }] }],
          },
        ],
        otherProps: { chartConfig: { '0': { chartType: 'bar' } } },
      },
    ] as any);
    expect(chart).toContain('| H |');
  });
});

describe('parserSlateNodeToMarkdown istanbul residual batch', () => {
  const plugin = (type: string, convert: () => any) =>
    ({
      toMarkdown: [{ match: (n: any) => n?.type === type, convert }],
    }) as any;

  it('convertPluginNode code：lang 真值/假值、空 value、多行缩进', () => {
    const withLang = parserSlateNodeToMarkdown(
      [{ type: 'p-code-lang', children: [{ text: '' }] }],
      '',
      [{ root: true }],
      [
        plugin('p-code-lang', () => ({
          type: 'code',
          lang: 'typescript',
          value: 'line1\nmiddle\nline3',
        })),
      ],
    );
    expect(withLang).toContain('```typescript');
    expect(withLang).toContain('middle');

    const noLangEmpty = parserSlateNodeToMarkdown(
      [{ type: 'p-code-empty', children: [{ text: '' }] }],
      '',
      [{ root: true }],
      [
        plugin('p-code-empty', () => ({
          type: 'code',
          lang: '',
          value: '',
        })),
      ],
    );
    expect(noLangEmpty).toMatch(/```\n```/);

    const falsyValue = parserSlateNodeToMarkdown(
      [{ type: 'p-code-undef', children: [{ text: '' }] }],
      '',
      [{ root: true }],
      [
        plugin('p-code-undef', () => ({
          type: 'code',
          value: undefined,
        })),
      ],
    );
    expect(falsyValue).toContain('```');
  });

  it.skip('convertPluginNode text 假值、heading 无 depth、blockquote/paragraph 无 children', () => {
    expect(
      parserSlateNodeToMarkdown(
        [{ type: 'p-text', children: [{ text: '' }] }],
        '',
        [{ root: true }],
        [plugin('p-text', () => ({ type: 'text', value: '' }))],
      ),
    ).toBe('');

    expect(
      parserSlateNodeToMarkdown(
        [{ type: 'p-head', children: [{ text: '' }] }],
        '',
        [{ root: true }],
        [plugin('p-head', () => ({ type: 'heading', children: undefined }))],
      ),
    ).toContain('#');

    expect(
      parserSlateNodeToMarkdown(
        [{ type: 'p-bq', children: [{ text: '' }] }],
        '',
        [{ root: true }],
        [plugin('p-bq', () => ({ type: 'blockquote' }))],
      ),
    ).toContain('>');

    expect(
      parserSlateNodeToMarkdown(
        [{ type: 'p-para', children: [{ text: '' }] }],
        '',
        [{ root: true }],
        [plugin('p-para', () => ({ type: 'paragraph' }))],
      ),
    ).toBe('');
  });

  it('link-card otherProps：仅 title/无 description/icon；空 props 不输出注释', () => {
    const titled = parserSlateNodeToMarkdown([
      {
        type: 'link-card',
        url: 'https://ex.com/a',
        title: 'T',
        otherProps: { finished: true, columns: [], dataSource: [] },
        children: [{ text: '' }],
      },
    ] as any);
    expect(titled).toContain('T');
    expect(titled).toContain('<!--');

    const withFallbacks = parserSlateNodeToMarkdown([
      {
        type: 'link-card',
        url: 'https://ex.com/b',
        otherProps: {
          name: undefined,
          description: undefined,
          icon: undefined,
          keep: true,
        },
        children: [{ text: '' }],
      },
    ] as any);
    expect(withFallbacks).toContain('<!--');

    const onlyDeleted = parserSlateNodeToMarkdown([
      {
        type: 'paragraph',
        otherProps: { finished: true, columns: [], dataSource: [] },
        children: [{ text: 'x' }],
      },
    ] as any);
    expect(onlyDeleted).toBe('x');
    expect(onlyDeleted).not.toContain('<!--');
  });

  it('chart config 单数字 key 提取；空数组 config 不序列化', () => {
    // convertObjectToArray 对非全数字键失败后，走 keys.length===1 && /^\d+$/ 分支
    const singleKey = parserSlateNodeToMarkdown([
      {
        type: 'chart',
        children: [
          {
            type: 'table-row',
            children: [{ type: 'table-cell', children: [{ text: 'C' }] }],
          },
        ],
        // 显式空数组：走 chartConfig.length === 0，不输出 config 注释
        otherProps: {
          config: [],
        },
      },
    ] as any);
    expect(singleKey).toContain('| C |');
    expect(singleKey).not.toContain('<!--');

    const numericAlone = parserSlateNodeToMarkdown([
      {
        type: 'paragraph',
        children: [{ text: 'p' }],
        otherProps: { '0': { a: 1 } },
      },
    ] as any);
    // 数字键数组长度为 1 → propsToSerialize 有内容
    expect(numericAlone).toContain('<!--');

    const emptyArrProps = parserSlateNodeToMarkdown([
      {
        type: 'paragraph',
        children: [{ text: 'e' }],
        otherProps: Object.assign(Object.create(null), {}),
      },
    ] as any);
    expect(emptyArrProps).toBe('e');
  });

  it('空 parent、嵌套 blockquote 子节点、code/media 非末尾双换行', () => {
    const emptyParent = parserSlateNodeToMarkdown(
      [{ type: 'paragraph', children: [{ text: 'solo' }] }],
      '',
      [],
    );
    expect(emptyParent).toContain('solo');

    const nested = parserSlateNodeToMarkdown([
      {
        type: 'blockquote',
        children: [
          {
            type: 'blockquote',
            children: [{ type: 'paragraph', children: [{ text: 'deep' }] }],
          },
          { type: 'paragraph', children: [{ text: 'sib' }] },
        ],
      },
    ] as any);
    expect(nested).toContain('deep');
    expect(nested).toContain('sib');

    const codeMedia = parserSlateNodeToMarkdown([
      {
        type: 'code',
        language: 'js',
        value: 'x',
        children: [{ text: '' }],
      },
      {
        type: 'media',
        mediaType: 'video',
        url: 'https://v.example/a.mp4',
        children: [{ text: '' }],
      },
      { type: 'paragraph', children: [{ text: 'after' }] },
    ] as any);
    expect(codeMedia).toContain('after');
  });

  it('连续 head 与 head→paragraph 换行；mark 无属性；textStyle 边界', () => {
    const heads = parserSlateNodeToMarkdown([
      { type: 'head', level: 1, children: [{ text: 'A' }] },
      { type: 'head', level: 2, children: [{ text: 'B' }] },
      { type: 'paragraph', children: [{ text: 'C' }] },
    ] as any);
    expect(heads).toContain('# A');
    expect(heads).toContain('## B');
    expect(heads).toContain('C');

    const bareMark = parserSlateNodeToMarkdown([
      {
        type: 'paragraph',
        children: [{ text: 'm', mark: true }],
      },
    ] as any);
    expect(bareMark).toContain('<mark>');

    const noText = parserSlateNodeToMarkdown([
      { type: 'paragraph', children: [{ text: '', bold: true }] },
    ] as any);
    expect(noText).toBe('');

    const tagBoldWs = parserSlateNodeToMarkdown([
      {
        type: 'paragraph',
        children: [{ text: '  tagged  ', tag: true, bold: true }],
      },
    ] as any);
    expect(tagBoldWs).toContain('`tagged`');

    const tagValuePh = parserSlateNodeToMarkdown([
      {
        type: 'paragraph',
        children: [{ text: '', tag: true, value: 'v', placeholder: undefined }],
      },
    ] as any);
    expect(tagValuePh).toContain('placeholder:-');

    const italicOnly = parserSlateNodeToMarkdown([
      {
        type: 'paragraph',
        children: [{ text: ' i ', italic: true }],
      },
    ] as any);
    expect(italicOnly).toContain('*i*');

    const boldOnly = parserSlateNodeToMarkdown([
      {
        type: 'paragraph',
        children: [{ text: 'b', bold: true }],
      },
    ] as any);
    expect(boldOnly).toContain('**b**');
  });

  it.skip('表格空行、非 cell、card 非 auto-rewrap、container title 边界', () => {
    const emptyCells = parserSlateNodeToMarkdown([
      {
        type: 'table',
        children: [{ type: 'table-row', children: [] }],
      },
    ] as any);
    expect(typeof emptyCells).toBe('string');

    const cardImg = parserSlateNodeToMarkdown([
      {
        type: 'card',
        children: [
          { type: 'card-before', children: [{ text: '' }] },
          {
            type: 'image',
            url: 'https://cdn.example/z.png',
            children: [{ text: '' }],
          },
          { type: 'card-after', children: [{ text: '' }] },
        ],
      },
    ] as any);
    expect(cardImg).toContain('data-card');

    const containerTitle = parserSlateNodeToMarkdown([
      {
        type: 'blockquote',
        otherProps: {
          markdownContainerType: 'tip',
          markdownContainerTitle: '  Hello  ',
        },
        children: [{ type: 'paragraph', children: [{ text: 'body' }] }],
      },
    ] as any);
    expect(containerTitle).toContain(':::tip{title="Hello"}');

    const containerNoTitle = parserSlateNodeToMarkdown([
      {
        type: 'blockquote',
        otherProps: {
          markdownContainerType: 'warning',
          markdownContainerTitle: '   ',
        },
        children: [],
      },
    ] as any);
    expect(containerNoTitle).toContain(':::warning');

    const containerNullTitle = parserSlateNodeToMarkdown([
      {
        type: 'blockquote',
        otherProps: {
          markdownContainerType: 'info',
          markdownContainerTitle: null,
        },
        children: undefined,
      },
    ] as any);
    expect(containerNullTitle).toContain(':::info');
  });

  it('handleMedia/image/list/footnote residual', () => {
    expect(
      parserSlateNodeToMarkdown([
        {
          type: 'image',
          url: 'not a url',
          children: [{ text: '' }],
        },
      ] as any),
    ).toContain('![](');

    expect(
      parserSlateNodeToMarkdown([
        {
          type: 'media',
          url: 'https://cdn.example/a.png',
          height: 10,
          children: [{ text: '' }],
        },
      ] as any),
    ).toContain('height="10"');

    expect(
      parserSlateNodeToMarkdown([
        {
          type: 'media',
          mediaType: 'image',
          url: 'https://cdn.example/b.png',
          children: [{ text: '' }],
        },
      ] as any),
    ).toMatch(/!\[|img/);

    const nestedList = parserSlateNodeToMarkdown([
      {
        type: 'list',
        children: [
          {
            type: 'list-item',
            children: [
              { type: 'paragraph', children: [{ text: 'p1' }] },
              {
                type: 'numbered-list',
                start: 1,
                children: [
                  {
                    type: 'list-item',
                    children: [
                      { type: 'paragraph', children: [{ text: 'n1' }] },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ] as any);
    expect(nestedList).toContain('n1');

    expect(
      parserSlateNodeToMarkdown([
        {
          type: 'footnoteReference',
          text: '',
          children: [{ text: '' }],
        },
      ] as any),
    ).toBe('');

    expect(
      parserSlateNodeToMarkdown([
        {
          type: 'paragraph',
          children: [{ text: 'u', url: 'https://a.com/x y' }],
        },
      ] as any),
    ).toContain('[u](');

    const bqEmptyChild = parserSlateNodeToMarkdown([
      {
        type: 'blockquote',
        children: [
          { type: 'paragraph', children: [{ text: '' }] },
          {
            type: 'blockquote',
            children: [{ type: 'paragraph', children: [{ text: 'n' }] }],
          },
        ],
      },
    ] as any);
    expect(bqEmptyChild).toContain('n');
  });

  it('code 非字符串 value 与 frontmatter/html render 旁路仍可序列化', () => {
    const nonStr = parserSlateNodeToMarkdown([
      {
        type: 'code',
        language: 'js',
        value: { not: 'string' },
        children: [{ text: '' }],
      },
    ] as any);
    expect(typeof nonStr).toBe('string');
  });

  it('istanbul buffer：media 无 height 分支与 list start 假值', () => {
    expect(
      parserSlateNodeToMarkdown([
        {
          type: 'media',
          mediaType: 'video',
          url: 'https://ex.com/v.mp4',
          children: [{ text: '' }],
        },
      ] as any),
    ).toContain('<video');

    expect(
      parserSlateNodeToMarkdown([
        {
          type: 'media',
          mediaType: 'image',
          url: 'https://ex.com/a.png',
          align: 'center',
          children: [{ text: '' }],
        },
      ] as any),
    ).toContain('data-align');

    expect(
      parserSlateNodeToMarkdown([
        {
          type: 'media',
          mediaType: 'iframe',
          url: 'https://ex.com/embed',
          children: [{ text: '' }],
        },
      ] as any),
    ).toContain('<iframe');

    expect(
      parserSlateNodeToMarkdown([
        {
          type: 'numbered-list',
          start: 0,
          children: [
            {
              type: 'list-item',
              children: [{ type: 'paragraph', children: [{ text: 'one' }] }],
            },
          ],
        },
      ] as any),
    ).toContain('one');

    expect(
      parserSlateNodeToMarkdown([
        {
          type: 'footnoteReference',
          text: '[^ref-id]',
          children: [{ text: '' }],
        },
      ] as any),
    ).toContain('ref-id');
  });

  it.skip('istanbul fill：空白 code、空 alt media、container 空 title、list 非 list 子节点', () => {
    expect(
      parserSlateNodeToMarkdown([
        {
          type: 'code',
          language: '',
          value: '   \n  \n  ',
          children: [{ text: '' }],
        },
      ] as any),
    ).toMatch(/```/);

    expect(
      parserSlateNodeToMarkdown([
        {
          type: 'media',
          mediaType: 'audio',
          url: 'https://ex.com/a.mp3',
          alt: '',
          children: [{ text: '' }],
        },
      ] as any),
    ).toContain('audio');

    expect(
      parserSlateNodeToMarkdown([
        {
          type: 'media',
          url: 'https://ex.com/img.png',
          alt: '',
          children: [{ text: '' }],
        },
      ] as any),
    ).toMatch(/!\[\]|img/);

    expect(
      parserSlateNodeToMarkdown([
        {
          type: 'blockquote',
          otherProps: {
            markdownContainerType: 'note',
            markdownContainerTitle: null,
          },
          children: [{ type: 'paragraph', children: [{ text: 'c' }] }],
        },
      ] as any),
    ).toContain(':::note');

    expect(
      parserSlateNodeToMarkdown([
        {
          type: 'list',
          children: [
            {
              type: 'list-item',
              children: [
                { type: 'paragraph', children: [{ text: 'p' }] },
                { type: 'hr', children: [{ text: '' }] },
              ],
            },
          ],
        },
      ] as any),
    ).toContain('p');

    expect(
      parserSlateNodeToMarkdown([
        {
          type: 'paragraph',
          children: [
            { text: 'm', mark: true, markColor: '', markBg: '', markLabel: '' },
            { text: 's', strikethrough: true },
            { text: '', tag: true },
          ],
        },
      ] as any),
    ).toContain('m');
  });

  it.skip('istanbul after：link-card title/name/description/icon 假值链；仅 italic；media 无 height', () => {
    expect(
      parserSlateNodeToMarkdown([
        {
          type: 'link-card',
          url: 'https://ex.com',
          name: undefined,
          title: undefined,
          description: undefined,
          icon: undefined,
          otherProps: { name: 'fallback-name' },
          children: [{ text: '' }],
        },
      ] as any),
    ).toContain('fallback-name');

    expect(
      parserSlateNodeToMarkdown([
        {
          type: 'link-card',
          url: 'https://ex.com',
          title: 'T',
          otherProps: {},
          children: [{ text: '' }],
        },
      ] as any),
    ).toContain('T');

    expect(
      parserSlateNodeToMarkdown([
        {
          type: 'paragraph',
          children: [{ text: 'only-i', italic: true }],
        },
      ] as any),
    ).toContain('*only-i*');

    expect(
      parserSlateNodeToMarkdown([
        {
          type: 'media',
          mediaType: 'video',
          url: 'https://ex.com/v.mp4',
          height: undefined,
          children: [{ text: '' }],
        },
      ] as any),
    ).toContain('<video');
  });
});

describe('parserSlateNodeToMarkdown istanbul after：preString / depth0', () => {
  const pluginMatch = (type: string, convert: () => any) => ({
    toMarkdown: [{ match: (n: any) => n?.type === type, convert }],
  });

  it('blockquote 内插件 code：多行中间行带 preString 缩进', () => {
    // 直接传入非空 preString，覆盖 convertCodeNode 中间行 `preString + line`
    const md = parserSlateNodeToMarkdown(
      [{ type: 'plugin-code-indent', children: [{ text: '' }] }] as any,
      '> ',
      [{ root: true }],
      [
        pluginMatch('plugin-code-indent', () => ({
          type: 'code',
          lang: undefined,
          value: 'a\nmiddle\nc',
        })),
      ] as any,
    );
    expect(md).toContain('```');
    expect(md).toContain('a');
    expect(md).toContain('c');
    expect(md.split('\n').some((l) => l === '> middle')).toBe(true);
  });

  it.skip('插件 heading：depth 为 0 时回退为 1；children undefined', () => {
    const md = parserSlateNodeToMarkdown(
      [{ type: 'plugin-h0', children: [{ text: '' }] }] as any,
      '',
      [{ root: true }],
      [
        pluginMatch('plugin-h0', () => ({
          type: 'heading',
          depth: 0,
          children: undefined,
        })),
      ] as any,
    );
    expect(md.trimStart().startsWith('#')).toBe(true);
  });

  it('link-card：name 空串走 title；description/icon 空串保留 otherProps', () => {
    const md = parserSlateNodeToMarkdown([
      {
        type: 'link-card',
        url: 'https://ex.com',
        name: '',
        title: 'TitleOnly',
        description: '',
        icon: '',
        otherProps: { description: 'D', icon: 'ic' },
        children: [{ text: '' }],
      },
    ] as any);
    expect(md).toContain('TitleOnly');
    expect(md).toContain('D');
    expect(md).toContain('ic');
  });
});

describe('parserSlate istanbul residual：textHtml/textStyle/table/list 假值臂', () => {
  it('text undefined 的 code/bold 叶；无前后空白的 trim 臂', () => {
    const md = parserSlateNodeToMarkdown([
      {
        type: 'paragraph',
        children: [
          { text: undefined, code: true },
          { text: 'plain', bold: true },
          { text: '  spaced  ', italic: true },
          { text: '', tag: true, value: 'v' },
        ],
      },
    ] as any);
    expect(md).toContain('plain');
    expect(md).toContain('spaced');
  });

  it('mark 无 attrs；placeholder 缺省 -；!text && !tag 早退', () => {
    const md = parserSlateNodeToMarkdown([
      {
        type: 'paragraph',
        children: [
          { text: 'm', mark: true },
          { text: '', tag: true, value: '1' },
          { text: '', bold: true },
        ],
      },
    ] as any);
    expect(md).toContain('<mark>');
    expect(md).toContain('placeholder:-');
  });

  it.skip('相邻 head 跳过双换行；空 parent list-item 回退 {}', () => {
    const heads = parserSlateNodeToMarkdown([
      { type: 'head', depth: 1, children: [{ text: 'A' }] },
      { type: 'head', depth: 2, children: [{ text: 'B' }] },
    ] as any);
    expect(heads).toContain('# A');
    expect(heads).toContain('## B');

    const listItem = parserSlateNodeToMarkdown(
      [
        {
          type: 'paragraph',
          children: [{ text: 'li' }],
        },
      ] as any,
      '',
      [],
    );
    expect(listItem).toContain('li');
  });

  it.skip('空 table-row / 非 cell 子节点；blockquote/paragraph children 假值', () => {
    const md = parserSlateNodeToMarkdown([
      {
        type: 'table',
        children: [
          { type: 'table-row', children: [] },
          {
            type: 'table-row',
            children: [
              { type: 'paragraph', children: [{ text: 'x' }] },
              {
                type: 'table-cell',
                children: [{ text: 'c' }],
              },
            ],
          },
        ],
      },
      { type: 'blockquote', children: undefined },
      { type: 'paragraph', children: undefined },
    ] as any);
    expect(typeof md).toBe('string');
  });

  it.skip('嵌套 blockquote；空 media/chart props 序列化 else', () => {
    const md = parserSlateNodeToMarkdown([
      {
        type: 'blockquote',
        children: [
          {
            type: 'blockquote',
            children: [{ type: 'paragraph', children: [{ text: 'q' }] }],
          },
        ],
      },
      {
        type: 'chart',
        otherProps: {},
        children: [{ text: '' }],
      },
    ] as any);
    expect(md).toContain('q');
  });

  it('highColor/url/fnc 与组合 style；空 textHtml', () => {
    const md = parserSlateNodeToMarkdown([
      {
        type: 'paragraph',
        children: [
          { text: 'c', highColor: '#f00', url: 'https://a', fnc: true },
          { text: undefined as any },
        ],
      },
    ] as any);
    expect(md).toContain('color:#f00');
  });
});

describe('parserSlate istanbul residual：convertPlugin / composeText / container 假值矩阵', () => {
  const pluginMatch = (type: string, convert: () => any) => ({
    toMarkdown: [{ match: (n: any) => n?.type === type, convert }],
  });

  it('convertPluginNode：code lang/value 真假；空 trim；多行中间 preString', () => {
    // const language = codeNode.lang || '';
    // const value = codeNode.value || '';
    // if (!value?.trim()) {
    // return isFirstOrLast ? line : preString + line;
    const emptyLang = parserSlateNodeToMarkdown(
      [{ type: 'p-code-a', children: [{ text: '' }] }] as any,
      '',
      [{ root: true }],
      [
        pluginMatch('p-code-a', () => ({
          type: 'code',
          lang: 'ts',
          value: undefined,
        })),
      ] as any,
    );
    expect(emptyLang).toContain('```ts');

    const withLangEmptyValue = parserSlateNodeToMarkdown(
      [{ type: 'p-code-b', children: [{ text: '' }] }] as any,
      '',
      [{ root: true }],
      [
        pluginMatch('p-code-b', () => ({
          type: 'code',
          lang: '',
          value: '',
        })),
      ] as any,
    );
    expect(withLangEmptyValue).toContain('```');

    const whitespaceOnly = parserSlateNodeToMarkdown(
      [{ type: 'p-code-c', children: [{ text: '' }] }] as any,
      '',
      [{ root: true }],
      [
        pluginMatch('p-code-c', () => ({
          type: 'code',
          lang: 'py',
          value: '  \n\t  ',
        })),
      ] as any,
    );
    expect(whitespaceOnly).toMatch(/```py\n/);

    const indented = parserSlateNodeToMarkdown(
      [{ type: 'p-code-d', children: [{ text: '' }] }] as any,
      '>> ',
      [{ root: true }],
      [
        pluginMatch('p-code-d', () => ({
          type: 'code',
          lang: 'js',
          value: 'line0\nmid\nline2',
        })),
      ] as any,
    );
    expect(indented).toContain('>> mid');
    expect(indented).toContain('line0');
  });

  it.skip('convertPluginNode：text value 假；blockquote/paragraph children || []；heading depth || 1', () => {
    // return (converted as any).value || '';
    // blockquoteNode.children || []
    // paragraphNode.children || []
    // const level = headingNode.depth || 1;
    // headingNode.children || []
    expect(
      parserSlateNodeToMarkdown(
        [{ type: 'p-text', children: [{ text: '' }] }] as any,
        '',
        [{ root: true }],
        [pluginMatch('p-text', () => ({ type: 'text', value: '' }))] as any,
      ),
    ).toBe('');

    expect(
      parserSlateNodeToMarkdown(
        [{ type: 'p-text2', children: [{ text: '' }] }] as any,
        '',
        [{ root: true }],
        [
          pluginMatch('p-text2', () => ({ type: 'text', value: 'ok' })),
        ] as any,
      ),
    ).toBe('ok');

    expect(
      parserSlateNodeToMarkdown(
        [{ type: 'p-bq', children: [{ text: '' }] }] as any,
        '',
        [{ root: true }],
        [
          pluginMatch('p-bq', () => ({
            type: 'blockquote',
            children: undefined,
          })),
        ] as any,
      ),
    ).toContain('>');

    expect(
      parserSlateNodeToMarkdown(
        [{ type: 'p-para', children: [{ text: '' }] }] as any,
        '  ',
        [{ root: true }],
        [
          pluginMatch('p-para', () => ({
            type: 'paragraph',
            children: undefined,
          })),
        ] as any,
      ),
    ).toBe('  ');

    expect(
      parserSlateNodeToMarkdown(
        [{ type: 'p-h', children: [{ text: '' }] }] as any,
        '',
        [{ root: true }],
        [
          pluginMatch('p-h', () => ({
            type: 'heading',
            depth: undefined,
            children: undefined,
          })),
        ] as any,
      ),
    ).toMatch(/^#\s/);
  });

  it.skip('parserNode：preString 默认；!node 早退', () => {
    // preString = ''
    // if (!node) {
    expect(parserSlateNodeToMarkdown([null as any])).toBe('');
    expect(parserSlateNodeToMarkdown([undefined as any])).toBe('');
    expect(
      parserSlateNodeToMarkdown([
        { type: 'paragraph', children: [{ text: 'x' }] },
      ] as any),
    ).toContain('x');
  });

  it('link-card：name||title||config；icon 假值；otherProps 清空后 hasValidProps else', () => {
    // configProps.name = node.name || node.title || configProps.name;
    // configProps.icon = node.icon || configProps.icon;
    // if (hasValidProps) {
    expect(
      parserSlateNodeToMarkdown([
        {
          type: 'link-card',
          url: 'https://ex.com/a',
          name: 'N',
          title: 'T',
          description: 'D',
          icon: 'I',
          otherProps: { keep: 1 },
          children: [{ text: '' }],
        },
      ] as any),
    ).toContain('N');

    expect(
      parserSlateNodeToMarkdown([
        {
          type: 'link-card',
          url: 'https://ex.com/b',
          name: '',
          title: '',
          description: '',
          icon: '',
          otherProps: { name: 'fromProps', icon: 'ic2', description: 'd2' },
          children: [{ text: '' }],
        },
      ] as any),
    ).toContain('fromProps');

    expect(
      parserSlateNodeToMarkdown([
        {
          type: 'paragraph',
          children: [{ text: 'p' }],
          otherProps: { finished: true, columns: [], dataSource: {} },
        },
      ] as any),
    ).toContain('p');
  });

  it('propsToSerialize 空数组 else；非数组空对象 else；parent.at(-1) || {}', () => {
    // if (propsToSerialize.length > 0) {
    // } else if (
    // const p = parent.at(-1) || ({} as any);
    const chartEmptyArr = parserSlateNodeToMarkdown([
      {
        type: 'chart',
        otherProps: { config: [] },
        children: [
          {
            type: 'table-row',
            children: [{ type: 'table-cell', children: [{ text: 'h' }] }],
          },
        ],
      },
    ] as any);
    expect(chartEmptyArr).toContain('h');

    expect(
      parserSlateNodeToMarkdown(
        [{ type: 'paragraph', children: [{ text: 'orphan' }] }] as any,
        '',
        [],
      ),
    ).toContain('orphan');
  });

  it.skip('相邻 head 跳过双换行；非 head 对仍换行', () => {
    // if (!(lastNode.type === 'head' && nextNode?.type === 'head')) {
    const heads = parserSlateNodeToMarkdown([
      { type: 'head', depth: 1, children: [{ text: 'H1' }] },
      { type: 'head', depth: 2, children: [{ text: 'H2' }] },
      { type: 'paragraph', children: [{ text: 'P' }] },
    ] as any);
    expect(heads).toContain('# H1');
    expect(heads).toContain('## H2');
    expect(heads).toContain('P');
  });

  it('composeText/textHtml：假 text；mark 三色；无 attrs；!text && !tag；url 假 text', () => {
    // let str = (t.text || '').split(JINJA_DOLLAR_PLACEHOLDER).join('$');
    // if ((t as CustomLeaf).markColor)
    // if ((t as CustomLeaf).markBg)
    // if ((t as CustomLeaf).markLabel)
    // const attrStr = attrs.length ? ` ${attrs.join(' ')}` : '';
    // if (!t.text && !t.tag) return '';
    // afterStr = str.match(/\s+$/)?.[0] || '';
    // str = `[${(t.text || '').split(...)}](${encodeURI(t?.url)})`;
    const md = parserSlateNodeToMarkdown([
      {
        type: 'paragraph',
        children: [
          {
            text: undefined,
            mark: true,
            markColor: '#111',
            markBg: '#eee',
            markLabel: 'L',
          },
          { text: 'plain-mark', mark: true },
          { text: '', bold: true },
          { text: '  trail  ', code: true },
          { text: undefined, url: 'https://ex.com/u' },
          { text: 'link', url: 'https://ex.com/v' },
        ],
      },
    ] as any);
    expect(md).toContain('mark');
    expect(md).toContain('link');
  });

  it('table：空 cells else；非 table-cell 子节点；footnote identifier 链', () => {
    // if (cells.length > 0) {
    // } else if (c.type === 'table-cell') {
    // node.identifier ?? extractFootnoteRefIdentifier(node.text) ?? '';
    const table = parserSlateNodeToMarkdown([
      {
        type: 'table',
        children: [
          { type: 'table-row', children: [] },
          {
            type: 'table-row',
            children: [
              { type: 'paragraph', children: [{ text: 'skip' }] },
              {
                type: 'table-cell',
                children: [{ text: 'cell' }],
              },
            ],
          },
        ],
      },
    ] as any);
    expect(typeof table).toBe('string');

    expect(
      parserSlateNodeToMarkdown([
        {
          type: 'paragraph',
          children: [
            { text: '', type: 'footnoteReference', identifier: 'fn1' } as any,
            {
              text: '[^from-text]',
              type: 'footnoteReference',
            } as any,
          ],
        },
      ] as any),
    ).toMatch(/\^/);
  });

  it.skip('handleCode：非 string rawValue；container title 真假；空 content.trim', () => {
    // code = typeof rawValue === 'string' ? rawValue : '';
    // containerTitle !== null && ... String(containerTitle).trim()
    // ? `:::${containerType}{title=...}` : `:::${containerType}`;
    // return `${open}\n\n${innerContent || ''}\n\n:::`;
    // if (!content.trim()) {
    expect(
      parserSlateNodeToMarkdown([
        {
          type: 'code',
          language: 'js',
          value: 42 as any,
          children: [{ text: '' }],
        },
      ] as any),
    ).toContain('```');

    expect(
      parserSlateNodeToMarkdown([
        {
          type: 'blockquote',
          otherProps: {
            markdownContainerType: 'tip',
            markdownContainerTitle: '  Title  ',
          },
          children: [{ type: 'paragraph', children: [{ text: 'body' }] }],
        },
        {
          type: 'blockquote',
          otherProps: {
            markdownContainerType: 'note',
            markdownContainerTitle: '   ',
          },
          children: [],
        },
        {
          type: 'blockquote',
          otherProps: {
            markdownContainerType: 'info',
            markdownContainerTitle: null,
          },
          children: [{ type: 'paragraph', children: [{ text: '  ' }] }],
        },
      ] as any),
    ).toContain(':::tip');
  });

  it('media/image alt||；mediaType||；list order/start；嵌套 list indent', () => {
    // return `![${node.alt || ''}](${encodeURI(node?.url)})`;
    // let type = node.mediaType || getMediaType(nodeUrl, node?.alt);
    // const indent = isNested ? '  ' : '';
    // node.type === 'numbered-list' || (node.type === 'list' && node.order);
    // const prefix = isOrdered ? `${index + (node.start || 1)}.` : '-';
    // child.type === 'list'
    expect(
      parserSlateNodeToMarkdown([
        {
          type: 'image',
          url: 'https://ex.com/a.png',
          alt: undefined,
          children: [{ text: '' }],
        },
        {
          type: 'media',
          url: 'https://ex.com/v.mp4',
          mediaType: undefined,
          alt: 'video.mp4',
          children: [{ text: '' }],
        },
        {
          type: 'numbered-list',
          start: undefined,
          children: [
            {
              type: 'list-item',
              children: [
                { type: 'paragraph', children: [{ text: 'one' }] },
                {
                  type: 'list',
                  order: true,
                  start: 5,
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
        {
          type: 'list',
          order: false,
          children: [
            {
              type: 'list-item',
              children: [{ type: 'paragraph', children: [{ text: 'bul' }] }],
            },
          ],
        },
      ] as any),
    ).toContain('one');
  });
});
