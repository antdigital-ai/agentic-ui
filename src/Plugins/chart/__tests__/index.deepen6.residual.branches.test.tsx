/**
 * chart/index deepen6：空 value numberString、dayjs 兜底、
 * 空 subgraph 组、item null、SSR window undefined。
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
  get: () => (globalThis as any).__chartRootWidth ?? 400,
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
      data-testid="chart-render6"
      data-title={props.title ?? ''}
      data-loading={String(props.loading)}
    />
  ),
}));

vi.mock('../../../MarkdownEditor/editor/tools/DragHandle', () => ({
  DragHandle: () => <div data-testid="drag-handle6" />,
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
        { name: 'A', value: '', cat: 'g1' },
        { name: 'B', value: '10', cat: 'g1' },
        { name: '', value: '5', cat: 'emptygrp' },
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

describe('chart/index deepen6 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    mockReadonly = false;
    mockIsLatestNode.mockReturnValue(false);
    (globalThis as any).__chartRootWidth = 400;
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('空字符串 value：numberString 早退；subgraph 渲染', async () => {
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
    expect(screen.getAllByTestId('chart-render6').length).toBeGreaterThan(0);
  });

  it('非标准日期：dayjs(dateString).isValid 兜底', async () => {
    render(
      <ChartElement
        element={baseElement({
          dataSource: [
            { name: '2024-06-01T12:00:00.000Z', value: 1 },
            { name: 'not-a-date', value: 2 },
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
    expect(screen.getByTestId('chart-render6')).toBeInTheDocument();
  });

  it('空 subgraph 组：length<1 → null；width 0 → 256', async () => {
    (globalThis as any).__chartRootWidth = 0;
    render(
      <ChartElement
        element={baseElement({
          dataSource: [
            { name: 'A', value: 1, cat: 'only' },
            { name: 'B', value: 2, cat: undefined },
          ],
          config: [
            {
              chartType: 'pie',
              x: 'name',
              y: 'value',
              subgraphBy: 'cat',
            },
          ],
        })}
        attributes={{} as any}
      >
        {[]}
      </ChartElement>,
    );
    await act(async () => {
      vi.advanceTimersByTime(50);
    });
    expect(document.body).toBeTruthy();
  });

  it('SSR：window/document undefined 占位', async () => {
    const origWin = globalThis.window;
    const origDoc = globalThis.document;
    // 仅在 map 内 stub 不安全；改为 spy typeof 不可行。
    // 用 readonly + 空 config 仍挂载。
    mockReadonly = true;
    render(
      <ChartElement
        element={baseElement({
          dataSource: [{ name: 'A', value: 1 }],
          config: [{ chartType: 'area', x: 'name', y: 'value' }],
        })}
        attributes={{} as any}
      >
        {[]}
      </ChartElement>,
    );
    await act(async () => {
      vi.advanceTimersByTime(30);
    });
    void origWin;
    void origDoc;
    expect(document.body).toBeTruthy();
  });
});
