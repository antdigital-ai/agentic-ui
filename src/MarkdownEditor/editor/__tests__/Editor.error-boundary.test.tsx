import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { PluginContext } from '../../plugin';
import type { MEditorProps } from '../Editor';

let editableProps: Record<string, any> = {};

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
    markdownEditorRef: {
      current: {
        children: [{ type: 'paragraph', children: [{ text: 'hello' }] }],
        selection: null,
        operations: [],
      },
    },
    markdownContainerRef: { current: document.createElement('div') },
    readonly: false,
    setDomRect: vi.fn(),
  }),
}));

vi.mock('../elements', () => ({
  MElement: () => {
    throw new Error('render element error');
  },
  MLeaf: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import { SlateMarkdownEditor } from '../Editor';

describe('SlateMarkdownEditor ErrorBoundary coverage', () => {
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

  it('element 渲染异常时应由 ErrorBoundary fallback 兜底', () => {
    renderEditor();
    const result = editableProps.renderElement({
      attributes: {},
      children: <span>child</span>,
      element: { type: 'paragraph', children: [{ text: 'x' }] },
    } as any);
    render(<>{result}</>);
    expect(screen.queryByText('child')).not.toBeInTheDocument();
  });
});

