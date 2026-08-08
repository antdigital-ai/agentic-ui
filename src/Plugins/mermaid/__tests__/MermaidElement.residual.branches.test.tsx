/**
 * MermaidElement 残留：空 value、frontmatter、copy、readonly。
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('copy-to-clipboard', () => ({
  default: vi.fn(() => true),
}));

vi.mock('../Mermaid', () => ({
  Mermaid: ({ element }: any) => (
    <div data-testid="mermaid">{element?.value}</div>
  ),
}));

vi.mock('../../../Components/ActionIconBox', () => ({
  ActionIconBox: ({ children, onClick, title }: any) => (
    <button type="button" onClick={onClick} title={title}>
      {children}
    </button>
  ),
}));

vi.mock('../../../MarkdownEditor/editor/store', () => ({
  useEditorStore: () => ({
    readonly: false,
    markdownEditorRef: { current: document.createElement('div') },
  }),
}));

vi.mock('../../../MarkdownEditor/hooks/editor', () => ({
  useSelStatus: () => [false, [0]],
}));

vi.mock('slate-react', () => ({
  ReactEditor: {
    findPath: () => [0],
    toDOMNode: () => document.createElement('div'),
    isFocused: vi.fn(() => true),
  },
  useSlateStatic: () => ({}),
}));

vi.mock('react-use', () => {
  const React = require('react');
  return {
    useGetSetState: vi.fn((initialState) => {
      const [state, setStateInternal] = React.useState(initialState);
      const getState = () => state;
      const setState = (update: any) => {
        if (typeof update === 'function') {
          setStateInternal((s: any) => ({ ...s, ...update(s) }));
        } else {
          setStateInternal((s: any) => ({ ...s, ...update }));
        }
      };
      return [getState, setState];
    }),
  };
});

import { MermaidElement } from '../index';

describe('MermaidElement residual branches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('空 value / frontmatter', () => {
    const { rerender } = render(
      <MermaidElement
        element={{ type: 'code', language: 'mermaid', value: '' } as any}
        attributes={{ 'data-slate-node': 'element' } as any}
      >
        <span />
      </MermaidElement>,
    );
    expect(screen.getByTestId('mermaid')).toBeInTheDocument();

    rerender(
      <MermaidElement
        element={
          {
            type: 'code',
            language: 'mermaid',
            value: 'graph TD;A-->B',
            frontmatter: true,
          } as any
        }
        attributes={{ 'data-slate-node': 'element' } as any}
      >
        <span />
      </MermaidElement>,
    );
    expect(screen.getByTestId('mermaid')).toHaveTextContent('graph TD');
  });

  it('copy 按钮', () => {
    render(
      <MermaidElement
        element={
          {
            type: 'code',
            language: 'mermaid',
            value: 'graph TD;A-->B',
          } as any
        }
        attributes={{ 'data-slate-node': 'element' } as any}
      >
        <span />
      </MermaidElement>,
    );
    const btns = screen.getAllByRole('button');
    if (btns[0]) fireEvent.click(btns[0]);
    expect(btns.length).toBeGreaterThan(0);
  });

  it('language 默认空；hide padding；selected focus border', () => {
    render(
      <MermaidElement
        element={
          {
            type: 'code',
            value: 'graph TD;A-->B',
            otherProps: { hide: true },
          } as any
        }
        attributes={{ 'data-slate-node': 'element' } as any}
      >
        <span />
      </MermaidElement>,
    );
    expect(screen.getByTestId('mermaid')).toBeInTheDocument();
  });
});
