import { docxDeserializer } from '@ant-design/agentic-ui';
import { describe, expect, it } from 'vitest';

const testCases = [
  {
    name: 'simple paragraph',
    rtf: '',
    html: '<p>This is a simple paragraph.</p>',
    expected: [
      {
        type: 'paragraph',
        children: [{ text: 'This is a simple paragraph.' }],
      },
    ],
  },
  {
    name: 'bold text',
    rtf: '',
    html: '<p>This has <b>bold</b> text.</p>',
    expected: [
      {
        type: 'paragraph',
        children: [
          { text: 'This has ' },
          { text: 'bold', bold: true },
          { text: ' text.' },
        ],
      },
    ],
  },
  {
    name: 'italic text',
    rtf: '',
    html: '<p>This has <i>italic</i> text.</p>',
    expected: [
      {
        type: 'paragraph',
        children: [
          { text: 'This has ' },
          { text: 'italic', italic: true },
          { text: ' text.' },
        ],
      },
    ],
  },
  {
    name: 'heading 1',
    rtf: '',
    html: '<h1>Heading 1</h1>',
    expected: [
      {
        type: 'head',
        className: 'H1',
        level: 1,
        children: [{ text: 'Heading 1' }],
      },
    ],
  },
  {
    name: 'heading 2',
    rtf: '',
    html: '<h2>Heading 2</h2>',
    expected: [
      {
        type: 'head',
        className: 'H2',
        level: 2,
        children: [{ text: 'Heading 2' }],
      },
    ],
  },
  {
    name: 'heading 3',
    rtf: '',
    html: '<h3>Heading 3</h3>',
    expected: [
      {
        type: 'head',
        className: 'H3',
        level: 3,
        children: [{ text: 'Heading 3' }],
      },
    ],
  },
  {
    name: 'unordered list',
    rtf: '',
    html: '<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>',
    expected: [
      {
        type: 'bulleted-list',
        children: [
          {
            type: 'list-item',
            children: [{ text: 'Item 1' }],
          },
          {
            type: 'list-item',
            children: [{ text: 'Item 2' }],
          },
          {
            type: 'list-item',
            children: [{ text: 'Item 3' }],
          },
        ],
      },
    ],
  },
  {
    name: 'hyperlink',
    rtf: '',
    html: '<p>This is a <a href="https://example.com">link</a>.</p>',
    expected: [
      {
        type: 'paragraph',
        children: [{ text: 'This is a link.' }],
      },
    ],
  },
  {
    name: 'table',
    rtf: '',
    html: `
      <table>
        <tr>
          <td>Cell 1</td>
          <td>Cell 2</td>
        </tr>
        <tr>
          <td>Cell 3</td>
          <td>Cell 4</td>
        </tr>
      </table>
    `,
    expected: [
      {
        type: 'card',
        children: [
          {
            type: 'card-before',
            children: [{ text: '' }],
          },
          {
            type: 'table',
            children: [
              {
                type: 'table-row',
                children: [
                  {
                    type: 'table-cell',
                    children: [{ text: 'Cell 1' }],
                  },
                  {
                    type: 'table-cell',
                    children: [{ text: 'Cell 2' }],
                  },
                ],
              },
              {
                type: 'table-row',
                children: [
                  {
                    type: 'table-cell',
                    children: [{ text: 'Cell 3' }],
                  },
                  {
                    type: 'table-cell',
                    children: [{ text: 'Cell 4' }],
                  },
                ],
              },
            ],
          },
          {
            type: 'card-after',
            children: [{ text: '' }],
          },
        ],
      },
    ],
  },
  {
    name: 'mixed formatting',
    rtf: '',
    html: '<p>This has <b>bold</b> and <i>italic</i> and <b><i>both</i></b> text.</p>',
    expected: [
      {
        type: 'paragraph',
        children: [
          { text: 'This has ' },
          { text: 'bold', bold: true },
          { text: ' and ' },
          { text: 'italic', italic: true },
          { text: ' and ' },
          {
            type: 'paragraph',
            children: [{ text: 'both', italic: true }],
          },
          { text: ' text.' },
        ],
      },
    ],
  },
  {
    name: 'empty paragraph',
    rtf: '',
    html: '<p></p>',
    expected: [],
  },
];

describe('docxDeserializer', () => {
  testCases.forEach(({ name, rtf, html, expected }) => {
    it(`should correctly deserialize ${name}`, () => {
      const fragment = docxDeserializer(rtf, html);
      expect(fragment).toEqual(expected);
    });
  });
});
