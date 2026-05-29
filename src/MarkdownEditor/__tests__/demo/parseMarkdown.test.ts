import { Blockquote, Code } from 'mdast';
import { describe, expect, it } from 'vitest';
import { parserMarkdownToSlateNode } from '../../editor/parser/parserMarkdownToSlateNode';
import { MarkdownEditorPlugin } from '../../plugin';

describe('parseMarkdown plugin functionality', () => {
  it('should handle custom code block plugin', () => {
    const customCodeBlockPlugin: MarkdownEditorPlugin = {
      parseMarkdown: [
        {
          match: (node): node is Code =>
            node.type === 'code' && (node as Code).lang === 'custom',
          convert: (node) => {
            const codeNode = node as Code;
            return {
              type: 'code',
              language: codeNode.lang || 'text',
              value: codeNode.value,
              children: [{ text: codeNode.value }],
            };
          },
        },
      ],
    };

    const markdown = '```custom\nconsole.log("hello");\n```';
    const result = parserMarkdownToSlateNode(markdown, [customCodeBlockPlugin]);

    expect(result.schema).toHaveLength(1);
    expect(result.schema[0].type).toBe('code');
    expect((result.schema[0] as any).language).toBe('custom');
    expect((result.schema[0] as any).value).toBe('console.log("hello");');
  });

  it('should handle custom blockquote plugin', () => {
    const customBlockquotePlugin: MarkdownEditorPlugin = {
      parseMarkdown: [
        {
          match: (node): node is Blockquote => node.type === 'blockquote',
          convert: () => ({
            type: 'blockquote',
            children: [
              {
                type: 'paragraph',
                children: [{ text: 'Custom blockquote content' }],
              },
            ],
          }),
        },
      ],
    };

    const markdown = '> This is a quote';
    const result = parserMarkdownToSlateNode(markdown, [
      customBlockquotePlugin,
    ]);

    expect(result.schema).toHaveLength(1);
    expect(result.schema[0].type).toBe('blockquote');
  });

  it('should fallback to default parsing when no plugin matches', () => {
    const customPlugin: MarkdownEditorPlugin = {
      parseMarkdown: [
        {
          match: (node) => node.type === 'nonexistent',
          convert: () => ({
            type: 'paragraph',
            children: [{ text: 'custom' }],
          }),
        },
      ],
    };

    const markdown = '# Heading';
    const result = parserMarkdownToSlateNode(markdown, [customPlugin]);

    expect(result.schema).toHaveLength(1);
    expect(result.schema[0].type).toBe('head');
    expect((result.schema[0] as any).level).toBe(1);
  });

  it('should work without plugins', () => {
    const markdown = '# Heading\n\nParagraph text';
    const result = parserMarkdownToSlateNode(markdown);

    expect(result.schema).toHaveLength(2);
    expect(result.schema[0].type).toBe('head');
    expect(result.schema[1].type).toBe('paragraph');
  });

  it('should preserve inline mark attributes in parsed leaves', () => {
    const markdown =
      'Status <mark color="red" bg="#fff3cd" label="Risk">needs review</mark> now';
    const result = parserMarkdownToSlateNode(markdown);

    expect(result.schema).toHaveLength(1);
    expect(result.schema[0].type).toBe('paragraph');
    expect((result.schema[0] as any).children).toEqual([
      { text: 'Status ' },
      {
        text: 'needs review',
        mark: true,
        markColor: 'red',
        markBg: '#fff3cd',
        markLabel: 'Risk',
      },
      { text: ' now' },
    ]);
  });

  it('should handle multiple plugins with priority', () => {
    const plugin1: MarkdownEditorPlugin = {
      parseMarkdown: [
        {
          match: (node): node is Code => node.type === 'code',
          convert: () => ({
            type: 'code',
            language: 'plugin1',
            value: 'plugin1',
            children: [{ text: 'plugin1' }],
          }),
        },
      ],
    };

    const plugin2: MarkdownEditorPlugin = {
      parseMarkdown: [
        {
          match: (node): node is Code => node.type === 'code',
          convert: () => ({
            type: 'code',
            language: 'plugin2',
            value: 'plugin2',
            children: [{ text: 'plugin2' }],
          }),
        },
      ],
    };

    const markdown = '```\ncode\n```';
    const result = parserMarkdownToSlateNode(markdown, [plugin1, plugin2]);

    // 第一个匹配的插件应该被使用
    expect(result.schema).toHaveLength(1);
    expect(result.schema[0].type).toBe('code');
    expect((result.schema[0] as any).language).toBe('plugin1');
  });
});
