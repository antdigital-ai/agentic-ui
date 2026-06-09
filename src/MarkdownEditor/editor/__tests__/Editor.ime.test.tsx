import { render } from '@testing-library/react';
import React from 'react';
import { createEditor, Editor as SlateEditor, Transforms } from 'slate';
import { withReact } from 'slate-react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SlateMarkdownEditor } from '../Editor';

interface CapturedEditableProps {
  suppressPlaceholder?: boolean;
  onCompositionStart: () => void;
  onCompositionUpdate: (event: React.CompositionEvent<HTMLDivElement>) => void;
  onCompositionEnd: (event?: React.CompositionEvent<HTMLDivElement>) => void;
}

const testState = vi.hoisted(() => ({
  editableProps: null as CapturedEditableProps | null,
  storeResult: null as any,
}));

vi.mock('../components/EditorEditable', () => ({
  EditorEditable: (props: CapturedEditableProps) => {
    testState.editableProps = props;
    return null;
  },
}));

vi.mock('../plugins/useHighlight', () => ({
  useHighlight: () => ({
    decorate: () => [],
  }),
}));

vi.mock('../plugins/useKeyboard', () => ({
  useKeyboard: () => vi.fn(),
}));

vi.mock('../plugins/useOnchange', () => ({
  useOnchange: () => vi.fn(),
}));

vi.mock('../style', () => ({
  useStyle: () => ({
    hashId: '',
  }),
}));

vi.mock('../store', () => ({
  useEditorStore: () => {
    if (!testState.storeResult) {
      throw new Error('Editor store test state is not initialized');
    }
    return testState.storeResult;
  },
}));

const createStoreResult = () => {
  const editor = withReact(createEditor());
  editor.children = [{ type: 'paragraph', children: [{ text: '' }] }];
  Transforms.select(editor, { path: [0, 0], offset: 0 });

  return {
    editor,
    storeResult: {
      store: {
        inputComposition: false,
      },
      markdownEditorRef: {
        current: editor,
      },
      markdownContainerRef: {
        current: document.createElement('div'),
      },
      readonly: false,
      setDomRect: vi.fn(),
      jinjaEnabled: false,
      editorProps: {},
    },
  };
};

const getEditableProps = () => {
  if (!testState.editableProps) {
    throw new Error('EditorEditable props were not captured');
  }
  return testState.editableProps;
};

describe('SlateMarkdownEditor IME composition', () => {
  beforeEach(() => {
    testState.editableProps = null;
    testState.storeResult = null;
  });

  it('commits compositionupdate text when compositionend data is empty', async () => {
    const { editor, storeResult } = createStoreResult();
    testState.storeResult = storeResult;

    render(
      <SlateMarkdownEditor
        initSchemaValue={[{ type: 'paragraph', children: [{ text: '' }] }]}
        prefixCls="ant-md-editor"
      />,
    );

    const editableProps = getEditableProps();

    editableProps.onCompositionStart();
    editableProps.onCompositionUpdate({
      data: '，',
    } as React.CompositionEvent<HTMLDivElement>);
    editableProps.onCompositionEnd({
      data: '',
    } as React.CompositionEvent<HTMLDivElement>);

    expect(SlateEditor.string(editor, [])).toBe('');

    await Promise.resolve();

    expect(SlateEditor.string(editor, [])).toBe('，');
  });
});
