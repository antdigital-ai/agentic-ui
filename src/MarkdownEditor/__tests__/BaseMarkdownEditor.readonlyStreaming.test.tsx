import '@testing-library/jest-dom';

import { render, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { BaseMarkdownEditor } from '../BaseMarkdownEditor';
import type { MarkdownEditorInstance } from '../types';

describe('BaseMarkdownEditor readonly streaming', () => {
  it('updates Slate readonly content from growing initValue without duplicating list roots', async () => {
    const editorRef = React.createRef<MarkdownEditorInstance>();
    const firstChunk = '- Alpha';
    const finalChunk = '- Alpha\n- Beta\n- Gamma';
    const { container, rerender } = render(
      <BaseMarkdownEditor
        readonly
        toc={false}
        floatBar={{ enable: false }}
        initValue={firstChunk}
        editorRef={editorRef}
      />,
    );

    await waitFor(() => {
      expect(editorRef.current?.store.getMDContent().trim()).toBe('- Alpha');
    });

    rerender(
      <BaseMarkdownEditor
        readonly
        toc={false}
        floatBar={{ enable: false }}
        initValue={finalChunk}
        editorRef={editorRef}
      />,
    );

    await waitFor(() => {
      expect(editorRef.current?.store.getMDContent().trim()).toBe(finalChunk);
    });

    expect(container.querySelectorAll('[data-be="list"]')).toHaveLength(1);
    expect(container.querySelectorAll('[data-be="list-item"]')).toHaveLength(3);
  });
});
