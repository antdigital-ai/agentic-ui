import { act, render, waitFor } from '@testing-library/react';
import React from 'react';
import { createEditor, Transforms } from 'slate';
import { Slate, withReact } from 'slate-react';
import { describe, expect, it, vi } from 'vitest';
import { EditorStoreContext } from '../../../store';
import * as placeholder from '../../../utils/canUseSlateNativePlaceholder';
import { EditorEditable } from '../index';

const editableRender = vi.hoisted(() => vi.fn());
vi.mock('slate-react', async (importOriginal) => {
  const original = await importOriginal<typeof import('slate-react')>();
  return {
    ...original,
    Editable: (props: React.ComponentProps<typeof original.Editable>) => {
      editableRender();
      return <original.Editable {...props} />;
    },
  };
});

describe('EditorEditable selection subscription', () => {
  it('does not rerender the shell or rescan unchanged text while selection moves', async () => {
    const editor = withReact(createEditor());
    const checkPlaceholder = vi.spyOn(
      placeholder,
      'canUseSlateNativePlaceholder',
    );
    try {
      const { container } = render(
        <EditorStoreContext.Provider
          value={
            {
              editorProps: { placeholder: 'Write here' },
              readonly: false,
            } as React.ContextType<typeof EditorStoreContext>
          }
        >
          <Slate
            editor={editor}
            initialValue={[
              { type: 'paragraph', children: [{ text: 'hello' }] },
            ]}
          >
            <EditorEditable />
          </Slate>
        </EditorStoreContext.Provider>,
      );
      editableRender.mockClear();
      checkPlaceholder.mockClear();

      for (let i = 0; i < 20; i++) {
        await act(async () => {
          Transforms.select(editor, { path: [0, 0], offset: i % 5 });
          await Promise.resolve();
        });
      }
      expect(editableRender).not.toHaveBeenCalled();
      expect(checkPlaceholder).not.toHaveBeenCalled();

      await act(async () => {
        Transforms.insertText(editor, 'x');
        await Promise.resolve();
      });
      expect(editableRender).not.toHaveBeenCalled();
      expect(checkPlaceholder).toHaveBeenCalledTimes(1);

      await act(async () => {
        Transforms.delete(editor, {
          at: {
            anchor: { path: [0, 0], offset: 0 },
            focus: { path: [0, 0], offset: 6 },
          },
        });
        await Promise.resolve();
      });
      expect(editableRender).toHaveBeenCalledTimes(1);
      await waitFor(() => {
        expect(
          container.querySelector('[data-slate-placeholder]'),
        ).toHaveTextContent('Write here');
      });
    } finally {
      checkPlaceholder.mockRestore();
    }
  });
});
