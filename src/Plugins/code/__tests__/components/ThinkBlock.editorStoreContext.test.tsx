import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EditorStoreContext } from '../../../../MarkdownEditor/editor/editorStoreContext';
import type { CodeNode } from '../../../../MarkdownEditor/el';
import { ThinkBlock, ThinkBlockProvider } from '../../components/ThinkBlock';

const toolUseBarThinkSpy = vi.hoisted(() => vi.fn());
const mockFindPath = vi.hoisted(() => vi.fn());
const mockCheckSelEnd = vi.hoisted(() => vi.fn());

vi.mock('../../../../MarkdownEditor/editor/store', async () => {
  const React = await import('react');

  return {
    EditorStoreContext: React.createContext(null),
    useEditorStore: () => {
      throw new Error('ThinkBlock should read editorStoreContext directly');
    },
  };
});

vi.mock('../../../../MarkdownEditor/editor/utils/editorUtils', () => ({
  EditorUtils: {
    findPath: (...args: unknown[]) => mockFindPath(...args),
    checkSelEnd: (...args: unknown[]) => mockCheckSelEnd(...args),
  },
}));

vi.mock('../../../../ToolUseBarThink', async () => {
  const React = await import('react');

  return {
    ToolUseBarThink: (props: Record<string, any>) => {
      toolUseBarThinkSpy(props);

      return React.createElement(
        'div',
        {
          'data-testid': props.testId ?? 'ToolUseBarThink',
          'data-expanded': String(props.expanded),
          'data-status': props.status,
        },
        React.createElement(
          'span',
          { 'data-testid': 'think-tool-name' },
          props.toolName,
        ),
        React.createElement(
          'div',
          { 'data-testid': 'think-content' },
          props.thinkContent,
        ),
      );
    },
  };
});

const codeNode: CodeNode = {
  type: 'code',
  language: 'think',
  value: 'deep think content',
  children: [{ text: 'deep think content' }],
};

const thinkBlockProps = {
  element: codeNode,
  attributes: {
    'data-slate-node': 'element' as const,
    ref: null,
  },
  children: <span>children</span>,
};

const getLatestToolUseBarThinkProps = () => {
  const calls = toolUseBarThinkSpy.mock.calls;
  return calls[calls.length - 1]?.[0] as Record<string, any>;
};

describe('ThinkBlock editorStoreContext', () => {
  beforeEach(() => {
    toolUseBarThinkSpy.mockClear();
    mockFindPath.mockReset();
    mockCheckSelEnd.mockReset();
    mockFindPath.mockReturnValue([2]);
    mockCheckSelEnd.mockReturnValue(true);
  });

  it('reads the separated editor store context when editor/store is mocked', () => {
    const fakeEditor = { children: [codeNode] };
    const scrollOptions = {
      behavior: 'instant' as const,
      block: 'nearest' as const,
    };

    render(
      <EditorStoreContext.Provider
        value={
          {
            editorProps: {
              codeProps: {
                alwaysExpandedDeepThink: true,
                scrollDeepThinkIntoViewOnExpand: scrollOptions,
              },
            },
            markdownEditorRef: { current: fakeEditor },
          } as any
        }
      >
        <ThinkBlockProvider expanded={false}>
          <ThinkBlock {...thinkBlockProps} />
        </ThinkBlockProvider>
      </EditorStoreContext.Provider>,
    );

    expect(screen.getByTestId('think-block')).toHaveTextContent(
      'deep think content',
    );
    expect(mockFindPath).toHaveBeenCalledWith(fakeEditor, codeNode);
    expect(mockCheckSelEnd).toHaveBeenCalledWith(fakeEditor, [2]);
    expect(getLatestToolUseBarThinkProps().expanded).toBe(true);
    expect(getLatestToolUseBarThinkProps().scrollIntoViewOnExpand).toBe(
      scrollOptions,
    );
  });

  it('collapses when the controlled ThinkBlockProvider expanded value is cleared', async () => {
    const fakeEditor = { children: [codeNode] };

    const { rerender } = render(
      <EditorStoreContext.Provider
        value={
          {
            editorProps: {},
            markdownEditorRef: { current: fakeEditor },
          } as any
        }
      >
        <ThinkBlockProvider expanded={true}>
          <ThinkBlock {...thinkBlockProps} />
        </ThinkBlockProvider>
      </EditorStoreContext.Provider>,
    );

    expect(getLatestToolUseBarThinkProps().expanded).toBe(true);

    rerender(
      <EditorStoreContext.Provider
        value={
          {
            editorProps: {},
            markdownEditorRef: { current: fakeEditor },
          } as any
        }
      >
        <ThinkBlockProvider>
          <ThinkBlock {...thinkBlockProps} />
        </ThinkBlockProvider>
      </EditorStoreContext.Provider>,
    );

    await waitFor(() => {
      expect(getLatestToolUseBarThinkProps().expanded).toBe(false);
    });
  });
});
