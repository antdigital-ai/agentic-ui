/**
 * chart/index ChartElement 残留：空 config、未知 chartType、loading。
 */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('slate-react', () => ({
  useSlate: () => ({ children: [] }),
  ReactEditor: { findPath: () => [0] },
}));

vi.mock('../../../MarkdownEditor/editor/store', () => ({
  useEditorStore: () => ({
    store: { dragStart: vi.fn(), isLatestNode: vi.fn() },
    readonly: true,
    markdownContainerRef: { current: document.createElement('div') },
    rootContainer: { current: document.createElement('div') },
  }),
}));

vi.mock('../../../MarkdownEditor/hooks/editor', () => ({
  useMEditor: () => [{}, vi.fn()],
}));

vi.mock('../../../MarkdownEditor/editor/tools/DragHandle', () => ({
  DragHandle: () => null,
}));

vi.mock('../../../MarkdownEditor/editor/elements/ErrorBoundary', () => ({
  ErrorBoundary: ({ children }: any) => children,
}));

vi.mock('../ChartRender', () => ({
  ChartRender: ({ chartType, config }: any) => (
    <div data-testid="chart-render" data-type={chartType}>
      {JSON.stringify(config ?? null)}
    </div>
  ),
}));

vi.mock('../utils', async () => {
  const actual = await vi.importActual<any>('../utils');
  return {
    ...actual,
    getDataHash: () => 'h',
    sortChartDataRowsByXField: (rows: any) => rows,
  };
});

import { ChartElement } from '../index';

describe('chart/index ChartElement residual branches', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('无 chartType / 空 children 表格', () => {
    render(
      <ChartElement
        element={
          {
            type: 'chart',
            otherProps: { config: [], dataSource: [] },
            children: [{ type: 'table-row', children: [] }],
          } as any
        }
        attributes={{ 'data-slate-node': 'element' } as any}
      >
        <span />
      </ChartElement>,
    );
    expect(document.querySelector('[data-be="chart"]')).toBeInTheDocument();
  });

  it('chartType=bar + otherAttributes', () => {
    render(
      <ChartElement
        element={
          {
            type: 'chart',
            otherProps: {
              title: 't',
              dataSource: [{ name: 'A', value: 1 }],
              config: [{ chartType: 'bar', x: 'name', y: 'value' }],
              columns: [
                { title: 'Name', dataIndex: 'name' },
                { title: 'Value', dataIndex: 'value' },
              ],
            },
            children: [],
          } as any
        }
        attributes={{ 'data-slate-node': 'element' } as any}
      >
        <span />
      </ChartElement>,
    );
    expect(screen.getByTestId('chart-render')).toHaveAttribute(
      'data-type',
      'bar',
    );
  });
});
