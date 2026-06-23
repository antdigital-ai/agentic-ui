import '@testing-library/jest-dom';
import { fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { createEditor, Descendant, type Operation } from 'slate';
import { withHistory } from 'slate-history';
import { Editable, Slate, withReact } from 'slate-react';
import { describe, expect, it, vi } from 'vitest';
import { useOnchange } from '../../../plugins/useOnchange';
import { withMarkdown } from '../../../plugins/withMarkdown';
import { parserSlateNodeToMarkdown } from '../../../utils';
import { Code } from '../index';

vi.mock('../../../../../Hooks/useDebounceFn', () => ({
  useDebounceFn: vi.fn((fn: () => void) => ({
    run: () => fn(),
    cancel: vi.fn(),
  })),
}));

const editorStoreMock = {
  readonly: false,
  setRefreshFloatBar: vi.fn(),
  setDomRect: vi.fn(),
  refreshFloatBar: false,
  markdownEditorRef: { current: null as ReturnType<typeof createEditor> | null },
  selChange$: { next: vi.fn() },
};

vi.mock('../../../store', () => ({
  useEditorStore: () => editorStoreMock,
}));

const initial: Descendant[] = [
  {
    type: 'code',
    language: 'markdown',
    value: '任务内容',
    children: [{ text: '' }],
  },
];

describe('SimpleCodeBlockEditor slate onChange', () => {
  it('typing in textarea triggers Slate onChange with updated markdown body', async () => {
    const editor = withMarkdown(withReact(withHistory(createEditor())));
    editor.children = initial;

    const onChange = vi.fn();
    let opsAtChange: Operation[] = [];

    render(
      <Slate
        editor={editor}
        initialValue={initial}
        onChange={(value) => {
          opsAtChange = [...editor.operations];
          onChange(value);
        }}
      >
        <Editable
          renderElement={(props) =>
            props.element.type === 'code' ? (
              <Code {...props} />
            ) : (
              <div {...props.attributes}>{props.children}</div>
            )
          }
        />
      </Slate>,
    );

    const textarea = screen.getByTestId('simple-code-block-editor');
    fireEvent.change(textarea, { target: { value: '新正文' } });

    await waitFor(
      () => {
        expect(onChange).toHaveBeenCalled();
        const lastCall = onChange.mock.calls.at(-1)?.[0] as Descendant[];
        const code = lastCall.find(
          (n) => (n as { type?: string }).type === 'code',
        ) as { value?: string };
        expect(code?.value).toBe('新正文');
        expect(
          opsAtChange.some(
            (o) => o.type === 'set_node' || o.type === 'insert_node',
          ),
        ).toBe(true);
      },
      { timeout: 2000 },
    );
  });

  it('useOnchange debounces markdown to parent onChange', async () => {
    const editor = withMarkdown(withReact(withHistory(createEditor())));
    editor.children = initial;

    const parentOnChange = vi.fn();
    editorStoreMock.markdownEditorRef.current = editor;

    const { result } = renderHook(() =>
      useOnchange(parentOnChange, {
        selectionTrackingEnabled: false,
      }),
    );
    const slateHandler = result.current;

    render(
      <Slate
        editor={editor}
        initialValue={initial}
        onChange={(value) => {
          slateHandler(value, [...editor.operations]);
        }}
      >
        <Editable
          renderElement={(props) =>
            props.element.type === 'code' ? (
              <Code {...props} />
            ) : (
              <div {...props.attributes}>{props.children}</div>
            )
          }
        />
      </Slate>,
    );

    fireEvent.change(screen.getByTestId('simple-code-block-editor'), {
      target: { value: '新正文' },
    });

    await waitFor(() => {
      expect(parentOnChange).toHaveBeenCalled();
      const md = parentOnChange.mock.calls.at(-1)?.[0] as string;
      expect(md).toContain('新正文');
      expect(parserSlateNodeToMarkdown(editor.children)).toContain('新正文');
    });
  });
});
