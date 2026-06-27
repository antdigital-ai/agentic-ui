import { render } from '@testing-library/react';
import React from 'react';
import type { Plugin } from 'unified';
import { describe, expect, it } from 'vitest';
import { MarkdownRenderer } from '../../index';
import { createHastProcessor } from '../../processor';
import {
  createStreamingTokenPlugin,
  STREAM_TOKEN_CLASS,
  type StreamingTokenState,
} from '../rehypeStreamingTokens';

const countTokens = (root: HTMLElement) =>
  root.querySelectorAll(`.${STREAM_TOKEN_CLASS}`).length;

describe('createStreamingTokenPlugin (hast transform)', () => {
  const runProcessor = (md: string, state: StreamingTokenState) => {
    const processor = createHastProcessor(
      undefined,
      undefined,
      undefined,
      undefined,
      state,
    );
    const mdast = processor.parse(md);
    return processor.runSync(mdast) as any;
  };

  const collectSpanTokens = (node: any, acc: string[] = []): string[] => {
    if (!node) return acc;
    if (
      node.type === 'element' &&
      node.tagName === 'span' &&
      Array.isArray(node.properties?.className) &&
      node.properties.className.includes(STREAM_TOKEN_CLASS)
    ) {
      const text = (node.children || [])
        .map((c: any) => (c.type === 'text' ? c.value : ''))
        .join('');
      acc.push(text);
      return acc;
    }
    (node.children || []).forEach((child: any) =>
      collectSpanTokens(child, acc),
    );
    return acc;
  };

  it('does nothing when disabled', () => {
    const hast = runProcessor('hello world', { enabled: false });
    expect(collectSpanTokens(hast)).toEqual([]);
  });

  it('wraps each visible word in a token span when enabled', () => {
    const hast = runProcessor('hello world', { enabled: true });
    expect(collectSpanTokens(hast)).toEqual(['hello', 'world']);
  });

  it('keeps fenced code untouched', () => {
    const hast = runProcessor('```js\nconst a = 1;\n```', { enabled: true });
    expect(collectSpanTokens(hast)).toEqual([]);
  });

  it('keeps inline code untouched', () => {
    const hast = runProcessor('text `inlineCode` end', { enabled: true });
    const tokens = collectSpanTokens(hast);
    expect(tokens).toContain('text');
    expect(tokens).toContain('end');
    expect(tokens).not.toContain('inlineCode');
  });

  it('keeps KaTeX formula output untouched', () => {
    const hast = runProcessor(
      [
        'before formula',
        '',
        '$$',
        'a^2 + b^2 = c^2',
        '$$',
        '',
        'after formula',
      ].join('\n'),
      { enabled: true },
    );
    const tokens = collectSpanTokens(hast);
    expect(tokens).toEqual(['before', 'formula', 'after', 'formula']);
  });

  it('reads the enabled flag live from the shared state object', () => {
    const state: StreamingTokenState = { enabled: false };
    const processor = createHastProcessor(
      undefined,
      undefined,
      undefined,
      undefined,
      state,
    );
    const parse = () => processor.runSync(processor.parse('alpha beta')) as any;

    expect(collectSpanTokens(parse())).toEqual([]);
    state.enabled = true;
    expect(collectSpanTokens(parse())).toEqual(['alpha', 'beta']);
  });

  it('wraps a standalone plugin transform without crashing', () => {
    const plugin = createStreamingTokenPlugin({ enabled: true });
    const transform = (plugin as any)();
    const tree = {
      type: 'root',
      children: [{ type: 'text', value: 'a b' }],
    };
    transform(tree);
    expect(tree.children).toHaveLength(3);
  });

  it('keeps KaTeX math content untouched', () => {
    const plugin = createStreamingTokenPlugin({ enabled: true });
    const transform = (plugin as any)();
    const tree = {
      type: 'root',
      children: [
        {
          type: 'element',
          tagName: 'span',
          properties: { className: ['katex'] },
          children: [{ type: 'text', value: 'E = mc^2' }],
        },
      ],
    };

    transform(tree);

    expect(collectSpanTokens(tree)).toEqual([]);
    expect(tree.children[0].children[0]).toEqual({
      type: 'text',
      value: 'E = mc^2',
    });
  });

  it.each(['style', 'script', 'textarea'])(
    'keeps raw %s text untouched',
    (tagName) => {
      const plugin = createStreamingTokenPlugin({ enabled: true });
      const transform = (plugin as any)();
      const tree = {
        type: 'root',
        children: [
          {
            type: 'element',
            tagName,
            children: [{ type: 'text', value: 'const value = "a b";' }],
          },
        ],
      };

      transform(tree);

      expect(collectSpanTokens(tree)).toEqual([]);
      expect(tree.children[0].children[0]).toEqual({
        type: 'text',
        value: 'const value = "a b";',
      });
    },
  );

  it('keeps KaTeX math content untouched when className is a string', () => {
    const plugin = createStreamingTokenPlugin({ enabled: true });
    const transform = (plugin as any)();
    const tree = {
      type: 'root',
      children: [
        {
          type: 'element',
          tagName: 'span',
          properties: { className: 'katex-display' },
          children: [{ type: 'text', value: 'x + y' }],
        },
      ],
    };

    transform(tree);

    expect(collectSpanTokens(tree)).toEqual([]);
    expect(tree.children[0].children[0]).toEqual({
      type: 'text',
      value: 'x + y',
    });
  });

  it('wraps visible text added by custom rehype plugins registered before it', () => {
    const appendVisibleTextPlugin: Plugin = () => (tree: any) => {
      tree.children = [
        ...(tree.children || []),
        {
          type: 'element',
          tagName: 'p',
          properties: {},
          children: [{ type: 'text', value: 'added by rehype' }],
        },
      ];
    };
    const processor = createHastProcessor(
      undefined,
      undefined,
      undefined,
      [appendVisibleTextPlugin],
      { enabled: true },
    );
    const hast = processor.runSync(processor.parse('source')) as any;

    expect(collectSpanTokens(hast)).toEqual([
      'source',
      'added',
      'by',
      'rehype',
    ]);
  });
});

describe('MarkdownRenderer streaming fade integration', () => {
  const throttleOff = { enabled: false } as const;

  it('emits token spans while streaming', () => {
    const { container } = render(
      <MarkdownRenderer
        content="hello world from gpt"
        streaming
        throttleOptions={throttleOff}
      />,
    );
    expect(countTokens(container as HTMLElement)).toBeGreaterThan(0);
  });

  it('marks the content container with the streaming class', () => {
    const { container } = render(
      <MarkdownRenderer
        content="streaming text"
        streaming
        throttleOptions={throttleOff}
      />,
    );
    expect(
      container.querySelector('[class*="content-streaming"]'),
    ).not.toBeNull();
  });

  it('does not emit token spans when not streaming', () => {
    const { container } = render(<MarkdownRenderer content="hello world" />);
    expect(countTokens(container as HTMLElement)).toBe(0);
  });

  it('does not emit token spans when throttleOptions.fade is false', () => {
    const { container } = render(
      <MarkdownRenderer
        content="hello world"
        streaming
        throttleOptions={{ enabled: false, fade: false }}
      />,
    );
    expect(countTokens(container as HTMLElement)).toBe(0);
    expect(container.querySelector('[class*="content-streaming"]')).toBeNull();
  });

  it('preserves rendered text content with token spans', () => {
    const { container } = render(
      <MarkdownRenderer
        content="The quick brown fox"
        streaming
        throttleOptions={throttleOff}
      />,
    );
    expect(container.textContent).toContain('The quick brown fox');
  });

  it('reuses existing token DOM when streaming appends words', () => {
    const { container, rerender } = render(
      <MarkdownRenderer
        content="Hello"
        streaming
        throttleOptions={throttleOff}
      />,
    );
    const firstToken = container.querySelector(`.${STREAM_TOKEN_CLASS}`);

    expect(firstToken).not.toBeNull();
    expect(firstToken?.textContent).toBe('Hello');

    rerender(
      <MarkdownRenderer
        content="Hello world"
        streaming
        throttleOptions={throttleOff}
      />,
    );

    const tokens = container.querySelectorAll(`.${STREAM_TOKEN_CLASS}`);
    expect(tokens).toHaveLength(2);
    expect(tokens[0]).toBe(firstToken);
    expect(tokens[0]?.textContent).toBe('Hello');
    expect(tokens[1]?.textContent).toBe('world');
    expect(container.textContent).toContain('Hello world');
  });
});
