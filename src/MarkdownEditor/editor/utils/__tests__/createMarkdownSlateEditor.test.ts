import { describe, expect, it } from 'vitest';
import type { MarkdownEditorPlugin } from '../../../plugin';
import {
  createMarkdownSlateEditor,
  getPluginsEditorCompositionKey,
  getWithEditorSlotKey,
} from '../createMarkdownSlateEditor';

describe('getWithEditorSlotKey', () => {
  it('uses withEditorKey when set', () => {
    const plugin: MarkdownEditorPlugin = {
      withEditor: (e) => e,
      withEditorKey: 'custom-a',
    };
    expect(getWithEditorSlotKey(plugin)).toBe('custom-a');
  });

  it('uses named withEditor function name', () => {
    function withNamedMarker(editor: import('slate').Editor) {
      return editor;
    }
    expect(getWithEditorSlotKey({ withEditor: withNamedMarker })).toBe(
      'withNamedMarker',
    );
  });

  it('uses w for anonymous withEditor without key', () => {
    expect(getWithEditorSlotKey({ withEditor: (e) => e })).toBe('w');
  });
});

describe('getPluginsEditorCompositionKey', () => {
  it('changes when withEditor presence changes', () => {
    const withPlugin: MarkdownEditorPlugin = { withEditor: (e) => e };
    const without: MarkdownEditorPlugin = { elements: {} };
    expect(getPluginsEditorCompositionKey([without])).not.toBe(
      getPluginsEditorCompositionKey([withPlugin]),
    );
  });

  it('changes when withEditorKey changes at same index', () => {
    const a: MarkdownEditorPlugin[] = [
      { withEditor: (e) => e, withEditorKey: 'v1' },
    ];
    const b: MarkdownEditorPlugin[] = [
      { withEditor: (e) => e, withEditorKey: 'v2' },
    ];
    expect(getPluginsEditorCompositionKey(a)).not.toBe(
      getPluginsEditorCompositionKey(b),
    );
  });

  it('changes when named withEditor identity changes', () => {
    function withAlpha(editor: import('slate').Editor) {
      return editor;
    }
    function withBeta(editor: import('slate').Editor) {
      return editor;
    }
    expect(
      getPluginsEditorCompositionKey([{ withEditor: withAlpha }]),
    ).not.toBe(getPluginsEditorCompositionKey([{ withEditor: withBeta }]));
  });

  it('is stable for same shape and keys', () => {
    function withStable(editor: import('slate').Editor) {
      return editor;
    }
    const a: MarkdownEditorPlugin[] = [
      { withEditor: withStable },
      { parseMarkdown: [] as any },
    ];
    const b: MarkdownEditorPlugin[] = [
      { withEditor: withStable },
      { parseMarkdown: [] as any },
    ];
    expect(getPluginsEditorCompositionKey(a)).toBe(
      getPluginsEditorCompositionKey(b),
    );
  });
});

describe('createMarkdownSlateEditor', () => {
  it('returns an editor with children array', () => {
    const editor = createMarkdownSlateEditor([]);
    expect(Array.isArray(editor.children)).toBe(true);
  });
});
