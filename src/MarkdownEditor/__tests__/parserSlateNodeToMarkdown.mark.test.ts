import { describe, expect, it } from 'vitest';
import { parserSlateNodeToMarkdown } from '../editor/parser/parserSlateNodeToMarkdown';

describe('parserSlateNodeToMarkdown mark formatting', () => {
  it('serializes mark leaves with color, background, and label attributes', () => {
    const schema = [
      {
        type: 'paragraph',
        children: [
          {
            text: 'review this',
            mark: true,
            markColor: '#1677ff',
            markBg: '#f6ffed',
            markLabel: 'TODO',
          },
        ],
      },
    ];

    expect(parserSlateNodeToMarkdown(schema)).toBe(
      '<mark color="#1677ff" bg="#f6ffed" label="TODO">review this</mark>',
    );
  });

  it('keeps nested text styling inside the mark wrapper', () => {
    const schema = [
      {
        type: 'paragraph',
        children: [
          {
            text: 'important',
            bold: true,
            mark: true,
            markColor: 'red',
          },
        ],
      },
    ];

    expect(parserSlateNodeToMarkdown(schema)).toBe(
      '<mark color="red"><b>important</b></mark>',
    );
  });
});
