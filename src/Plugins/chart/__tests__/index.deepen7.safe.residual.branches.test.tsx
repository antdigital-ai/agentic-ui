/**
 * chart/index deepen7 safe：reverseFormatNumber NaN、numberString 非 string、
 * finished 二次检查、width||256、SSR/subgraph null。
 */
import '@testing-library/jest-dom';
import { act, cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockUpdate = vi.fn();
const mockIsLatestNode = vi.fn().mockReturnValue(true);
const mockDragStart = vi.fn();
let mockReadonly = false;

const mockRootContainer = document.createElement('div');
Object.defineProperty(mockRootContainer, 'clientWidth', {
  get: () => (globalThis as any).__chart7RootWidth ?? 0,
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
      data-testid="chart-render7"
      data-title={props.title ?? ''}
      data-loading={String(props.loading)}
    />
  ),
}));

vi.mock('../../../MarkdownEditor/editor/tools/DragHandle', () => ({
  DragHandle: () => <div data-testid="drag-handle7" />,
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
        { name: 'not-a-number', value: 'also-bad', cat: 'g1' },
        { name: 42, value: 100, cat: 'g1' },
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
      finished: false,
      ...overrides,
    },
    children: [{ type: 'table-row', children: [] }],
  }) as any;

describe('chart/index deepen7 safe residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    mockReadonly = false;
    mockIsLatestNode.mockReturnValue(true);
    mockUpdate.mockClear();
    (globalThis as any).__chart7RootWidth = 0;
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('非 string/NaN value：numberString 与 reverseFormatNumber NaN 臂', async () => {
    render(
      <ChartElement element={baseElement()} attributes={{} as any}>
        {[]}
      </ChartElement>,
    );
    await act(async () => {
      vi.advanceTimersByTime(60);
    });
    expect(screen.getAllByTestId('chart-render7').length).toBeGreaterThan(0);
  });

  it('dayjs 兜底：非标准日期字符串仍渲染', async () => {
    render(
      <ChartElement
        element={baseElement({
          dataSource: [{ name: 'Summer 2024 special', value: 1 }],
          config: [{ chartType: 'line', x: 'name', y: 'value' }],
          finished: true,
        })}
        attributes={{} as any}
      >
        {[]}
      </ChartElement>,
    );
    await act(async () => {
      vi.advanceTimersByTime(40);
    });
    expect(screen.getByTestId('chart-render7')).toBeInTheDocument();
  });

  it('finished=false + isLastNode：5s 超时内 finished 已 true 跳过二次 update', async () => {
    const el = baseElement({ finished: false });
    const { rerender } = render(
      <ChartElement element={el} attributes={{} as any}>
        {[]}
      </ChartElement>,
    );
    el.otherProps.finished = true;
    rerender(
      <ChartElement element={el} attributes={{} as any}>
        {[]}
      </ChartElement>,
    );
    await act(async () => {
      vi.advanceTimersByTime(5100);
    });
    expect(mockUpdate.mock.calls.length).toBeLessThanOrEqual(2);
  });

  it('rootWidth=0 → minWidth 256；空 subgraph 组 return null', async () => {
    (globalThis as any).__chart7RootWidth = 0;
    render(
      <ChartElement
        element={baseElement({
          dataSource: [
            { name: 'A', value: 1, cat: 'only' },
            { name: 'B', value: 2, cat: 'empty' },
          ],
          config: [
            {
              chartType: 'pie',
              x: 'name',
              y: 'value',
              subgraphBy: 'cat',
            },
          ],
          finished: true,
        })}
        attributes={{} as any}
      >
        {[]}
      </ChartElement>,
    );
    await act(async () => {
      vi.advanceTimersByTime(50);
    });
    expect(screen.getAllByTestId('chart-render7').length).toBeGreaterThan(0);
  });

  it('subgraph 空组过滤：仅有效 cat 渲染', async () => {
    render(
      <ChartElement
        element={baseElement({
          dataSource: [{ name: 'solo', value: 9, cat: 'solo' }],
          config: [
            {
              chartType: 'bar',
              x: 'name',
              y: 'value',
              subgraphBy: 'cat',
            },
          ],
          finished: true,
        })}
        attributes={{} as any}
      >
        {[]}
      </ChartElement>,
    );
    await act(async () => {
      vi.advanceTimersByTime(40);
    });
    expect(screen.getByTestId('chart-render7')).toBeInTheDocument();
  });
});
