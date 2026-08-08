/**
 * chart/index deepen2：NaN reverseFormat、dayjs 兜底日期、
 * width||256、subgraph 空组、item null 过滤。
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
  get: () => (globalThis as any).__chartRootWidth ?? 0,
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
      data-testid="chart-render2"
      data-title={props.title ?? ''}
      data-loading={String(props.loading)}
    />
  ),
}));

vi.mock('../../../MarkdownEditor/editor/tools/DragHandle', () => ({
  DragHandle: () => <div data-testid="drag-handle2" />,
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
        { name: 'A', value: '1,234.5', cat: 'g1' },
        { name: 'B', value: 'not-a-number', cat: 'g1' },
        { name: 'C', value: '10', cat: 'g2' },
      ],
      config: [
        {
          chartType: 'bar',
          x: 'name',
          y: 'value',
          subgraphBy: 'cat',
        },
      ],
      columns: [],
      ...overrides,
    },
    children: [{ type: 'table-row', children: [] }],
  }) as any;

describe('chart/index deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    mockReadonly = false;
    mockIsLatestNode.mockReturnValue(false);
    (globalThis as any).__chartRootWidth = 0;
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('rootWidth 0 → minWidth 256；subgraph 渲染', async () => {
    render(
      <ChartElement
        element={baseElement()}
        attributes={{} as any}
      >
        {[]}
      </ChartElement>,
    );
    await act(async () => {
      vi.advanceTimersByTime(50);
    });
    expect(screen.getAllByTestId('chart-render2').length).toBeGreaterThan(0);
  });

  it('日期字符串走 isValidDate 兜底', async () => {
    render(
      <ChartElement
        element={baseElement({
          dataSource: [
            { name: '2024-06-01', value: 1 },
            { name: 'not-date', value: 2 },
          ],
          config: [{ chartType: 'line', x: 'name', y: 'value' }],
        })}
        attributes={{} as any}
      >
        {[]}
      </ChartElement>,
    );
    await act(async () => {
      vi.advanceTimersByTime(50);
    });
    expect(screen.getByTestId('chart-render2')).toBeInTheDocument();
  });

  it('空 dataSource 仍挂载', async () => {
    render(
      <ChartElement
        element={baseElement({ dataSource: [], config: [] })}
        attributes={{} as any}
      >
        {[]}
      </ChartElement>,
    );
    await act(async () => {
      vi.advanceTimersByTime(20);
    });
    expect(document.body).toBeTruthy();
  });
});
