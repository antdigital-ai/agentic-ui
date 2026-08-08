import { createEditor, Transforms } from 'slate';
import { describe, expect, it, vi } from 'vitest';
import { withLinkAndMediaPlugin } from '../withLinkAndMediaPlugin';

describe('withLinkAndMediaPlugin trailing spaces', () => {
  it('keeps a single trailing space in a URL leaf', () => {
    const editor = withLinkAndMediaPlugin(createEditor());
    editor.children = [{ type: 'paragraph', children: [{ text: 'url', url: 'https://x' }] }] as any;
    const insert = vi.spyOn(Transforms, 'insertNodes');
    editor.apply({ type: 'insert_text', path: [0, 0], offset: 3, text: ' ' } as any);
    expect(insert).not.toHaveBeenCalled();
    insert.mockRestore();
  });

  it('moves the second ending whitespace outside a URL leaf', () => {
    const editor = withLinkAndMediaPlugin(createEditor());
    editor.children = [{ type: 'paragraph', children: [{ text: 'url ', url: 'https://x' }] }] as any;
    const insert = vi.spyOn(Transforms, 'insertNodes').mockImplementation(() => undefined as any);
    editor.apply({ type: 'insert_text', path: [0, 0], offset: 4, text: ' ' } as any);
    expect(insert).toHaveBeenCalledWith(
      editor,
      [{ text: ' ' }],
      expect.objectContaining({ at: [0, 1], select: true }),
    );
    insert.mockRestore();
  });
});
