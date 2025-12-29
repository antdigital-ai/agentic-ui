import { describe, expect, it } from 'vitest';
import { parserMarkdownToSlateNode } from '../parserMarkdownToSlateNode';

describe('Slate Integration Tests', () => {
  it('should parse **$9.698M** to Slate nodes without errors', () => {
    const markdown = '**$9.698M**';

    const result = parserMarkdownToSlateNode(markdown);

    expect(result).toBeDefined();
    expect(result.schema).toBeDefined();
    expect(Array.isArray(result.schema)).toBe(true);
    expect(result.schema.length).toBeGreaterThan(0);

    const paragraph = result.schema[0];
    expect(paragraph.type).toBe('paragraph');
    expect(Array.isArray(paragraph.children)).toBe(true);
    expect(paragraph.children.length).toBeGreaterThan(0);

    const boldText = paragraph.children.find((child: any) => child.bold);
    expect(boldText).toBeDefined();
    expect(boldText.text).toBe('$9.698M');
    expect(boldText.bold).toBe(true);
  });

  it('should handle inlineMath within bold text correctly', () => {
    const complexMarkdown = 'Text with **bold $$x = 1$$ inside** here';
    const complexResult = parserMarkdownToSlateNode(complexMarkdown);

    expect(complexResult).toBeDefined();
    expect(complexResult.schema[0].children).toBeDefined();
  });

  it('should parse mixed text with **$9.698M** to Slate nodes without errors', () => {
    const markdown = 'Revenue is **$9.698M** this quarter.';

    const result = parserMarkdownToSlateNode(markdown);

    expect(result).toBeDefined();
    expect(result.schema).toBeDefined();
    expect(Array.isArray(result.schema)).toBe(true);
    expect(result.schema.length).toBeGreaterThan(0);

    const paragraph = result.schema[0];
    expect(paragraph.type).toBe('paragraph');
    expect(Array.isArray(paragraph.children)).toBe(true);
    expect(paragraph.children.length).toBeGreaterThan(0);

    const boldText = paragraph.children.find((child: any) => child.bold);
    expect(boldText).toBeDefined();
    expect(boldText.text).toBe('$9.698M');
    expect(boldText.bold).toBe(true);

    const normalTexts = paragraph.children.filter((child: any) => !child.bold);
    expect(normalTexts.length).toBeGreaterThan(0);
  });

  it('should handle multiple bold text with dollar amounts in one line', () => {
    const markdown = 'Revenue **$9.698M** and profit **$2.5M**.';

    const result = parserMarkdownToSlateNode(markdown);

    expect(result).toBeDefined();
    expect(result.schema).toBeDefined();
    expect(Array.isArray(result.schema)).toBe(true);
    expect(result.schema.length).toBeGreaterThan(0);

    const paragraph = result.schema[0];
    expect(paragraph.type).toBe('paragraph');
    expect(Array.isArray(paragraph.children)).toBe(true);
    expect(paragraph.children.length).toBeGreaterThan(0);

    const boldTexts = paragraph.children.filter((child: any) => child.bold);
    expect(boldTexts.length).toBe(2);
    const [firstBold, secondBold] = boldTexts;
    expect(firstBold?.type).toBe('inline-katex');
    expect(firstBold?.children?.[0]?.text).toContain('9.698M');
    expect(secondBold?.text).toBe('2.5M');
  });

  it('should ensure all nodes have proper children arrays', () => {
    const markdown = '**$9.698M**';

    const result = parserMarkdownToSlateNode(markdown);

    function checkNodeStructure(node: any) {
      if (node.children) {
        expect(Array.isArray(node.children)).toBe(true);
        node.children.forEach((child: any) => {
          checkNodeStructure(child);
        });
      }
      if (!node.children) {
        expect(node.text).toBeDefined();
      }
    }

    result.schema.forEach(checkNodeStructure);
  });
});
