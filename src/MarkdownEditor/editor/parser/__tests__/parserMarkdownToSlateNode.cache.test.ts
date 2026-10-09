import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { MarkdownEditorPlugin } from '../../../plugin';
import {
  clearParseCache,
  parserMarkdownToSlateNode,
} from '../parserMarkdownToSlateNode';

// Both paragraphs must exceed the small-block merge threshold to exercise the cache.
const markdown = `${'a'.repeat(120)}\n\n${'b'.repeat(120)}`;

function createPlugin(label: string) {
  const convert = vi.fn(() => ({
    type: 'paragraph' as const,
    children: [{ text: label }],
  }));
  const rule = {
    match: (node: { type: string }) => node.type === 'paragraph',
    convert,
  };
  const plugin: MarkdownEditorPlugin = {
    parseMarkdown: [rule],
  };
  return { plugin, convert, rule };
}

function expectParagraphs(
  result: ReturnType<typeof parserMarkdownToSlateNode>,
  label: string,
) {
  expect(result.schema).toHaveLength(2);
  for (const node of result.schema) {
    expect(node.type).toBe('paragraph');
    expect(node.children).toEqual([{ text: label }]);
  }
}

describe('parserMarkdownToSlateNode plugin cache isolation', () => {
  beforeEach(clearParseCache);

  it('isolates different plugin sets with the same number of plugins', () => {
    const first = createPlugin('first editor');
    const second = createPlugin('second editor');

    expectParagraphs(
      parserMarkdownToSlateNode(markdown, [first.plugin]),
      'first editor',
    );
    expectParagraphs(
      parserMarkdownToSlateNode(markdown, [second.plugin]),
      'second editor',
    );
    expect(second.convert).toHaveBeenCalledTimes(2);
  });

  it('preserves cache hits for the same plugins and supports clearParseCache', () => {
    const { plugin, convert } = createPlugin('cached');

    parserMarkdownToSlateNode(markdown, [plugin]);
    parserMarkdownToSlateNode(markdown, [plugin]);
    expect(convert).toHaveBeenCalledTimes(2);

    clearParseCache();
    expectParagraphs(parserMarkdownToSlateNode(markdown, [plugin]), 'cached');
    expect(convert).toHaveBeenCalledTimes(4);
  });

  it('keeps ordered plugin precedence when the same plugins are reordered', () => {
    const first = createPlugin('first');
    const second = createPlugin('second');

    expectParagraphs(
      parserMarkdownToSlateNode(markdown, [first.plugin, second.plugin]),
      'first',
    );
    expectParagraphs(
      parserMarkdownToSlateNode(markdown, [second.plugin, first.plugin]),
      'second',
    );
  });

  it('invalidates cached blocks when a rule is replaced on an existing plugin', () => {
    const { plugin } = createPlugin('old');
    parserMarkdownToSlateNode(markdown, [plugin]);
    plugin.parseMarkdown = createPlugin('updated').plugin.parseMarkdown;

    expectParagraphs(parserMarkdownToSlateNode(markdown, [plugin]), 'updated');
  });

  it('invalidates cached blocks when a converter changes on an existing rule', () => {
    const { plugin, rule } = createPlugin('old');
    parserMarkdownToSlateNode(markdown, [plugin]);
    rule.convert = createPlugin('updated').convert;

    expectParagraphs(parserMarkdownToSlateNode(markdown, [plugin]), 'updated');
  });

  it('still isolates parsing configuration for cached blocks', () => {
    const mathMarkdown = `${'a'.repeat(120)}\n\n$$\na+b\n$$`;

    const enabled = parserMarkdownToSlateNode(mathMarkdown, [], {
      formula: { enable: true },
    });
    const disabled = parserMarkdownToSlateNode(mathMarkdown, [], {
      formula: { enable: false },
    });

    expect(enabled.schema.some((node) => node.type === 'katex')).toBe(true);
    expect(disabled.schema.some((node) => node.type === 'katex')).toBe(false);
  });
});
