import { act, cleanup, render } from '@testing-library/react';
import React, { Profiler } from 'react';
import { Transforms } from 'slate';
import { afterEach, expect, it } from 'vitest';
import { BaseMarkdownEditor } from '../../../../BaseMarkdownEditor';
import type {
  MarkdownEditorInstance,
  MarkdownEditorProps,
} from '../../../../types';

afterEach(cleanup);

it('keeps table paragraph rendering local to the edited cell', async () => {
  const editorRef = React.createRef<MarkdownEditorInstance>();
  const commits = new Map<string, number>();
  const eleItemRender: MarkdownEditorProps['eleItemRender'] = (props, dom) => {
    if (props.element.type !== 'paragraph') return dom;
    return (
      <Profiler
        id={String(props.element.id)}
        onRender={(id) => {
          commits.set(id, (commits.get(id) ?? 0) + 1);
        }}
      >
        {dom}
      </Profiler>
    );
  };

  render(
    <BaseMarkdownEditor
      editorRef={editorRef}
      floatBar={{ enable: false }}
      eleItemRender={eleItemRender}
      initSchemaValue={[
        {
          type: 'table',
          children: Array.from({ length: 20 }, (_, row) => ({
            type: 'table-row',
            children: Array.from({ length: 10 }, (_, column) => ({
              type: 'table-cell',
              children: [
                {
                  type: 'paragraph',
                  id: `${row}:${column}`,
                  children: [{ text: `Cell ${row},${column}` }],
                },
              ],
            })),
          })),
        },
      ]}
    />,
  );

  const editor = editorRef.current!.markdownEditorRef.current;
  await act(async () => {
    Transforms.select(editor, { path: [0, 0, 0, 0, 0], offset: 0 });
  });
  commits.clear();

  await act(async () => {
    Transforms.insertText(editor, 'X');
  });
  expect([...commits.keys()]).toEqual(['0:0']);

  commits.clear();
  await act(async () => {
    Transforms.select(editor, { path: [0, 0, 0, 0, 0], offset: 0 });
  });
  expect(commits.size).toBe(0);
});
