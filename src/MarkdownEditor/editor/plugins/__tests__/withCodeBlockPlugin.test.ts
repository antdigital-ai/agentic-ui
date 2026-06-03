import { createEditor } from 'slate';
import { describe, expect, it } from 'vitest';
import { withCodeBlockPlugin } from '../withCodeBlockPlugin';

describe('withCodeBlockPlugin', () => {
  it('code 块为 void', () => {
    const editor = withCodeBlockPlugin(createEditor());
    expect(
      editor.isVoid({
        type: 'code',
        value: 'x',
        children: [{ text: '' }],
      }),
    ).toBe(true);
  });

  it('paragraph 非 void', () => {
    const editor = withCodeBlockPlugin(createEditor());
    expect(
      editor.isVoid({
        type: 'paragraph',
        children: [{ text: '' }],
      }),
    ).toBe(false);
  });
});
