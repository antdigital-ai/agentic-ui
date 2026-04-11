import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { dragStart } from '../../../src/MarkdownEditor/editor/elements/index';

vi.mock('../../../src/MarkdownEditor/editor/store', () => ({
  useEditorStore: () => ({
    store: {},
    markdownEditorRef: { current: null },
    markdownContainerRef: { current: null },
    typewriter: false,
    readonly: false,
    editorProps: {},
  }),
}));

vi.mock('../../../src/I18n', () => ({
  I18nContext: React.createContext({ locale: {} }),
}));

describe('dragStart', () => {
  it('should prevent default and stop propagation', () => {
    const event = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as unknown as React.DragEvent;

    dragStart(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(event.stopPropagation).toHaveBeenCalled();
  });
});
