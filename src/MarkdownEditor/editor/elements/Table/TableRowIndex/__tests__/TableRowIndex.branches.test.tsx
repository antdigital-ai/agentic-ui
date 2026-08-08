/**
 * TableRowIndex：省略 colWidths 默认 []，用 columnCount 渲染占位。
 */
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { TableRowIndex } from '../index';

vi.mock('../../../../store', () => ({
  useEditorStore: () => ({
    store: {},
    markdownEditorRef: { current: null },
  }),
}));

describe('TableRowIndex branches', () => {
  it('省略 colWidths 时按 columnCount 渲染 spacer', () => {
    const { container } = render(
      <ConfigProvider>
        <table>
          <tbody>
            <TableRowIndex columnCount={2} />
          </tbody>
        </table>
      </ConfigProvider>,
    );
    expect(container.querySelectorAll('td').length).toBeGreaterThan(0);
  });
});
