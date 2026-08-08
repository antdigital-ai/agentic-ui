/**
 * Plugins/code index deepen：csvToMarkdownTable 引号/补列；CodeElement csv/empty。
 */
import '@testing-library/jest-dom';
import { cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockStore = vi.hoisted(() => ({
  readonly: true,
}));

vi.mock('../../../MarkdownEditor/editor/store', () => ({
  useEditorStore: () => mockStore,
}));

vi.mock('../components', () => ({
  CodeRenderer: () => <div data-testid="code-renderer" />,
}));

vi.mock('../../../MarkdownEditor', () => ({
  BaseMarkdownEditor: ({ initValue }: { initValue?: string }) => (
    <div data-testid="base-md">{initValue}</div>
  ),
}));

import { CodeElement, csvToMarkdownTable } from '../index';

describe('Plugins/code index deepen residual', () => {
  beforeEach(() => {
    mockStore.readonly = true;
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('csvToMarkdownTable：undefined/空行/转义引号/补齐/\\r\\n', () => {
    expect(csvToMarkdownTable(undefined)).toBe('');
    expect(csvToMarkdownTable('')).toBe('');
    expect(csvToMarkdownTable('\n  \n')).toBe('');
    const quoted = csvToMarkdownTable('A,"B ""C""",D\n1,2');
    expect(quoted).toContain('B "C"');
    expect(quoted).toContain('| 1 | 2 |  |');
    const crlf = csvToMarkdownTable('H1,H2\r\nA,B\rC,D');
    expect(crlf).toContain('| H1 | H2 |');
    expect(crlf).toContain('| A | B |');
    expect(crlf).toContain('| C | D |');
    expect(csvToMarkdownTable('a|b,c')).toContain('\\|');
  });

  it('CodeElement：无 element / readonly 空 / csv / 非 csv / 可编辑', () => {
    const { container, rerender } = render(
      <CodeElement
        element={null as any}
        attributes={{} as any}
      >
        <span />
      </CodeElement>,
    );
    expect(container.firstChild).toBeNull();

    rerender(
      <CodeElement
        element={
          {
            type: 'code',
            language: 'js',
            value: '',
            children: [{ text: '' }],
          } as any
        }
        attributes={{} as any}
      >
        <span />
      </CodeElement>,
    );
    expect(container.firstChild).toBeNull();

    rerender(
      <CodeElement
        element={
          {
            type: 'code',
            language: 'csv',
            value: 'A,B\n1,2',
            children: [{ text: 'A,B\n1,2' }],
          } as any
        }
        attributes={{} as any}
      >
        <span />
      </CodeElement>,
    );
    expect(screen.getByTestId('base-md')).toBeInTheDocument();

    rerender(
      <CodeElement
        element={
          {
            type: 'code',
            language: 'js',
            value: 'x',
            children: [{ text: 'x' }],
          } as any
        }
        attributes={{} as any}
      >
        <span />
      </CodeElement>,
    );
    expect(screen.getByTestId('code-renderer')).toBeInTheDocument();

    mockStore.readonly = false;
    rerender(
      <CodeElement
        element={
          {
            type: 'code',
            language: 'csv',
            value: 'A,B',
            children: [{ text: 'A,B' }],
          } as any
        }
        attributes={{} as any}
      >
        <span />
      </CodeElement>,
    );
    expect(screen.getByTestId('code-renderer')).toBeInTheDocument();
  });
});
