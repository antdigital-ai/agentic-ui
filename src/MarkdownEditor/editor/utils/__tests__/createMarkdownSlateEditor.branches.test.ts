import { describe, expect, it, vi } from 'vitest';
import {
  createMarkdownSlateEditor,
  getPluginsEditorCompositionKey,
  getWithEditorSlotKey,
} from '../createMarkdownSlateEditor';

describe('createMarkdownSlateEditor residual options', () => {
  it('assigns stable slots for absent, keyed, named, and anonymous plugins', () => {
    const namedPlugin = { withEditor: function decorate(editor: any) { return editor; } };
    expect(getWithEditorSlotKey({} as any)).toBe('_');
    expect(getWithEditorSlotKey({ withEditor: vi.fn(), withEditorKey: 'custom' } as any)).toBe(
      'custom',
    );
    expect(getWithEditorSlotKey(namedPlugin as any)).toBe('decorate');
    expect(getWithEditorSlotKey({ withEditor: (editor: any) => editor } as any)).toBe('w');
  });

  it('includes ordering in composition keys and accepts omitted plugins', () => {
    expect(getPluginsEditorCompositionKey()).toBe('');
    expect(
      getPluginsEditorCompositionKey([
        {},
        { withEditorKey: 'a', withEditor: (editor: any) => editor },
      ] as any),
    ).toBe('0:_|1:a');
  });

  it('creates an editor and composes supplied editor plugins', () => {
    const plugin = vi.fn((editor: any) => ({ ...editor, customPlugin: true }));
    const editor = createMarkdownSlateEditor([{ withEditor: plugin } as any]) as any;
    expect(plugin).toHaveBeenCalled();
    expect(editor.customPlugin).toBe(true);
  });
});
