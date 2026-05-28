import { describe, expect, it } from 'vitest';
import { deserialize } from '../insertParsedHtmlNodes';

const deserializeHtml = (html: string) => {
  const root = document.createElement('div');
  root.innerHTML = html;
  return deserialize(root);
};

describe('insertParsedHtmlNodes deserialize', () => {
  it('should preserve pasted mark color bg and label attributes', () => {
    const result = deserializeHtml(
      '<p>prefix <mark color="#fff" bg="#1677ff" label="Important">marked</mark> suffix</p>',
    );

    expect(result).toEqual([
      {
        type: 'paragraph',
        children: [
          { text: 'prefix ' },
          {
            text: 'marked',
            mark: true,
            markColor: '#fff',
            markBg: '#1677ff',
            markLabel: 'Important',
          },
          { text: ' suffix' },
        ],
      },
    ]);
  });
});
