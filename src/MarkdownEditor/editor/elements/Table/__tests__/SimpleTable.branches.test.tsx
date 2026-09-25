/**
 * SimpleTable：markdownEditorRef.current null 时 tablePath 为 []。
 */
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { SimpleTable } from '../SimpleTable';

vi.mock('../../../store', () => ({
  useEditorStore: vi.fn(() => ({
    markdownEditorRef: { current: null },
  })),
}));

vi.mock('../Table', () => ({
  SlateTable: ({ children }: { children: React.ReactNode }) => (
    <table data-testid="slate-table">{children}</table>
  ),
}));

describe('SimpleTable branches', () => {
  it('editor ref 为空时仍渲染表格容器', () => {
    const { container } = render(
      <ConfigProvider>
        <SimpleTable
          attributes={{ 'data-slate-node': 'element' } as any}
          element={{ type: 'table', children: [] } as any}
        >
          <tr />
        </SimpleTable>
      </ConfigProvider>,
    );
    expect(container.querySelector('[data-be="table"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="slate-table"]')).toBeTruthy();
  });
});
