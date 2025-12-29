import { describe, expect, it } from 'vitest';
import { parserSlateNodeToMarkdown } from '../parserSlateNodeToMarkdown';

describe('parserSlateNodeToMarkdown', () => {
  describe('handleTable', () => {
    it('should handle table with dynamic column widths', () => {
      const node = {
        type: 'table',
        children: [
          {
            type: 'table-row',
            children: [
              {
                type: 'table-cell',
                align: 'left',
                children: [{ text: 'Short' }],
              },
              {
                type: 'table-cell',
                align: 'center',
                children: [{ text: 'Medium Column' }],
              },
              {
                type: 'table-cell',
                align: 'right',
                children: [{ text: 'Very Long Column Header' }],
              },
            ],
          },
          {
            type: 'table-row',
            children: [
              {
                type: 'table-cell',
                children: [{ text: 'Data' }],
              },
              {
                type: 'table-cell',
                children: [{ text: 'More Data' }],
              },
              {
                type: 'table-cell',
                children: [{ text: 'Even More Data Here' }],
              },
            ],
          },
        ],
      };
      const result = parserSlateNodeToMarkdown([node]);
      expect(result).toBe(
        '| Short | Medium Column | Very Long Column Header |\n' +
          '| :---- | :-----------: | ----------------------: |\n' +
          '| Data  |   More Data   |     Even More Data Here |',
      );
    });

    it('should handle table with mixed content types', () => {
      const node = {
        type: 'table',
        children: [
          {
            type: 'table-row',
            children: [
              {
                type: 'table-cell',
                children: [{ text: 'Normal' }],
              },
              {
                type: 'table-cell',
                children: [{ text: 'Bold', bold: true }],
              },
              {
                type: 'table-cell',
                children: [{ text: 'Code', code: true }],
              },
            ],
          },
          {
            type: 'table-row',
            children: [
              {
                type: 'table-cell',
                children: [
                  { text: 'Mixed', italic: true },
                  { text: ' ', italic: false },
                  { text: 'Styles', bold: true },
                ],
              },
              {
                type: 'table-cell',
                children: [{ text: 'Inline Code', code: true }],
              },
              {
                type: 'table-cell',
                children: [{ text: 'Normal Text' }],
              },
            ],
          },
        ],
      };
      const result = parserSlateNodeToMarkdown([node]);
      expect(result).toBe(
        '| Normal | **Bold** | `Code` |\n' +
          '| :----------------- | :------------ | :---------- |\n' +
          '| *Mixed* **Styles** | `Inline Code` | Normal Text |',
      );
    });

    it('should handle single column table', () => {
      const node = {
        type: 'table',
        children: [
          {
            type: 'table-row',
            children: [
              {
                type: 'table-cell',
                children: [{ text: 'Content' }],
              },
            ],
          },
        ],
      };
      const result = parserSlateNodeToMarkdown([node]);
      expect(result).toBe('| Content |\n| :------ |');
    });

    it('should handle table with special characters', () => {
      const node = {
        type: 'table',
        children: [
          {
            type: 'table-row',
            children: [
              {
                type: 'table-cell',
                children: [{ text: 'Contains | Pipe' }],
              },
              {
                type: 'table-cell',
                children: [{ text: 'Contains\nNewline' }],
              },
            ],
          },
          {
            type: 'table-row',
            children: [
              {
                type: 'table-cell',
                children: [{ text: '* List Item' }],
              },
              {
                type: 'table-cell',
                children: [{ text: '> Blockquote' }],
              },
            ],
          },
        ],
      };
      const result = parserSlateNodeToMarkdown([node]);
      expect(result).toBe(
        '| Contains \\| Pipe | Contains  \nNewline |\n' +
          '| :-------------- | :---------------- |\n' +
          '| * List Item | > Blockquote |',
      );
    });
  });
});
