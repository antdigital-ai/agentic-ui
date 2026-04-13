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
    const result = parserSlateNodeToMarkdown(
      [{ type: 'paragraph', children: [{ text: 'no pre' }] }],
    );
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
        children: [
          { text: 'colored', highColor: '#ff0000' },
        ],
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
          { type: 'list-item', children: [{ type: 'paragraph', children: [{ text: 'a' }] }] },
        ],
      },
      { type: 'paragraph', children: [{ text: '' }] },
      {
        type: 'bulleted-list',
        children: [
          { type: 'list-item', children: [{ type: 'paragraph', children: [{ text: 'b' }] }] },
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
          { type: 'list-item', children: [{ type: 'paragraph', children: [{ text: 'a' }] }] },
        ],
      },
      { type: 'paragraph', children: [{ text: 'middle' }] },
      {
        type: 'numbered-list',
        children: [
          { type: 'list-item', children: [{ type: 'paragraph', children: [{ text: 'c' }] }] },
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
            children: [{ type: 'paragraph', children: [{ text: 'direct cell' }] }],
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
                children: [
                  { type: 'paragraph', children: [{ text: 'H1' }] },
                ],
              },
            ],
          },
          {
            type: 'table-row',
            children: [
              {
                type: 'table-cell',
                children: [
                  { type: 'code', language: 'js', value: 'x=1', children: [{ text: 'x=1' }] },
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
    expect(result).toContain('new_value');
    expect(result).not.toContain('old_value');
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
        children: [
          { text: 'ab', bold: true, italic: true },
          { text: 'cd' },
        ],
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
});
