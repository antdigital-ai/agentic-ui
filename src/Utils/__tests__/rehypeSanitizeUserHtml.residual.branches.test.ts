import { describe, expect, it } from 'vitest';
import { rehypeSanitizeUserHtml } from '../rehypeSanitizeUserHtml';

describe('rehypeSanitizeUserHtml residual branches', () => {
  it('removes dangerous nodes and unwraps nested structural nodes', () => {
    const tree: any = {
      type: 'root',
      children: [
        { type: 'doctype' },
        { type: 'element', tagName: 'script', properties: {}, children: [] },
        {
          type: 'element',
          tagName: 'form',
          properties: {},
          children: [
            { type: 'element', tagName: 'button', properties: {}, children: [{ type: 'text', value: 'ok' }] },
          ],
        },
      ],
    };
    rehypeSanitizeUserHtml()(tree);
    expect(tree.children).toEqual([{ type: 'text', value: 'ok' }]);
  });

  it('keeps task checkboxes but removes event and dangerous URL properties', () => {
    const tree: any = {
      type: 'root',
      children: [
        {
          type: 'element',
          tagName: 'input',
          properties: { type: 'checkbox', onclick: 'bad', href: 'javascript:bad' },
          children: [],
        },
        { type: 'element', tagName: 'input', properties: { type: 'text' }, children: [] },
      ],
    };
    rehypeSanitizeUserHtml()(tree);
    expect(tree.children).toHaveLength(1);
    expect(tree.children[0].properties).toEqual({ type: 'checkbox' });
  });
});
