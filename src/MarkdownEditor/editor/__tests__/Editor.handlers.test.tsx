import { render } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PluginContext } from '../../plugin';
import type { MEditorProps } from '../Editor';
import * as editorUtilsModule from '../utils/editorUtils';

let editableProps: Record<string, any> = {};
const setDomRect = vi.fn();
const mockEditorRef = {
  current: {
    children: [{ type: 'paragraph', children: [{ text: 'hello' }] }],
    selection: null,
    operations: [],
    getFragment: () => [],
  },
} as any;

vi.mock('slate-react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('slate-react')>();
  return {
    ...actual,
    Slate: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    Editable: (props: Record<string, any>) => {
      editableProps = props;
      return <div data-testid="mock-editable" />;
    },
  };
});

vi.mock('../../Hooks/useRefFunction', () => ({
  useRefFunction: (fn: (...args: any[]) => any) => fn,
}));

vi.mock('../plugins/useKeyboard', () => ({
  useKeyboard: () => vi.fn(),
}));

vi.mock('../plugins/useOnchange', () => ({
  useOnchange: () => vi.fn(),
}));

vi.mock('../plugins/useHighlight', () => ({
  useHighlight: () => () => [],
}));

vi.mock('../style', () => ({
  useStyle: () => ({
    wrapSSR: (node: React.ReactNode) => node,
    hashId: '',
  }),
}));

vi.mock('../store', () => ({
  useEditorStore: () => ({
    store: { inputComposition: false },
    markdownEditorRef: mockEditorRef,
    markdownContainerRef: { current: document.createElement('div') },
    readonly: false,
    setDomRect,
  }),
}));

import { SlateMarkdownEditor } from '../Editor';

describe('SlateMarkdownEditor handler coverage', () => {
  const renderEditor = (props: Partial<MEditorProps> = {}) => {
    const baseProps = {
      prefixCls: 'ant-agentic-md-editor',
      instance: undefined,
      initSchemaValue: [{ type: 'paragraph', children: [{ text: 'hello' }] }],
    } as any;
    return render(
      <PluginContext.Provider value={[]}>
        <SlateMarkdownEditor {...baseProps} {...props} />
      </PluginContext.Provider>,
    );
  };

  beforeEach(() => {
    editableProps = {};
    setDomRect.mockClear();
    mockEditorRef.current.selection = null;
  });

  it('onDragOver should prevent default', () => {
    renderEditor();
    const event = { preventDefault: vi.fn() } as any;
    editableProps.onDragOver(event);
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('onCopy/onCut fallback should call preventDefault', () => {
    const handledSpy = vi
      .spyOn(editorUtilsModule, 'isEventHandled')
      .mockReturnValue(true);
    renderEditor();

    const copyEvent = {
      preventDefault: vi.fn(),
      clipboardData: { clearData: vi.fn(), setData: vi.fn() },
      target: document.createElement('div'),
    } as any;
    const cutEvent = {
      preventDefault: vi.fn(),
      clipboardData: { clearData: vi.fn(), setData: vi.fn() },
      target: document.createElement('div'),
    } as any;

    editableProps.onCopy(copyEvent);
    editableProps.onCut(cutEvent);

    expect(copyEvent.preventDefault).toHaveBeenCalled();
    expect(cutEvent.preventDefault).toHaveBeenCalled();
    handledSpy.mockRestore();
  });

  it('onFocus and onBlur should trigger callbacks', () => {
    const onFocus = vi.fn();
    renderEditor({ onFocus });
    editableProps.onFocus({ type: 'focus' });
    editableProps.onBlur();
    expect(onFocus).toHaveBeenCalled();
    expect(setDomRect).toHaveBeenCalledWith(null);
  });

  it('onPaste wrapper should stop browser default behavior', () => {
    renderEditor({ pasteConfig: { enabled: false } });
    const event = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      clipboardData: {
        types: ['text/plain'],
        getData: () => 'text',
        setData: vi.fn(),
      },
      target: document.createElement('div'),
    } as any;
    editableProps.onPaste(event);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(event.stopPropagation).toHaveBeenCalled();
  });
});

