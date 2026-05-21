import { render, screen, waitFor } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React, { createRef } from 'react';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import { Slate, withReact } from 'slate-react';
import { beforeEach, describe, expect, it } from 'vitest';
import { EditorStoreContext } from '../../../store';
import { EditorEditable } from '../index';

describe('EditorEditable placeholder', () => {
  const containerRef = createRef<HTMLDivElement>();

  beforeEach(() => {
    containerRef.current = document.createElement('div');
    document.body.appendChild(containerRef.current);
  });

  it('空段落时应渲染 Slate 原生 placeholder', async () => {
    const editor = withHistory(withReact(createEditor()));
    editor.children = [{ type: 'paragraph', children: [{ text: '' }] }];

    render(
      <ConfigProvider>
        <EditorStoreContext.Provider
          value={{
            editorProps: { placeholder: 'Type here' },
            readonly: false,
            markdownContainerRef: containerRef,
          } as any}
        >
          <Slate editor={editor} initialValue={editor.children}>
            <EditorEditable readOnly={false} />
          </Slate>
        </EditorStoreContext.Provider>
      </ConfigProvider>,
    );

    await waitFor(() => {
      const node = document.querySelector('[data-slate-placeholder="true"]');
      expect(node).toHaveTextContent('Type here');
    });
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('含 tag 子节点时不渲染 placeholder', async () => {
    const editor = withHistory(withReact(createEditor()));
    editor.children = [
      {
        type: 'paragraph',
        children: [{ text: '', tag: true } as { text: string; tag: boolean }],
      },
    ];

    render(
      <ConfigProvider>
        <EditorStoreContext.Provider
          value={{
            editorProps: { placeholder: 'Should not show' },
            readonly: false,
            markdownContainerRef: containerRef,
          } as any}
        >
          <Slate editor={editor} initialValue={editor.children}>
            <EditorEditable readOnly={false} />
          </Slate>
        </EditorStoreContext.Provider>
      </ConfigProvider>,
    );

    await waitFor(() => {
      expect(
        document.querySelector('[data-slate-placeholder="true"]'),
      ).toBeNull();
    });
  });
});
