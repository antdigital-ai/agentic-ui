/**
 * Plugins/code index deepen2：引号开关边界、仅表头、inQuotes 逗号保留。
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

vi.mock('../../../MarkdownEditor/editor/utils/codeBlockPlainText', () => ({
  getCodeBlockPlainText: (el: any) => el?.value ?? '',
}));

import { CodeElement, csvToMarkdownTable } from '../index';

describe('Plugins/code index deepen2 residual', () => {
  beforeEach(() => {
    mockStore.readonly = true;
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('csvToMarkdownTable：仅表头；引号内逗号；末尾开引号；双引号结尾', () => {
    expect(csvToMarkdownTable('OnlyHeader')).toContain('| OnlyHeader |');
    const innerComma = csvToMarkdownTable('A,"B,C",D\n1,"2,3",4');
    expect(innerComma).toContain('B,C');
    expect(innerComma).toContain('2,3');

    // trailing open quote — still produces rows
    const openQ = csvToMarkdownTable('A,"B\n1,2');
    expect(openQ.length).toBeGreaterThan(0);

    // escaped quote at end of field
    const escEnd = csvToMarkdownTable('A,"B"""\n1,2');
    expect(escEnd).toContain('B"');
  });

  it('CodeElement：readonly csv 空 value 早退；非 readonly 走 renderer', () => {
    const { rerender } = render(
      <CodeElement
        element={
          {
            type: 'code',
            language: 'csv',
            value: '',
            children: [{ text: '' }],
          } as any
        }
        attributes={{} as any}
      >
        <span />
      </CodeElement>,
    );
    expect(document.body.querySelector('[data-testid="base-md"]')).toBeNull();

    mockStore.readonly = false;
    rerender(
      <CodeElement
        element={
          {
            type: 'code',
            language: 'csv',
            value: 'H\n1',
            children: [{ text: 'H\n1' }],
          } as any
        }
        attributes={{} as any}
      >
        <span />
      </CodeElement>,
    );
    expect(screen.getByTestId('code-renderer')).toBeInTheDocument();
  });

  it('CodeElement：readonly 非空非 csv 走 CodeRenderer', () => {
    mockStore.readonly = true;
    render(
      <CodeElement
        element={
          {
            type: 'code',
            language: 'typescript',
            value: 'const a = 1',
            children: [{ text: 'const a = 1' }],
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
