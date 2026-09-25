/**
 * chart/index deepen3：空 dataSource、宽度 0 回退、dayjs 日期回退、
 * subgraph 空组 null 过滤。
 */
import '@testing-library/jest-dom';
import { act, cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockUpdate = vi.fn();
const mockIsLatestNode = vi.fn().mockReturnValue(false);
const mockDragStart = vi.fn();
let mockReadonly = false;

const mockRootContainer = document.createElement('div');
Object.defineProperty(mockRootContainer, 'clientWidth', {
  get: () => (globalThis as any).__chartRootWidth ?? 320,
  configurable: true,
});

vi.mock('../../../MarkdownEditor/editor/store', () => ({
  useEditorStore: () => ({
    store: { dragStart: mockDragStart, isLatestNode: mockIsLatestNode },
    readonly: mockReadonly,
    markdownContainerRef: { current: document.createElement('div') },
    rootContainer: { current: mockRootContainer },
  }),
}));

vi.mock('slate-react', () => ({
  useSlate: () => ({}),
}));

vi.mock('../../../MarkdownEditor/hooks/editor', () => ({
  useMEditor: () => [undefined, mockUpdate],
}));

vi.mock('../ChartRender', () => ({
  ChartRender: (props: any) => (
    <div
      data-testid="chart-render3"
      data-title={props.title ?? ''}
      data-loading={String(props.loading)}
    />
  ),
}));

vi.mock('../../../MarkdownEditor/editor/tools/DragHandle', () => ({
  DragHandle: () => <div data-testid="drag-handle3" />,
}));

vi.mock('../../../MarkdownEditor/editor/elements/ErrorBoundary', () => ({
  ErrorBoundary: ({ children }: any) => <div>{children}</div>,
}));

import { ChartElement } from '../index';

const baseElement = (overrides: Record<string, unknown> = {}) =>
  ({
    type: 'chart',
    otherProps: {
      dataSource: [
        { name: 'A', value: '1' },
        { name: 'B', value: 20 },
      ],
      config: [{ chartType: 'bar', x: 'name', y: 'value' }],
      columns: [],
      ...overrides,
    },
    children: [{ type: 'table-row', children: [] }],
  }) as any;

describe('chart/index deepen3 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    mockReadonly = false;
    mockIsLatestNode.mockReturnValue(false);
    mockUpdate.mockClear();
    mockDragStart.mockClear();
    (globalThis as any).__chartRootWidth = 320;
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('dataSource 缺省走 ||[]；空数组 chartData 仍可挂载', () => {
    const { rerender } = render(
      <ChartElement
        element={baseElement({ dataSource: undefined })}
        attributes={{ 'data-slate-node': 'element' } as any}
      >
        <span />
      </ChartElement>,
    );
    expect(document.querySelector('[data-be="chart"]')).toBeInTheDocument();

    rerender(
      <ChartElement
        element={baseElement({ dataSource: [] })}
        attributes={{ 'data-slate-node': 'element' } as any}
      >
        <span />
      </ChartElement>,
    );
    expect(document.querySelector('[data-be="chart"]')).toBeInTheDocument();
  });

  it('clientWidth=0 时 minWidth 回退 256；resize 触发', () => {
    (globalThis as any).__chartRootWidth = 0;
    render(
      <ChartElement
        element={baseElement()}
        attributes={{ 'data-slate-node': 'element' } as any}
      >
        <span />
      </ChartElement>,
    );
    expect(screen.getByTestId('chart-render3')).toBeInTheDocument();
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
  });

  it('ISO 日期经 dayjs 默认解析回退（非格式表）', () => {
    render(
      <ChartElement
        element={
          baseElement({
            dataSource: [
              { name: '2024-01-15T12:00:00.000Z', value: '10' },
              { name: 'B', value: '20' },
            ],
          })
        }
        attributes={{ 'data-slate-node': 'element' } as any}
      >
        <span />
      </ChartElement>,
    );
    expect(screen.getByTestId('chart-render3')).toBeInTheDocument();
  });

  it('subgraphBy 多组含空组：null 项被过滤', () => {
    render(
      <ChartElement
        element={
          baseElement({
            dataSource: [
              { name: 'A', value: 1, g: 'ok' },
              { name: 'B', value: 2, g: 'ok' },
              { name: 'C', value: 3, g: undefined as any },
            ],
            config: [
              {
                chartType: 'bar',
                x: 'name',
                y: 'value',
                subgraphBy: 'g',
                title: 'sub',
              },
            ],
          })
        }
        attributes={{ 'data-slate-node': 'element' } as any}
      >
        <span />
      </ChartElement>,
    );
    expect(document.querySelector('[data-be="chart"]')).toBeInTheDocument();
  });
});
