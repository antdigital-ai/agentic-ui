import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { createEditor, Descendant } from 'slate';
import { Editable, Slate, withReact } from 'slate-react';
import { describe, expect, it } from 'vitest';
import { EditorStoreTestProvider } from '../../../__tests__/helpers/editorStoreTestContext';
import { withCodeBlockPlugin } from '../../../plugins/withCodeBlockPlugin';
import { getCodeBlockPlainText } from '../../../utils/codeBlockPlainText';
import { Code } from '../index';

const initial: Descendant[] = [
  {
    type: 'code',
    language: 'markdown',
    value: '任务内容',
    children: [{ text: '' }],
  },
];

describe('SimpleCodeBlockEditor (via Code element)', () => {
  it('renders textarea and updates code value on input', () => {
    const editor = withCodeBlockPlugin(withReact(createEditor()));
    editor.children = initial;

    render(
      <EditorStoreTestProvider>
        <Slate editor={editor} initialValue={initial}>
          <Editable
            renderElement={(props) =>
              props.element.type === 'code' ? (
                <Code {...props} />
              ) : (
                <div {...props.attributes}>{props.children}</div>
              )
            }
          />
        </Slate>
      </EditorStoreTestProvider>,
    );

    const textarea = screen.getByTestId('simple-code-block-editor');
    expect(textarea).toHaveValue('任务内容');

    fireEvent.change(textarea, { target: { value: '更新后的内容' } });
    const codeNode = editor.children[0] as {
      type: string;
      value: string;
    };
    expect(getCodeBlockPlainText(codeNode)).toBe('更新后的内容');
  });

  it('Mod+A 全选 textarea 内容', () => {
    const editor = withCodeBlockPlugin(withReact(createEditor()));
    editor.children = initial;

    render(
      <EditorStoreTestProvider>
        <Slate editor={editor} initialValue={initial}>
          <Editable
            renderElement={(props) =>
              props.element.type === 'code' ? (
                <Code {...props} />
              ) : (
                <div {...props.attributes}>{props.children}</div>
              )
            }
          />
        </Slate>
      </EditorStoreTestProvider>,
    );

    const textarea = screen.getByTestId(
      'simple-code-block-editor',
    ) as HTMLTextAreaElement;
    fireEvent.keyDown(textarea, { key: 'a', ctrlKey: true });
    expect(textarea.selectionStart).toBe(0);
    expect(textarea.selectionEnd).toBe(textarea.value.length);
  });
});
