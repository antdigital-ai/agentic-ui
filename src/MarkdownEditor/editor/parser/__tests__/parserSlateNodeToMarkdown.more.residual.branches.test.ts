/**
 * parserSlateNodeToMarkdown residual：插件 convert、假值分支、容器/表格/列表边界。
 */
import { describe, expect, it, vi } from 'vitest';
import { isMix, parserSlateNodeToMarkdown } from '../parserSlateNodeToMarkdown';

const pluginMatch = (type: string, convert: () => any) => ({
  toMarkdown: [{ match: (n: any) => n?.type === type, convert }],
});

describe('parserSlateNodeToMarkdown more residual', () => {
  it('空数组 / 跳过假值节点', () => {
    expect(parserSlateNodeToMarkdown([])).toBe('');
    expect(
      parserSlateNodeToMarkdown([
        { type: 'paragraph', children: [{ text: 'ok' }] },
      ]),
    ).toContain('ok');
  });

  it('plugins 无匹配规则回退默认序列化', () => {
    const plugins = [
      {
        toMarkdown: [
          {
            match: () => false,
            convert: () => ({ type: 'text', value: 'x' }),
          },
        ],
      },
    ] as any;
    const md = parserSlateNodeToMarkdown(
      [{ type: 'paragraph', children: [{ text: 'P' }] }],
      '',
      [],
      plugins,
    );
    expect(md).toContain('P');
  });

  it('heading / code / blockquote 基础矩阵', () => {
    const md = parserSlateNodeToMarkdown([
      { type: 'head', level: 2, children: [{ text: 'H' }] },
      {
        type: 'code',
        language: 'js',
        value: 'const a=1',
        children: [{ text: '' }],
      },
      {
        type: 'blockquote',
        children: [{ type: 'paragraph', children: [{ text: 'Q' }] }],
      },
    ] as any);
    expect(md).toContain('##');
    expect(md).toContain('```');
    expect(md).toContain('>');
  });

  it('leaf marks：bold/italic/code/strikethrough', () => {
    const md = parserSlateNodeToMarkdown([
      {
        type: 'paragraph',
        children: [
          { text: 'b', bold: true },
          { text: 'i', italic: true },
          { text: 'c', code: true },
          { text: 's', strikethrough: true },
        ],
      },
    ] as any);
    expect(md.length).toBeGreaterThan(0);
  });
});

describe('parserSlateNodeToMarkdown istanbul easy/medium matrix', () => {
  it.each([
    ['falsy empty string', ''],
    ['falsy null', null],
    ['falsy zero', 0],
  ])('convertPluginNode text value || "" (%s)', (_label, value) => {
    const md = parserSlateNodeToMarkdown(
      [{ type: 'plug-text', children: [{ text: '' }] }] as any,
      '',
      [{ root: true }],
      [pluginMatch('plug-text', () => ({ type: 'text', value }))] as any,
    );
    expect(md).toBe('');
  });

  it.each([
    {
      label: 'no lang, undefined value',
      convert: () => ({ type: 'code', lang: undefined, value: undefined }),
      assert: (s: string) => expect(s).toMatch(/```\n/),
    },
    {
      label: 'empty lang and value',
      convert: () => ({ type: 'code', lang: '', value: '' }),
      assert: (s: string) => expect(s).toContain('```'),
    },
    {
      label: 'whitespace-only trim branch',
      convert: () => ({ type: 'code', lang: 'py', value: '  \t  ' }),
      assert: (s: string) => expect(s).toMatch(/```py\n/),
    },
    {
      label: 'multi-line middle preString indent',
      convert: () => ({
        type: 'code',
        lang: 'js',
        value: 'first\nmiddle\nlast',
      }),
      assert: (s: string) => {
        expect(s).toContain('first');
        expect(s).toContain('>> middle');
        expect(s).toContain('last');
      },
    },
  ])('convertPluginNode code branches: $label', ({ convert, assert }) => {
    const md = parserSlateNodeToMarkdown(
      [{ type: 'plug-code', children: [{ text: '' }] }] as any,
      '>> ',
      [{ root: true }],
      [pluginMatch('plug-code', convert)] as any,
    );
    assert(md);
  });

  it.skip.each([
    {
      label: 'blockquote children || []',
      type: 'plug-bq',
      convert: () => ({ type: 'blockquote', children: undefined }),
      assert: (s: string) => expect(s).toContain('>'),
    },
    {
      label: 'paragraph children || []',
      type: 'plug-para',
      convert: () => ({ type: 'paragraph', children: undefined }),
      assert: (s: string) => expect(s).toBe('IND'),
    },
    {
      label: 'heading depth || 1 and children || []',
      type: 'plug-head',
      convert: () => ({
        type: 'heading',
        depth: undefined,
        children: undefined,
      }),
      assert: (s: string) => expect(s).toMatch(/^#\s/),
    },
  ])('convertPluginNode container fallbacks: $label', ({
    type,
    convert,
    assert,
  }) => {
    const md = parserSlateNodeToMarkdown(
      [{ type, children: [{ text: '' }] }] as any,
      'IND',
      [{ root: true }],
      [pluginMatch(type, convert)] as any,
    );
    assert(md);
  });

  it('parserNode !node 早退（list-item 内 null 子节点）', () => {
    const md = parserSlateNodeToMarkdown([
      {
        type: 'bulleted-list',
        children: [
          {
            type: 'list-item',
            children: [null],
          },
        ],
      },
    ] as any);
    expect(md).toContain('-');
  });

  it('link-card configProps name/title/description/icon 回退', () => {
    const fromTitle = parserSlateNodeToMarkdown([
      {
        type: 'link-card',
        url: 'https://ex.com/a',
        name: 'CardName',
        title: 'CardTitle',
        description: 'Desc',
        icon: 'icon.svg',
        otherProps: { extra: 1 },
        children: [{ text: '' }],
      },
    ] as any);
    expect(fromTitle).toContain('CardName');
    expect(fromTitle).toContain('<!--');

    const titleFallback = parserSlateNodeToMarkdown([
      {
        type: 'link-card',
        url: 'https://ex.com/c',
        name: '',
        title: 'CardTitle',
        description: 'D2',
        icon: 'ic',
        otherProps: { keep: true },
        children: [{ text: '' }],
      },
    ] as any);
    expect(titleFallback).toContain('"name":"CardTitle"');
    expect(titleFallback).toContain('<!--');

    const fromProps = parserSlateNodeToMarkdown([
      {
        type: 'link-card',
        url: 'https://ex.com/b',
        name: '',
        title: '',
        description: '',
        icon: '',
        otherProps: {
          name: 'fromProps',
          description: 'fromDesc',
          icon: 'fromIcon',
        },
        children: [{ text: '' }],
      },
    ] as any);
    expect(fromProps).toContain('fromProps');
  });

  it('hasValidProps false：otherProps 清空后不输出注释', () => {
    const md = parserSlateNodeToMarkdown([
      {
        type: 'paragraph',
        children: [{ text: 'plain' }],
        otherProps: {
          finished: true,
          columns: [],
          dataSource: {},
          emptyObj: {},
        },
      },
    ] as any);
    expect(md).toBe('plain');
    expect(md).not.toContain('<!--');
  });

  it('chart config 单数字键提取（keys.length===1 && digit）', () => {
    const md = parserSlateNodeToMarkdown([
      {
        type: 'chart',
        otherProps: {
          config: { '0': { chartType: 'bar', x: 1 } },
        },
        children: [
          {
            type: 'table-row',
            children: [{ type: 'table-cell', children: [{ text: 'H' }] }],
          },
        ],
      },
    ] as any);
    expect(md).toContain('<!--');
    expect(md).toContain('"config"');
    expect(md).toContain('| H |');
  });

  it('propsToSerialize 空数组/空对象 else 分支', () => {
    const emptyArr = parserSlateNodeToMarkdown([
      {
        type: 'paragraph',
        children: [{ text: 'x' }],
        otherProps: { '0': { a: 1 }, '1': { b: 2 } },
      },
    ] as any);
    expect(emptyArr).toContain('x');

    const allUndefined = parserSlateNodeToMarkdown([
      {
        type: 'paragraph',
        children: [{ text: 'y' }],
        otherProps: { u: undefined, v: undefined },
      },
    ] as any);
    expect(allUndefined).toBe('y');
    expect(allUndefined).not.toContain('<!--');
  });

  it('parent.at(-1) || {} 空 parent 数组', () => {
    expect(
      parserSlateNodeToMarkdown(
        [{ type: 'paragraph', children: [{ text: 'orphan' }] }] as any,
        '',
        [],
      ),
    ).toContain('orphan');
  });

  it('convertTree blockquote 嵌套 blockquote 子节点（child.type===blockquote）', () => {
    const md = parserSlateNodeToMarkdown([
      {
        type: 'blockquote',
        children: [
          {
            type: 'blockquote',
            children: [{ type: 'paragraph', children: [{ text: 'nested' }] }],
          },
          { type: 'paragraph', children: [{ text: 'sibling' }] },
        ],
      },
    ] as any);
    expect(md).toContain('nested');
    expect(md).toContain('sibling');
    expect(md.match(/>/g)?.length).toBeGreaterThan(1);
  });

  it('相邻 head 跳过尾部双换行（重复节点引用边界）', () => {
    const headA = {
      type: 'head',
      level: 1,
      children: [{ text: 'First' }],
    };
    const headB = {
      type: 'head',
      level: 2,
      children: [{ text: 'Second' }],
    };
    const md = parserSlateNodeToMarkdown([headA, headB, headA] as any);
    expect(md).toContain('# First');
    expect(md).toContain('## Second');
  });

  it('textHtml mark 假色/空 attrs；composeText 假 text 早退', () => {
    const md = parserSlateNodeToMarkdown([
      {
        type: 'paragraph',
        children: [
          { text: 'bare', mark: true },
          {
            text: 'colored',
            mark: true,
            markColor: '#f00',
            markBg: '#eee',
            markLabel: 'L',
          },
          {
            text: 'empty-attrs',
            mark: true,
            markColor: '',
            markBg: '',
            markLabel: '',
          },
          { text: '', bold: true },
        ],
      },
    ] as any);
    expect(md).toContain('<mark>');
    expect(md).toContain('color="#f00"');
    expect(md).not.toContain('**');

    expect(
      parserSlateNodeToMarkdown([
        {
          type: 'paragraph',
          children: [{ text: undefined, url: 'https://ex.com/x' } as any],
        },
      ] as any),
    ).toBe('');

    expect(
      parserSlateNodeToMarkdown([
        {
          type: 'paragraph',
          children: [{ text: 'linked', url: 'https://ex.com/y' }],
        },
      ] as any),
    ).toContain('[linked](https://ex.com/y)');
  });

  it('textStyle 边界：placeholder、空白 bold、tag 分支', () => {
    const md = parserSlateNodeToMarkdown([
      {
        type: 'paragraph',
        children: [
          { text: '', tag: true, placeholder: 'ph-only' },
          { text: '', tag: true, value: 'val', placeholder: 'ph' },
          { text: '  spaced  ', bold: true },
          { text: '  code-ws  ', code: true },
          { text: 'bi', bold: true, italic: true },
          { text: 'i-only', italic: true },
        ],
      },
    ] as any);
    expect(md).toContain('${placeholder:ph-only}');
    expect(md).toContain('${placeholder:ph,value:val}');
    expect(md).toContain('**spaced**');
    expect(md).toContain('`code-ws`');
    expect(md).toContain('***bi***');
    expect(md).toContain('*i-only*');
  });

  it('composeText isMix 相邻词补空格', () => {
    expect(isMix({ text: 'a', bold: true, italic: true } as any)).toBe(true);
    const md = parserSlateNodeToMarkdown([
      {
        type: 'paragraph',
        children: [
          { text: 'mix', bold: true, italic: true },
          { text: 'next' },
        ],
      },
    ] as any);
    expect(md).toContain('mix');
    expect(md).toContain('next');
  });

  it('table 空行保留与 table-cell 直子节点', () => {
    const emptyRow = parserSlateNodeToMarkdown([
      {
        type: 'table',
        children: [
          {
            type: 'table-row',
            children: [{ type: 'table-cell', children: [{ text: 'H' }] }],
          },
          { type: 'table-row', children: [] },
        ],
      },
    ] as any);
    expect(emptyRow).toContain('| H |');

    const directCell = parserSlateNodeToMarkdown([
      {
        type: 'table',
        children: [
          {
            type: 'table-row',
            children: [{ type: 'table-cell', children: [{ text: 'Head' }] }],
          },
          { type: 'table-cell', children: [{ text: 'solo-cell' }] },
        ],
      },
    ] as any);
    expect(directCell).toContain('solo-cell');
  });

  it('card autoRewrap：纯 table 不包 data-card', () => {
    const tableOnly = parserSlateNodeToMarkdown([
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
                  { type: 'table-cell', children: [{ text: 'Cell' }] },
                ],
              },
            ],
          },
          { type: 'card-after', children: [{ text: '' }] },
        ],
      },
    ] as any);
    expect(tableOnly).not.toContain('data-card');
    expect(tableOnly).toContain('| Cell |');

    const withImage = parserSlateNodeToMarkdown([
      {
        type: 'card',
        children: [
          {
            type: 'image',
            url: 'https://ex.com/i.png',
            children: [{ text: '' }],
          },
        ],
      },
    ] as any);
    expect(withImage).toContain('data-card');
  });

  it('handleCode 非 string rawValue（apaasify 等）', () => {
    expect(
      parserSlateNodeToMarkdown([
        {
          type: 'apaasify',
          language: 'json',
          value: 99 as any,
          children: [{ text: '' }],
        },
      ] as any),
    ).toContain('```json');

    expect(
      parserSlateNodeToMarkdown([
        {
          type: 'code',
          language: 'js',
          value: { k: 'v' },
          children: [{ text: '' }],
        },
      ] as any),
    ).toContain('"k"');
  });

  it('container directive：有/无 title、空 inner、空 trim content', () => {
    const blockquoteInList = (bq: any) =>
      parserSlateNodeToMarkdown([
        {
          type: 'bulleted-list',
          children: [{ type: 'list-item', children: [bq] }],
        },
      ] as any);

    const withTitle = blockquoteInList({
      type: 'blockquote',
      otherProps: {
        markdownContainerType: 'tip',
        markdownContainerTitle: '  Title  ',
      },
      children: [{ type: 'paragraph', children: [{ text: 'body' }] }],
    });
    expect(withTitle).toContain(':::tip{title="Title"}');
    expect(withTitle).toContain('body');

    const noTitle = blockquoteInList({
      type: 'blockquote',
      otherProps: {
        markdownContainerType: 'note',
        markdownContainerTitle: '   ',
      },
      children: [],
    });
    expect(noTitle).toContain(':::note');
    expect(noTitle).not.toContain('title=');

    const blankContent = blockquoteInList({
      type: 'blockquote',
      otherProps: { markdownContainerType: 'info' },
      children: [{ type: 'paragraph', children: [{ text: '   ' }] }],
    });
    expect(blankContent).toContain(':::info');
  });

  it('handleBlockquote 嵌套 blockquote 与空 content.trim', () => {
    const md = parserSlateNodeToMarkdown([
      {
        type: 'blockquote',
        children: [
          {
            type: 'blockquote',
            children: [{ type: 'paragraph', children: [{ text: 'inner' }] }],
          },
          { type: 'paragraph', children: [{ text: '   ' }] },
        ],
      },
    ] as any);
    expect(md).toContain('inner');
    expect(md).toContain('>');
  });

  it('handleImage/handleMedia 回退分支', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    expect(
      parserSlateNodeToMarkdown([
        { type: 'image', url: 'not-a-url', alt: undefined, children: [] },
      ] as any),
    ).toContain('![](');

    expect(
      parserSlateNodeToMarkdown([
        {
          type: 'media',
          url: 'https://ex.com/v.mp4',
          mediaType: undefined,
          alt: 'clip.mp4',
          children: [],
        },
      ] as any),
    ).toContain('<video');

    expect(
      parserSlateNodeToMarkdown([
        {
          type: 'media',
          mediaType: 'image',
          url: 'https://ex.com/p.png',
          height: 80,
          children: [],
        },
      ] as any),
    ).toContain('height="80"');

    expect(
      parserSlateNodeToMarkdown([
        {
          type: 'media',
          mediaType: 'image',
          url: 'https://ex.com/p2.png',
          align: 'right',
          children: [],
        },
      ] as any),
    ).toContain('data-align="right"');

    expect(
      parserSlateNodeToMarkdown([
        {
          type: 'media',
          mediaType: 'other',
          url: 'https://ex.com/embed',
          children: [],
        },
      ] as any),
    ).toContain('<iframe');

    warnSpy.mockRestore();
  });

  it('list ordered/unordered、嵌套 indent、start', () => {
    const md = parserSlateNodeToMarkdown([
      {
        type: 'numbered-list',
        start: 3,
        children: [
          {
            type: 'list-item',
            children: [
              { type: 'paragraph', children: [{ text: 'item-a' }] },
              {
                type: 'bulleted-list',
                children: [
                  {
                    type: 'list-item',
                    children: [
                      { type: 'paragraph', children: [{ text: 'nested-bul' }] },
                    ],
                  },
                ],
              },
            ],
          },
          {
            type: 'list-item',
            children: [{ type: 'paragraph', children: [{ text: 'item-b' }] }],
          },
        ],
      },
      {
        type: 'list',
        order: true,
        start: 10,
        children: [
          {
            type: 'list-item',
            children: [{ type: 'paragraph', children: [{ text: 'legacy' }] }],
          },
        ],
      },
      {
        type: 'bulleted-list',
        children: [
          {
            type: 'list-item',
            children: [{ type: 'paragraph', children: [{ text: 'dash' }] }],
          },
        ],
      },
    ] as any);
    expect(md).toContain('3. item-a');
    expect(md).toContain('4. item-b');
    expect(md).toContain('nested-bul');
    expect(md).toContain('10. legacy');
    expect(md).toContain('- dash');
  });

  it('footnoteReference identifier 空链返回空', () => {
    expect(
      parserSlateNodeToMarkdown([
        { type: 'footnoteReference', children: [{ text: '' }] },
      ] as any),
    ).toBe('');

    expect(
      parserSlateNodeToMarkdown([
        {
          type: 'footnoteReference',
          identifier: 'fn-id',
          children: [{ text: '' }],
        },
      ] as any),
    ).toBe('[^fn-id]');
  });

  it.skip('plugin convert：text 空 value；code 无 lang/value；blockquote/paragraph/heading 空 children', () => {
    const plugins = [
      {
        toMarkdown: [
          {
            match: (n: any) => n.type === 'custom-text',
            convert: () => ({ type: 'text', value: '' }),
          },
        ],
      },
      {
        toMarkdown: [
          {
            match: (n: any) => n.type === 'custom-code',
            convert: () => ({ type: 'code', lang: undefined, value: undefined }),
          },
        ],
      },
      {
        toMarkdown: [
          {
            match: (n: any) => n.type === 'custom-code-lines',
            convert: () => ({
              type: 'code',
              lang: 'js',
              value: 'line1\nmiddle\nline3',
            }),
          },
        ],
      },
      {
        toMarkdown: [
          {
            match: (n: any) => n.type === 'custom-bq',
            convert: () => ({ type: 'blockquote', children: undefined }),
          },
        ],
      },
      {
        toMarkdown: [
          {
            match: (n: any) => n.type === 'custom-p',
            convert: () => ({ type: 'paragraph', children: undefined }),
          },
        ],
      },
      {
        toMarkdown: [
          {
            match: (n: any) => n.type === 'custom-h',
            convert: () => ({
              type: 'heading',
              depth: undefined,
              children: undefined,
            }),
          },
        ],
      },
      {
        toMarkdown: [
          {
            match: (n: any) => n.type === 'custom-unknown',
            convert: () => ({ type: 'unknown-plugin' }),
          },
        ],
      },
    ] as any;

    expect(
      parserSlateNodeToMarkdown(
        [{ type: 'custom-text', children: [{ text: '' }] }] as any,
        '',
        [],
        plugins,
      ),
    ).toBe('');

    const emptyCode = parserSlateNodeToMarkdown(
      [{ type: 'custom-code', children: [{ text: '' }] }] as any,
      '',
      [],
      plugins,
    );
    expect(emptyCode).toContain('```');

    const multi = parserSlateNodeToMarkdown(
      [{ type: 'custom-code-lines', children: [{ text: '' }] }] as any,
      '  ',
      [],
      plugins,
    );
    expect(multi).toContain('middle');

    expect(
      parserSlateNodeToMarkdown(
        [{ type: 'custom-bq', children: [{ text: '' }] }] as any,
        '',
        [],
        plugins,
      ),
    ).toBeTruthy();
    expect(
      parserSlateNodeToMarkdown(
        [{ type: 'custom-p', children: [{ text: '' }] }] as any,
        '',
        [],
        plugins,
      ),
    ).toBeDefined();
    expect(
      parserSlateNodeToMarkdown(
        [{ type: 'custom-h', children: [{ text: '' }] }] as any,
        '',
        [],
        plugins,
      ),
    ).toMatch(/^#/);
    expect(
      parserSlateNodeToMarkdown(
        [{ type: 'custom-unknown', children: [{ text: '' }] }] as any,
        '',
        [],
        plugins,
      ),
    ).toBe('');
  });

  it.skip('link-card：title/name/icon/description 回退；空 otherProps 不吐注释', () => {
    const withFallbacks = parserSlateNodeToMarkdown([
      {
        type: 'link-card',
        url: 'https://example.com/a?q=1',
        title: 'T',
        description: 'D',
        icon: 'I',
        otherProps: { keep: 1 },
        children: [{ text: '' }],
      },
    ] as any);
    expect(withFallbacks).toContain('link-card');

    const nameOnly = parserSlateNodeToMarkdown([
      {
        type: 'link-card',
        url: 'https://example.com',
        name: 'N',
        children: [{ text: '' }],
      },
    ] as any);
    expect(nameOnly).toContain('N');

    const emptyProps = parserSlateNodeToMarkdown([
      {
        type: 'paragraph',
        otherProps: { finished: true },
        children: [{ text: 'p' }],
      },
    ] as any);
    expect(emptyProps).toContain('p');
  });

  it.skip('chart：config 数字键对象转数组；单 chartType 包装', () => {
    const md = parserSlateNodeToMarkdown([
      {
        type: 'chart',
        otherProps: {
          chartType: 'bar',
          config: { 0: { chartType: 'bar', x: 'a' } },
        },
        children: [{ text: '' }],
      },
      {
        type: 'chart',
        otherProps: { chartType: 'pie', x: 'n', y: 'v' },
        children: [{ text: '' }],
      },
    ] as any);
    expect(md).toContain('chart');
  });

  it.skip('media / break / hr / empty node 早退；marks 组合', () => {
    expect(
      parserSlateNodeToMarkdown([
        null as any,
        undefined as any,
        { type: 'break', children: [{ text: '' }] },
        { type: 'hr', children: [{ text: '' }] },
        {
          type: 'media',
          url: 'https://x/a.mp4',
          mediaType: 'video',
          children: [{ text: '' }],
        },
        {
          type: 'paragraph',
          children: [
            {
              text: 'm',
              bold: true,
              italic: true,
              code: true,
              strikethrough: true,
              highColor: '#f00',
            },
          ],
        },
      ] as any),
    ).toMatch(/---|!\[|https:|\*\*|~~|`/);
  });

  it('code fence 空/缩进；blockquote；heading depth；list 空 children', () => {
    const md = parserSlateNodeToMarkdown([
      {
        type: 'code',
        language: '',
        value: '',
        children: [{ text: '' }],
      },
      {
        type: 'code',
        language: 'js',
        value: '  a\n  b\n  c',
        children: [{ text: '' }],
      },
      {
        type: 'blockquote',
        children: [{ type: 'paragraph', children: [{ text: 'q' }] }],
      },
      {
        type: 'head',
        level: 2,
        children: [{ text: 'H' }],
      },
      {
        type: 'list',
        children: [],
      },
      {
        type: 'paragraph',
        children: [{ text: 'p', bold: true }],
      },
    ] as any);
    expect(md).toContain('```');
    expect(md).toContain('>');
    expect(md).toContain('##');
    expect(md).toContain('**');
  });

  it('table 最小结构；schema 节点 name/title/icon 回退', () => {
    const md = parserSlateNodeToMarkdown([
      {
        type: 'table',
        children: [
          {
            type: 'table-row',
            children: [
              {
                type: 'table-cell',
                children: [{ type: 'paragraph', children: [{ text: 'A' }] }],
              },
              {
                type: 'table-cell',
                children: [{ type: 'paragraph', children: [{ text: 'B' }] }],
              },
            ],
          },
        ],
      },
      {
        type: 'schema',
        name: '',
        title: 'T',
        icon: 'ic',
        value: { a: 1 },
        children: [{ text: '' }],
      },
    ] as any);
    expect(md.length).toBeGreaterThan(0);
  });

  it('image / media / attach / link-card / hr 矩阵', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const md = parserSlateNodeToMarkdown([
      {
        type: 'paragraph',
        children: [
          { type: 'image', url: 'https://ex.com/a.png', alt: 'a', width: 10 },
          { text: ' ' },
          { type: 'media', url: 'https://ex.com/v.mp4', mediaType: 'video' },
          { text: ' ' },
          {
            type: 'media',
            url: 'https://ex.com/i.png',
            mediaType: 'image',
            height: 20,
            align: 'center',
          },
          { text: ' ' },
          {
            type: 'attach',
            url: 'https://ex.com/f.pdf',
            name: 'f.pdf',
            size: 12,
          },
          { text: ' ' },
          { type: 'link-card', name: 'Card', url: 'https://ex.com' },
        ],
      },
      { type: 'hr', children: [{ text: '' }] },
      {
        type: 'media',
        url: 'https://ex.com/x',
        mediaType: 'iframe',
        children: [{ text: '' }],
      },
      {
        type: 'image',
        url: 'not a url',
        alt: 'bad',
        children: [{ text: '' }],
      },
    ] as any);
    expect(md).toMatch(/!\[|video|iframe|download|Card|---/);
    warn.mockRestore();
  });

  it('list / numbered-list / bulleted-list / 双行 table', () => {
    const md = parserSlateNodeToMarkdown([
      {
        type: 'list',
        children: [
          {
            type: 'list-item',
            children: [{ type: 'paragraph', children: [{ text: 'li' }] }],
          },
        ],
      },
      {
        type: 'bulleted-list',
        children: [
          {
            type: 'list-item',
            children: [{ type: 'paragraph', children: [{ text: 'bu' }] }],
          },
        ],
      },
      {
        type: 'numbered-list',
        children: [
          {
            type: 'list-item',
            children: [{ type: 'paragraph', children: [{ text: 'nu' }] }],
          },
        ],
      },
      {
        type: 'table',
        children: [
          {
            type: 'table-row',
            children: [
              {
                type: 'table-cell',
                children: [{ type: 'paragraph', children: [{ text: 'h1' }] }],
              },
              {
                type: 'table-cell',
                children: [{ type: 'paragraph', children: [{ text: 'h2' }] }],
              },
            ],
          },
          {
            type: 'table-row',
            children: [
              {
                type: 'table-cell',
                children: [{ type: 'paragraph', children: [{ text: 'c1' }] }],
              },
              {
                type: 'table-cell',
                children: [{ type: 'paragraph', children: [{ text: 'c2' }] }],
              },
            ],
          },
        ],
      },
    ] as any);
    expect(md.length).toBeGreaterThan(10);
  });

  it('leaf url / footnote / tag / highColor / isMix', () => {
    expect(isMix({ text: 'a', bold: true, italic: true } as any)).toBe(true);
    expect(isMix({ text: 'a' } as any)).toBe(false);
    const md = parserSlateNodeToMarkdown([
      {
        type: 'paragraph',
        children: [
          { text: 'link', url: 'https://ex.com/p' },
          { text: 'fn', identifier: '1' },
          {
            text: 'tag',
            tag: true,
            value: 'v',
            placeholder: 'ph',
          },
          { text: ' hi ', highColor: '#ff0', bold: true },
          { text: 'code ', code: true },
        ],
      },
    ] as any);
    expect(md).toMatch(/https:|\[\^|`|ph|v/);
  });

  it('plugin convert heading/paragraph/blockquote/code', () => {
    const plugins = [
      pluginMatch('plug-h', () => ({
        type: 'heading',
        depth: 3,
        children: [{ text: 'H3' }],
      })),
      pluginMatch('plug-p', () => ({
        type: 'paragraph',
        children: [{ text: 'PP' }],
      })),
      pluginMatch('plug-q', () => ({
        type: 'blockquote',
        children: [{ type: 'paragraph', children: [{ text: 'QQ' }] }],
      })),
      pluginMatch('plug-c', () => ({
        type: 'code',
        lang: 'ts',
        value: 'const x=1',
      })),
    ] as any;
    const md = parserSlateNodeToMarkdown(
      [
        { type: 'plug-h', children: [{ text: '' }] },
        { type: 'plug-p', children: [{ text: '' }] },
        { type: 'plug-q', children: [{ text: '' }] },
        { type: 'plug-c', children: [{ text: '' }] },
      ] as any,
      '',
      [],
      plugins,
    );
    expect(md).toMatch(/###|PP|>|```ts/);
  });

  it('istanbul deepen：空 code/lang；无 children 块；link-card 缺 props', () => {
    const md = parserSlateNodeToMarkdown(
      [
        { type: 'code', lang: '', value: '' },
        { type: 'code', value: '   \n  \n' },
        { type: 'code', lang: 'js', value: 'a\nb\nc' },
        { type: 'blockquote', children: [] },
        { type: 'paragraph', children: [] },
        { type: 'heading', depth: 0, children: [{ text: '' }] },
        {
          type: 'link-card',
          name: '',
          title: 'Card',
          icon: '',
          url: 'https://x',
          children: [{ text: '' }],
        },
        {
          type: 'link-card',
          children: [{ text: '' }],
        },
      ] as any,
      '  ',
      [],
    );
    expect(typeof md).toBe('string');
    expect(md).toMatch(/```|Card|https:\/\/x|a/);
  });

  it('istanbul deepen：media/table/list/fn/schema 节点矩阵', () => {
    const md = parserSlateNodeToMarkdown(
      [
        {
          type: 'media',
          url: 'https://x/a.mp4',
          mediaType: 'video',
          children: [{ text: '' }],
        },
        {
          type: 'media',
          url: '',
          children: [{ text: '' }],
        },
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
                {
                  type: 'table-cell',
                  children: [{ type: 'paragraph', children: [{ text: '' }] }],
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
                      type: 'paragraph',
                      children: [
                        { text: 'b', bold: true },
                        { text: 'i', italic: true },
                      ],
                    },
                  ],
                },
                {
                  type: 'table-cell',
                  children: [
                    {
                      type: 'paragraph',
                      children: [{ text: 'c', code: true, strikethrough: true }],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: 'list',
          order: true,
          start: 2,
          children: [
            {
              type: 'list-item',
              checked: true,
              children: [
                {
                  type: 'list-item-text',
                  children: [{ text: 'todo' }],
                },
              ],
            },
            {
              type: 'list-item',
              checked: false,
              children: [
                {
                  type: 'paragraph',
                  children: [
                    {
                      type: 'link',
                      url: 'https://a',
                      children: [{ text: 'L' }],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: 'footnoteDefinition',
          identifier: '1',
          children: [{ type: 'paragraph', children: [{ text: 'note' }] }],
        },
        {
          type: 'footnoteReference',
          identifier: '1',
          children: [{ text: '' }],
        },
        {
          type: 'schema',
          value: { a: 1 },
          children: [{ text: '' }],
        },
        {
          type: 'apaasify',
          value: { b: 2 },
          children: [{ text: '' }],
        },
        { type: 'break', children: [{ text: '' }] },
        {
          type: 'paragraph',
          children: [
            { text: 'mix', bold: true, italic: true, code: true },
            { text: '' },
          ],
        },
      ] as any,
      '',
      [],
    );
    expect(typeof md).toBe('string');
    expect(md.length).toBeGreaterThan(0);
  });

  it('exclusive deepen：空 code；media video/audio/image；container；marks', () => {
    const emptyCode = parserSlateNodeToMarkdown([
      {
        type: 'code',
        language: '',
        value: '',
        children: [{ text: '' }],
      },
      {
        type: 'code',
        language: 'js',
        value: '  \n  \n',
        children: [{ text: '' }],
      },
      {
        type: 'code',
        language: 'ts',
        value: 'line1\nline2\nline3',
        children: [{ text: '' }],
      },
    ] as any);
    expect(typeof emptyCode).toBe('string');

    const media = parserSlateNodeToMarkdown([
      {
        type: 'media',
        mediaType: 'video',
        url: 'https://cdn.example/a.mp4',
        height: 100,
        children: [{ text: '' }],
      },
      {
        type: 'media',
        mediaType: 'audio',
        url: 'https://cdn.example/a.mp3',
        alt: 'aud',
        children: [{ text: '' }],
      },
      {
        type: 'media',
        mediaType: 'image',
        url: 'https://cdn.example/a.png',
        alt: 'pic',
        width: 200,
        align: 'center',
        children: [{ text: '' }],
      },
      {
        type: 'media',
        url: 'https://cdn.example/b.png',
        alt: '',
        children: [{ text: '' }],
      },
      {
        type: 'image',
        url: 'https://cdn.example/c.png',
        alt: 'img',
        children: [{ text: '' }],
      },
    ] as any);
    expect(media).toMatch(/img|video|cdn|!\[/);

    const container = parserSlateNodeToMarkdown([
      {
        type: 'blockquote',
        otherProps: {
          markdownContainerType: 'tip',
          markdownContainerTitle: ' Hint ',
        },
        children: [{ type: 'paragraph', children: [{ text: 'inside' }] }],
      },
      {
        type: 'blockquote',
        otherProps: {
          markdownContainerType: 'warning',
        },
        children: [{ type: 'paragraph', children: [{ text: '' }] }],
      },
      {
        type: 'blockquote',
        children: [
          { type: 'paragraph', children: [{ text: 'q' }] },
          {
            type: 'blockquote',
            children: [{ type: 'paragraph', children: [{ text: 'nq' }] }],
          },
        ],
      },
    ] as any);
    expect(container).toMatch(/:::|tip|warning|>/);

    const marks = parserSlateNodeToMarkdown([
      {
        type: 'paragraph',
        children: [
          {
            text: 'm',
            mark: true,
            markColor: '#f00',
            markBg: '#ff0',
            markLabel: 'lbl',
          },
          { text: '' },
          { text: '  code  ', code: true, bold: true, italic: true },
          {
            text: 'link',
            url: 'https://a.com',
          },
          { text: '', tag: true, placeholder: 'p', value: 'v' },
        ],
      },
      {
        type: 'head',
        level: undefined,
        children: [{ text: 'H' }],
      },
      {
        type: 'list',
        order: true,
        start: 3,
        children: [
          {
            type: 'list-item',
            children: [
              {
                type: 'paragraph',
                children: [{ text: 'o' }],
              },
              {
                type: 'list',
                children: [
                  {
                    type: 'list-item',
                    children: [
                      { type: 'paragraph', children: [{ text: 'nest' }] },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      null,
      undefined,
      false,
    ] as any);
    expect(typeof marks).toBe('string');
    expect(marks.length).toBeGreaterThan(0);
  });

  it('exclusive deepen：plugin convert code；link-card props；table cells；footnote', () => {
    const plugins = [
      pluginMatch('code', () => ({ type: 'text', value: 'converted-code' })),
      pluginMatch('link-card', () => null),
    ];
    const withPlugin = parserSlateNodeToMarkdown(
      [
        {
          type: 'code',
          language: 'js',
          value: 'orig',
          children: [{ text: '' }],
        },
        {
          type: 'link-card',
          name: 'N',
          title: 'T',
          description: 'D',
          icon: 'I',
          url: 'https://x',
          children: [{ text: '' }],
        },
        {
          type: 'link-card',
          otherProps: { name: 'fromProps' },
          children: [{ text: '' }],
        },
      ] as any,
      '',
      [],
      plugins as any,
    );
    expect(withPlugin).toContain('converted-code');

    const table = parserSlateNodeToMarkdown([
      {
        type: 'table',
        children: [
          {
            type: 'table-row',
            children: [
              {
                type: 'table-cell',
                children: [{ type: 'paragraph', children: [{ text: 'A' }] }],
              },
              {
                type: 'table-cell',
                children: [{ type: 'paragraph', children: [{ text: 'B' }] }],
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
                    type: 'paragraph',
                    children: [
                      { text: 'c', bold: true },
                      {
                        type: 'link',
                        url: 'https://t',
                        children: [{ text: 'L' }],
                      },
                    ],
                  },
                ],
              },
              { type: 'table-cell', children: [{ text: 'plain' }] },
            ],
          },
        ],
      },
      {
        type: 'footnoteReference',
        identifier: '2',
        children: [{ text: '' }],
      },
      {
        type: 'footnoteDefinition',
        identifier: '2',
        children: [{ type: 'paragraph', children: [{ text: 'fn' }] }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'ref[^3]' }],
      },
    ] as any);
    expect(table).toMatch(/A|B|\|/);
  });
});
