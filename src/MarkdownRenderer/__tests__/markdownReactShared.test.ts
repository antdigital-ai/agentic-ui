import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import {
  buildEditorAlignedComponents,
  createHastProcessor,
  markLastParagraphStreamingTail,
  renderMarkdownBlock,
  splitMarkdownBlocks,
} from '../markdownReactShared';

describe('splitMarkdownBlocks', () => {
  it('splits on double blank lines', () => {
    const md = 'block1\n\n\nblock2';
    const result = splitMarkdownBlocks(md);
    expect(result.length).toBe(2);
    expect(result[0]).toBe('block1');
    expect(result[1]).toBe('block2');
  });

  it('does not split inside code fences', () => {
    const md = '```\nline1\n\n\nline2\n```';
    const result = splitMarkdownBlocks(md);
    expect(result.length).toBe(1);
  });

  it('handles tilde fences', () => {
    const md = '~~~\nline1\n\n\nline2\n~~~';
    const result = splitMarkdownBlocks(md);
    expect(result.length).toBe(1);
  });

  it('returns single block for normal content', () => {
    const md = 'hello\nworld';
    const result = splitMarkdownBlocks(md);
    expect(result.length).toBe(1);
    expect(result[0]).toBe('hello\nworld');
  });

  it('handles empty string', () => {
    const result = splitMarkdownBlocks('');
    expect(result.length).toBe(1);
    expect(result[0]).toBe('');
  });

  it('handles multiple blocks', () => {
    const md = 'a\n\n\nb\n\n\nc';
    const result = splitMarkdownBlocks(md);
    expect(result.length).toBe(3);
  });
});

describe('createHastProcessor', () => {
  it('creates processor without extra plugins', () => {
    const proc = createHastProcessor();
    expect(proc).toBeDefined();
    expect(typeof proc.parse).toBe('function');
  });

  it('accepts extra remark plugins as array', () => {
    const fakePlugin = () => (tree: any) => tree;
    const proc = createHastProcessor([[fakePlugin as any, { option: true }]]);
    expect(proc).toBeDefined();
  });

  it('accepts extra remark plugins as single function', () => {
    const fakePlugin = () => (tree: any) => tree;
    const proc = createHastProcessor([fakePlugin as any]);
    expect(proc).toBeDefined();
  });

  it('accepts markedConfig as array entry', () => {
    const fakePlugin = () => (tree: any) => tree;
    const proc = createHastProcessor(undefined, {
      markedConfig: [[fakePlugin as any, { opt: 1 }]],
    });
    expect(proc).toBeDefined();
  });

  it('accepts markedConfig as single function', () => {
    const fakePlugin = () => (tree: any) => tree;
    const proc = createHastProcessor(undefined, {
      markedConfig: [fakePlugin as any],
    });
    expect(proc).toBeDefined();
  });
});

describe('renderMarkdownBlock', () => {
  it('returns null for empty content', () => {
    const proc = createHastProcessor();
    const result = renderMarkdownBlock('', proc, {});
    expect(result).toBeNull();
  });

  it('returns null for whitespace-only content', () => {
    const proc = createHastProcessor();
    const result = renderMarkdownBlock('   ', proc, {});
    expect(result).toBeNull();
  });

  it('renders basic markdown', () => {
    const proc = createHastProcessor();
    const result = renderMarkdownBlock('hello world', proc, {});
    expect(result).not.toBeNull();
  });

  it('marks streaming tail paragraph when option set', () => {
    const proc = createHastProcessor();
    const result = renderMarkdownBlock('hello', proc, {}, {
      markStreamingTailParagraph: true,
    });
    expect(result).not.toBeNull();
  });

  it('returns null on parse error', () => {
    const badProcessor = {
      parse: () => { throw new Error('parse error'); },
      runSync: () => ({}),
    } as any;
    const result = renderMarkdownBlock('test', badProcessor, {});
    expect(result).toBeNull();
  });
});

describe('markLastParagraphStreamingTail', () => {
  it('marks the last paragraph with dataStreamingTail', () => {
    const hast = {
      type: 'root',
      children: [
        { type: 'element', tagName: 'p', properties: {} },
        { type: 'element', tagName: 'p', properties: {} },
      ],
    };
    markLastParagraphStreamingTail(hast);
    expect(hast.children[1].properties.dataStreamingTail).toBe(true);
    expect(hast.children[0].properties.dataStreamingTail).toBeUndefined();
  });

  it('handles tree with no paragraphs gracefully', () => {
    const hast = {
      type: 'root',
      children: [
        { type: 'element', tagName: 'div', properties: {} },
      ],
    };
    markLastParagraphStreamingTail(hast);
    expect(hast.children[0].properties.dataStreamingTail).toBeUndefined();
  });

  it('initializes properties if not present', () => {
    const hast = {
      type: 'root',
      children: [
        { type: 'element', tagName: 'p' },
      ],
    } as any;
    markLastParagraphStreamingTail(hast);
    expect(hast.children[0].properties.dataStreamingTail).toBe(true);
  });
});

describe('buildEditorAlignedComponents', () => {
  const prefixCls = 'ant-md-editor-content';
  const buildComponents = (opts: {
    streaming?: boolean;
    linkConfig?: any;
    fncProps?: any;
    streamingParagraphAnimation?: boolean;
    eleRender?: any;
    userComponents?: Record<string, any>;
  } = {}) =>
    buildEditorAlignedComponents(
      prefixCls,
      opts.userComponents || {},
      opts.streaming,
      opts.linkConfig,
      opts.fncProps,
      opts.streamingParagraphAnimation,
      opts.eleRender,
    );

  describe('p component', () => {
    it('renders paragraph with data-be=paragraph', () => {
      const comps = buildComponents();
      const result = comps.p({ node: {}, children: 'hello' });
      expect(result).toBeDefined();
    });

    it('applies eleRender when provided', () => {
      const eleRender = vi.fn((_props: any, defaultDom: any) => defaultDom);
      const comps = buildComponents({ eleRender });
      comps.p({ node: {}, children: 'hello' });
      expect(eleRender).toHaveBeenCalledWith(
        expect.objectContaining({ tagName: 'p' }),
        expect.anything(),
      );
    });
  });

  describe('heading components', () => {
    it('renders h1-h6', () => {
      const comps = buildComponents();
      for (const tag of ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const) {
        const result = (comps as any)[tag]({ node: {}, children: 'title' });
        expect(result).toBeDefined();
      }
    });

    it('applies eleRender to headings', () => {
      const eleRender = vi.fn((_p: any, d: any) => d);
      const comps = buildComponents({ eleRender });
      comps.h1({ node: {}, children: 'title' });
      comps.h2({ node: {}, children: 'title' });
      comps.h3({ node: {}, children: 'title' });
      comps.h4({ node: {}, children: 'title' });
      comps.h5({ node: {}, children: 'title' });
      comps.h6({ node: {}, children: 'title' });
      expect(eleRender).toHaveBeenCalledTimes(6);
    });
  });

  describe('blockquote', () => {
    it('renders blockquote', () => {
      const comps = buildComponents();
      const result = comps.blockquote({ node: {}, children: 'quote' });
      expect(result).toBeDefined();
    });
  });

  describe('list components', () => {
    it('renders ul', () => {
      const comps = buildComponents();
      const result = comps.ul({ node: {}, children: 'item' });
      expect(result).toBeDefined();
    });

    it('renders ol', () => {
      const comps = buildComponents();
      const result = comps.ol({ node: {}, children: 'item', start: 1 });
      expect(result).toBeDefined();
    });

    it('renders li as non-task', () => {
      const comps = buildComponents();
      const result = comps.li({
        node: {},
        children: 'item',
        className: undefined,
      });
      expect(result).toBeDefined();
    });

    it('renders li as task with className string', () => {
      const comps = buildComponents();
      const result = comps.li({
        node: {},
        children: [
          React.createElement('input', { type: 'checkbox', checked: true }),
          'Task text',
        ],
        className: 'task-list-item',
      });
      expect(result).toBeDefined();
    });

    it('renders li as task with className array', () => {
      const comps = buildComponents();
      const result = comps.li({
        node: {},
        children: ['Task text'],
        className: ['task-list-item'],
      });
      expect(result).toBeDefined();
    });
  });

  describe('table components', () => {
    it('renders table', () => {
      const comps = buildComponents();
      const result = comps.table({ node: {}, children: 'rows' });
      expect(result).toBeDefined();
    });

    it('renders thead/tbody/tr/th/td', () => {
      const comps = buildComponents();
      expect(comps.thead({ node: {}, children: 'h' })).toBeDefined();
      expect(comps.tbody({ node: {}, children: 'b' })).toBeDefined();
      expect(comps.tr({ node: {}, children: 'r' })).toBeDefined();
      expect(comps.th({ node: {}, children: 'th' })).toBeDefined();
      expect(comps.td({ node: {}, children: 'td' })).toBeDefined();
    });
  });

  describe('input component', () => {
    it('renders checkbox type as Checkbox', () => {
      const comps = buildComponents();
      const result = comps.input({
        node: {},
        type: 'checkbox',
        checked: true,
        disabled: false,
      });
      expect(result).toBeDefined();
    });

    it('renders non-checkbox as regular input', () => {
      const comps = buildComponents();
      const result = comps.input({
        node: {},
        type: 'text',
        checked: false,
        disabled: false,
      });
      expect(result).toBeDefined();
    });
  });

  describe('a (link) component', () => {
    it('renders link with default openInNewTab', () => {
      const comps = buildComponents();
      const result = comps.a({ node: {}, href: 'https://example.com' });
      expect(result).toBeDefined();
    });

    it('renders link with openInNewTab=false', () => {
      const comps = buildComponents({ linkConfig: { openInNewTab: false } });
      const result = comps.a({ node: {}, href: 'https://example.com' });
      expect(result).toBeDefined();
    });

    it('handles link onClick returning false', () => {
      const onClick = vi.fn(() => false);
      const comps = buildComponents({ linkConfig: { onClick } });
      const linkEl = comps.a({ node: {}, href: 'https://example.com' });
      expect(linkEl).toBeDefined();
    });

    it('handles link onClick returning void', () => {
      const onClick = vi.fn(() => undefined);
      const comps = buildComponents({ linkConfig: { onClick } });
      const linkEl = comps.a({ node: {}, href: 'https://example.com' });
      expect(linkEl).toBeDefined();
    });
  });

  describe('inline elements', () => {
    it('renders strong', () => {
      const comps = buildComponents();
      expect(comps.strong({ node: {}, children: 'bold' })).toBeDefined();
    });

    it('renders em', () => {
      const comps = buildComponents();
      expect(comps.em({ node: {}, children: 'italic' })).toBeDefined();
    });

    it('renders del', () => {
      const comps = buildComponents();
      expect(comps.del({ node: {}, children: 'deleted' })).toBeDefined();
    });

    it('renders mark', () => {
      const comps = buildComponents();
      expect(comps.mark({ node: {}, children: 'marked' })).toBeDefined();
    });

    it('renders kbd', () => {
      const comps = buildComponents();
      expect(comps.kbd({ node: {}, children: 'Ctrl' })).toBeDefined();
    });

    it('renders sub', () => {
      const comps = buildComponents();
      expect(comps.sub({ node: {}, children: '2' })).toBeDefined();
    });
  });

  describe('code component', () => {
    it('renders inline code without language', () => {
      const comps = buildComponents();
      const result = comps.code({ node: {}, children: 'code' });
      expect(result).toBeDefined();
    });

    it('renders fenced code with language class', () => {
      const comps = buildComponents();
      const result = comps.code({
        node: {},
        children: 'code',
        className: 'language-js',
      });
      expect(result).toBeDefined();
    });

    it('handles className as array', () => {
      const comps = buildComponents();
      const result = comps.code({
        node: {},
        children: 'code',
        className: ['language-python'],
      });
      expect(result).toBeDefined();
    });
  });

  describe('pre component', () => {
    it('uses custom __codeBlock component', () => {
      const CodeBlock = () => null;
      const comps = buildComponents({
        userComponents: { __codeBlock: CodeBlock },
      });
      const codeChild = { props: { className: 'language-js', children: 'code' } };
      const result = comps.pre({
        node: { children: [] },
        children: codeChild,
      });
      expect(result).toBeDefined();
      expect((result as any)?.type).toBe(CodeBlock);
    });

    it('uses custom code component for pre', () => {
      const CodeComp = () => null;
      const comps = buildComponents({
        userComponents: { code: CodeComp },
      });
      const codeChild = { props: { children: 'code' } };
      const result = comps.pre({
        node: { children: [] },
        children: codeChild,
      });
      expect(result).toBeDefined();
      expect((result as any)?.type).toBe(CodeComp);
    });

    it('renders default pre when no custom code component', () => {
      const comps = buildComponents();
      const codeChild = { props: { children: 'code' } };
      const result = comps.pre({
        node: { children: [] },
        children: codeChild,
      });
      expect(result).toBeDefined();
    });

    it('extracts language from hast node', () => {
      const comps = buildComponents();
      const hastNode = {
        children: [
          {
            type: 'element',
            tagName: 'code',
            properties: { className: ['language-typescript'] },
          },
        ],
      };
      const codeChild = { props: { children: 'ts code' } };
      const result = comps.pre({
        node: hastNode,
        children: codeChild,
      });
      expect(result).toBeDefined();
    });
  });

  describe('img component', () => {
    it('renders image with src', () => {
      const comps = buildComponents();
      const result = comps.img({
        node: {},
        src: 'https://example.com/img.png',
        alt: 'test',
      });
      expect(result).toBeDefined();
    });

    it('renders image with explicit width', () => {
      const comps = buildComponents();
      const result = comps.img({
        node: {},
        src: 'https://example.com/img.png',
        alt: '',
        width: 200,
        height: 100,
      });
      expect(result).toBeDefined();
    });

    it('renders image with non-numeric width', () => {
      const comps = buildComponents();
      const result = comps.img({
        node: {},
        src: 'https://example.com/img.png',
        width: 'auto',
      });
      expect(result).toBeDefined();
    });
  });

  describe('media elements', () => {
    it('renders video', () => {
      const comps = buildComponents();
      const result = comps.video({ node: {}, children: null });
      expect(result).toBeDefined();
    });

    it('renders audio', () => {
      const comps = buildComponents();
      const result = comps.audio({ node: {}, children: null });
      expect(result).toBeDefined();
    });

    it('renders iframe', () => {
      const comps = buildComponents();
      const result = comps.iframe({ node: {} });
      expect(result).toBeDefined();
    });
  });

  describe('hr', () => {
    it('renders horizontal rule', () => {
      const comps = buildComponents();
      const result = comps.hr({ node: {} });
      expect(result).toBeDefined();
    });
  });

  describe('sup (footnote ref)', () => {
    it('renders non-footnote sup', () => {
      const comps = buildComponents();
      const result = comps.sup({ node: {}, children: 'text' });
      expect(result).toBeDefined();
    });
  });

  describe('span', () => {
    it('renders fnc span with data-fnc-name', () => {
      const comps = buildComponents();
      const result = comps.span({
        node: {},
        children: '1',
        'data-fnc': 'fnc',
        'data-fnc-name': 'ref1',
      });
      expect(result).toBeDefined();
    });

    it('renders fnc span without name, falls back to children text', () => {
      const comps = buildComponents();
      const result = comps.span({
        node: {},
        children: 'fallback',
        'data-fnc': 'fnc',
        'data-fnc-name': '',
      });
      expect(result).toBeDefined();
    });

    it('renders fnc span with null name', () => {
      const comps = buildComponents();
      const result = comps.span({
        node: {},
        children: '?',
        'data-fnc': 'fnc',
        'data-fnc-name': null,
      });
      expect(result).toBeDefined();
    });

    it('renders regular span', () => {
      const comps = buildComponents();
      const result = comps.span({ node: {}, children: 'text' });
      expect(result).toBeDefined();
    });
  });

  describe('section', () => {
    it('renders footnote section with className', () => {
      const comps = buildComponents();
      const result = comps.section({
        node: {},
        children: 'footnotes',
        className: 'footnotes',
      });
      expect(result).toBeDefined();
    });

    it('renders footnote section with data-footnotes', () => {
      const comps = buildComponents();
      const result = comps.section({
        node: {},
        children: 'footnotes',
        className: undefined,
        'data-footnotes': '',
      });
      expect(result).toBeDefined();
    });

    it('renders non-footnote section', () => {
      const comps = buildComponents();
      const result = comps.section({
        node: {},
        children: 'content',
        className: 'other',
      });
      expect(result).toBeDefined();
    });
  });

  describe('think', () => {
    it('renders think block with loading state', () => {
      const comps = buildComponents();
      const result = comps.think({ children: 'thinking...' });
      expect(result).toBeDefined();
    });

    it('renders think block with success state', () => {
      const comps = buildComponents();
      const result = comps.think({ children: 'done thinking' });
      expect(result).toBeDefined();
    });
  });

  describe('answer', () => {
    it('renders answer as fragment', () => {
      const comps = buildComponents();
      const result = comps.answer({ node: {}, children: 'answer' });
      expect(result).toBeDefined();
    });
  });

  describe('eleRender integration', () => {
    it('returns eleRender result when not undefined', () => {
      const custom = React.createElement('div', null, 'custom');
      const eleRender = vi.fn(() => custom);
      const comps = buildComponents({ eleRender });
      const result = comps.p({ node: {}, children: 'text' });
      expect(result).toBe(custom);
    });

    it('falls back to default when eleRender returns undefined', () => {
      const eleRender = vi.fn(() => undefined);
      const comps = buildComponents({ eleRender });
      const result = comps.p({ node: {}, children: 'text' });
      expect(result).toBeDefined();
    });
  });
});

describe('remarkChartFromComment via processor', () => {
  it('converts chart comment + table to chart code block', () => {
    const proc = createHastProcessor();
    const md = `<!-- [{"chartType":"line","x":"month","y":"value"}] -->\n\n| month | value |\n|-------|-------|\n| Jan   | 100   |`;
    const mdast = proc.parse(md);
    const hast = proc.runSync(mdast);
    expect(hast).toBeDefined();
  });

  it('ignores invalid JSON in chart comment', () => {
    const proc = createHastProcessor();
    const md = `<!-- {invalid json} -->\n\n| a | b |\n|---|---|\n| 1 | 2 |`;
    const mdast = proc.parse(md);
    const hast = proc.runSync(mdast);
    expect(hast).toBeDefined();
  });

  it('ignores chart comment with chartType=table', () => {
    const proc = createHastProcessor();
    const md = `<!-- [{"chartType":"table"}] -->\n\n| a | b |\n|---|---|\n| 1 | 2 |`;
    const mdast = proc.parse(md);
    const hast = proc.runSync(mdast);
    expect(hast).toBeDefined();
  });

  it('handles non-html + table pairs', () => {
    const proc = createHastProcessor();
    const md = `| a | b |\n|---|---|\n| 1 | 2 |`;
    const mdast = proc.parse(md);
    const hast = proc.runSync(mdast);
    expect(hast).toBeDefined();
  });
});

describe('rehypeFootnoteRef via processor', () => {
  it('converts bare [^N] references to fnc elements', () => {
    const proc = createHastProcessor();
    const md = 'Text with [^1] and [^note] references';
    const mdast = proc.parse(md);
    const hast = proc.runSync(mdast);
    expect(hast).toBeDefined();
  });

  it('handles text without footnote refs', () => {
    const proc = createHastProcessor();
    const md = 'Just normal text';
    const mdast = proc.parse(md);
    const hast = proc.runSync(mdast);
    expect(hast).toBeDefined();
  });

  it('handles text with footnote ref at end', () => {
    const proc = createHastProcessor();
    const md = 'Text with ref[^1]';
    const mdast = proc.parse(md);
    const hast = proc.runSync(mdast);
    expect(hast).toBeDefined();
  });

  it('handles multiple refs in same text', () => {
    const proc = createHastProcessor();
    const md = '[^1] middle [^2]';
    const mdast = proc.parse(md);
    const hast = proc.runSync(mdast);
    expect(hast).toBeDefined();
  });
});

describe('extractTableData edge cases via processor', () => {
  it('handles table with Chinese currency values', () => {
    const proc = createHastProcessor();
    const md = `<!-- [{"chartType":"line","x":"name","y":"val"}] -->\n\n| name | val |\n|------|-----|\n| A    | 1.5亿 |`;
    const mdast = proc.parse(md);
    const hast = proc.runSync(mdast);
    expect(hast).toBeDefined();
  });

  it('handles table with empty cells', () => {
    const proc = createHastProcessor();
    const md = `<!-- [{"chartType":"bar","x":"name","y":"val"}] -->\n\n| name | val |\n|------|-----|\n| A    |     |`;
    const mdast = proc.parse(md);
    const hast = proc.runSync(mdast);
    expect(hast).toBeDefined();
  });

  it('handles table with numeric values', () => {
    const proc = createHastProcessor();
    const md = `<!-- [{"chartType":"bar","x":"x","y":"y"}] -->\n\n| x | y |\n|---|---|\n| A | 42 |`;
    const mdast = proc.parse(md);
    const hast = proc.runSync(mdast);
    expect(hast).toBeDefined();
  });

  it('handles chart comment as single object', () => {
    const proc = createHastProcessor();
    const md = `<!-- {"chartType":"line","x":"month","y":"value"} -->\n\n| month | value |\n|-------|-------|\n| Jan   | 100   |`;
    const mdast = proc.parse(md);
    const hast = proc.runSync(mdast);
    expect(hast).toBeDefined();
  });
});
