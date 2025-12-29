import { isMarkdown } from '@ant-design/agentic-ui';
import { describe, expect, it } from 'vitest';

describe('isMarkdown', () => {
  // Test for Markdown tables
  it('should identify Markdown tables', () => {
    const markdownTable = `
<!-- {"MarkdownType": "report", "id": "8", "section_ids": " [15, 16, 17] "} -->
| Header 1 | Header 2 |
| -------- | -------- |
| Cell 1   | Cell 2   |
| Cell 3   | Cell 4   |
`;
    expect(isMarkdown(markdownTable)).toBe(true);
  });

  // Test for headers
  it('should identify Markdown headers', () => {
    expect(isMarkdown('# Header 1')).toBe(true);
    expect(isMarkdown('## Header 2')).toBe(true);
    expect(isMarkdown('### Header 3')).toBe(true);
  });

  // Test for links
  it('should identify Markdown links', () => {
    expect(isMarkdown('[link text](https://example.com)')).toBe(true);
  });

  // Test for images
  it('should identify Markdown images', () => {
    expect(isMarkdown('![alt text](image.jpg)')).toBe(true);
  });

  // Test for code blocks
  it('should identify Markdown code blocks', () => {
    expect(isMarkdown('```\ncode block\n```')).toBe(true);
    expect(isMarkdown('```javascript\nconst x = 1;\n```')).toBe(true);
  });

  // Test for inline code
  it('should identify Markdown inline code', () => {
    expect(isMarkdown('This is `inline code`')).toBe(true);
  });

  // Test for blockquotes
  it('should identify Markdown blockquotes', () => {
    expect(isMarkdown('> This is a blockquote')).toBe(true);
  });

  // Test for bold text
  it('should identify Markdown bold text', () => {
    expect(isMarkdown('This is **bold** text')).toBe(true);
    expect(isMarkdown('This is __bold__ text')).toBe(true);
  });

  // Test for italic text
  it('should identify Markdown italic text', () => {
    expect(isMarkdown('This is *italic* text')).toBe(true);
    expect(isMarkdown('This is _italic_ text')).toBe(false);
  });

  // Test for strikethrough
  it('should identify Markdown strikethrough', () => {
    expect(isMarkdown('This is ~~strikethrough~~ text')).toBe(true);
  });

  // Test for horizontal rules
  it('should identify Markdown horizontal rules', () => {
    expect(isMarkdown('---')).toBe(true);
    expect(isMarkdown('***')).toBe(true);
    expect(isMarkdown('===')).toBe(true);
  });

  // Test for complex Markdown
  it('should identify complex Markdown', () => {
    const complexMarkdown = `# Title
    
## Subtitle

This is a paragraph with **bold**, *italic*, and ~~strikethrough~~ text.

> This is a blockquote

\`\`\`javascript
const code = 'block';
\`\`\`

| Header 1 | Header 2 |
| -------- | -------- |
| Cell 1   | Cell 2   |
`;
    expect(isMarkdown(complexMarkdown)).toBe(true);
  });

  // Test for non-Markdown text
  it('should return false for plain text without Markdown', () => {
    expect(
      isMarkdown('This is just plain text without any markdown formatting.'),
    ).toBe(false);
    expect(isMarkdown('   ')).toBe(false);
    expect(isMarkdown('')).toBe(false);
  });

  // Test edge cases
  it('should handle edge cases properly', () => {
    // Text that looks similar to markdown but isn't
    expect(isMarkdown('This has an asterisk * but not italic')).toBe(false);
    expect(isMarkdown('2 > 1 is true (not a blockquote)')).toBe(false);

    // Ambiguous cases should be tested based on expected behavior
    expect(isMarkdown('a|b|c\n-|-|-\n1|2|3')).toBe(true); // Simplified table without spaces
  });
});
