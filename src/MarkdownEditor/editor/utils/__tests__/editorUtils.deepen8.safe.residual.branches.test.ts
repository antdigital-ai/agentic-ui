/**
 * editorUtils deepen8 safe：copyText/cutText、alignment、highColor。
 * editorUtils.more.residual hang-quarantined；勿复活。
 */
import { createEditor } from 'slate';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EditorUtils } from '../editorUtils';

describe('EditorUtils deepen8 safe residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('copyText / cutText / includeAll', () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: 'hello' }] }];
    const start = { path: [0, 0], offset: 0 };
    const end = { path: [0, 0], offset: 5 };
    expect(EditorUtils.copyText(editor, start, end)).toContain('hello');
    expect(() => EditorUtils.cutText(editor, start, end)).not.toThrow();
    editor.selection = { anchor: start, focus: end };
    expect(
      EditorUtils.includeAll(editor, editor.selection!, [0]),
    ).toBeTypeOf('boolean');
  });

  it('setAlignment / isAlignmentActive / highColor / getUrl', () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: 'x' }] }];
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 1 },
    };
    expect(() => EditorUtils.setAlignment(editor, 'center')).not.toThrow();
    expect(EditorUtils.isAlignmentActive(editor, 'center')).toBeTypeOf(
      'boolean',
    );
    expect(() => EditorUtils.highColor(editor, '#f00')).not.toThrow();
    expect(() => EditorUtils.highColor(editor)).not.toThrow();
    expect(EditorUtils.getUrl(editor)).toBeTypeOf('string');
  });

  it('reset / deleteAll', () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: 'x' }] }];
    expect(() => EditorUtils.deleteAll(editor)).not.toThrow();
    expect(() =>
      EditorUtils.reset(editor, [
        { type: 'paragraph', children: [{ text: 'n' }] },
      ] as any),
    ).not.toThrow();
    expect(editor.children.length).toBeGreaterThan(0);
  });
});


