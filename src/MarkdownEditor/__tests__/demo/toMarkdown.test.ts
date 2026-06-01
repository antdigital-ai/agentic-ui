import { describe, expect, it } from 'vitest';
import { parserSlateNodeToMarkdown } from '../../editor/parser/parserSlateNodeToMarkdown';
import { MarkdownEditorPlugin } from '../../plugin';

describe('toMarkdown plugin functionality', () => {
  it('should handle custom code block plugin', () => {
    const customCodeBlockPlugin: MarkdownEditorPlugin = {
      toMarkdown: [
        {
          match: (node: any) => node.type === 'custom-code-block',
          convert: (node: any) => ({
            type: 'code',
            lang: (node as any).language || 'text',
            value: (node as any).value || '',
          }),
        },
      ],
    };

    const slateNodes = [
      {
        type: 'custom-code-block',
        language: 'javascript',
        value: 'console.log("hello");',
        children: [{ text: 'console.log("hello");' }],
      },
    ];

    const result = parserSlateNodeToMarkdown(
      slateNodes,
      '',
      [{ root: true }],
      [customCodeBlockPlugin],
    );

    expect(result).toContain('```javascript');
    expect(result).toContain('console.log("hello");');
    expect(result).toContain('```');
  });

  it('should handle custom blockquote plugin', () => {
    const customBlockquotePlugin: MarkdownEditorPlugin = {
      toMarkdown: [
        {
          match: (node: any) => node.type === 'custom-blockquote',
          convert: (node: any) => ({
            type: 'blockquote',
            children: (node as any).children || [],
          }),
        },
      ],
    };

    const slateNodes = [
      {
        type: 'custom-blockquote',
        children: [
          {
            type: 'paragraph',
            children: [{ text: 'This is a custom quote' }],
          },
        ],
      },
    ];

    const result = parserSlateNodeToMarkdown(
      slateNodes,
      '',
      [{ root: true }],
      [customBlockquotePlugin],
    );

    expect(result).toContain('> This is a custom quote');
  });

  it('should handle custom heading plugin', () => {
    const customHeadingPlugin: MarkdownEditorPlugin = {
      toMarkdown: [
        {
          match: (node: any) => node.type === 'custom-heading',
          convert: (node: any) => ({
            type: 'heading',
            depth: (node as any).level || 1,
            children: (node as any).children || [],
          }),
        },
      ],
    };

    const slateNodes = [
      {
        type: 'custom-heading',
        level: 2,
        children: [{ text: 'Custom Heading' }],
      },
    ];

    const result = parserSlateNodeToMarkdown(
      slateNodes,
      '',
      [{ root: true }],
      [customHeadingPlugin],
    );

    expect(result).toBe('## Custom Heading');
  });

  it('should fallback to default conversion when no plugin matches', () => {
    const customPlugin: MarkdownEditorPlugin = {
      toMarkdown: [
        {
          match: (node: any) => node.type === 'nonexistent',
          convert: (_node: any) => ({
            type: 'paragraph',
            children: [],
          }),
        },
      ],
    };

    const slateNodes = [
      {
        type: 'paragraph',
        children: [{ text: 'Regular paragraph' }],
      },
    ];

    const result = parserSlateNodeToMarkdown(
      slateNodes,
      '',
      [{ root: true }],
      [customPlugin],
    );

    expect(result).toBe('Regular paragraph');
  });

  it('should work without plugins', () => {
    const slateNodes = [
      {
        type: 'head',
        level: 1,
        children: [{ text: 'Heading' }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'Paragraph text' }],
      },
    ];

    const result = parserSlateNodeToMarkdown(slateNodes);

    expect(result).toContain('# Heading');
    expect(result).toContain('Paragraph text');
  });
});
