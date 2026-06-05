import { createEditor } from 'slate';
import { describe, expect, it, vi } from 'vitest';
import type { MarkdownEditorPlugin } from '../../plugin';
import { composePluginEditors } from '../composePluginEditors';

describe('composePluginEditors', () => {
  it('returns base editor when plugins is empty', () => {
    const editor = createEditor();
    expect(composePluginEditors(editor, [])).toBe(editor);
  });

  it('applies withEditor for a single plugin', () => {
    const editor = createEditor();
    const marker = { applied: false };
    const plugin: MarkdownEditorPlugin = {
      withEditor: (ed) => {
        marker.applied = true;
        return ed;
      },
    };

    composePluginEditors(editor, [plugin]);
    expect(marker.applied).toBe(true);
  });

  it('applies withEditor in array order', () => {
    const editor = createEditor();
    const order: number[] = [];
    const makePlugin = (id: number): MarkdownEditorPlugin => ({
      withEditor: (ed) => {
        order.push(id);
        return ed;
      },
    });

    composePluginEditors(editor, [makePlugin(1), makePlugin(2), makePlugin(3)]);
    expect(order).toEqual([1, 2, 3]);
  });

  it('skips plugins without withEditor', () => {
    const editor = createEditor();
    const withEditor = vi.fn((ed: ReturnType<typeof createEditor>) => ed);

    composePluginEditors(editor, [
      { elements: {} },
      { withEditor },
      { parseMarkdown: [] as any },
    ]);

    expect(withEditor).toHaveBeenCalledTimes(1);
  });
});
