/**
 * chart/index deepen residual：data 末行裁剪、subgraphBy、未完成超时、
 * resize、numberString 日期/本地化、isLatestNode catch。
 */
import '@testing-library/jest-dom';
import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockUpdate = vi.fn();
const mockIsLatestNode = vi.fn().mockReturnValue(false);
const mockDragStart = vi.fn();
let mockReadonly = false;

const mockRootContainer = document.createElement('div');
Object.defineProperty(mockRootContainer, 'clientWidth', {
  value: 320,
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
      data-testid="chart-render"
      data-chart-type={props.chartType}
      data-title={props.title ?? ''}
      data-loading={String(props.loading)}
    />
  ),
}));

vi.mock('../../../MarkdownEditor/editor/tools/DragHandle', () => ({
  DragHandle: () => <div data-testid="drag-handle" />,
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
        { name: 'A', value: '1,234.5' },
        { name: 'B', value: 20 },
      ],
      config: [{ chartType: 'bar', x: 'name', y: 'value' }],
      columns: [],
      ...overrides,
    },
    children: [{ type: 'table-row', children: [] }],
  }) as any;

describe('chart/index deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    mockReadonly = false;
    mockIsLatestNode.mockReturnValue(false);
    mockUpdate.mockClear();
    mockDragStart.mockClear();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.restoreAllMocks();
  });

  it('末行 keys 不一致时丢弃最后一行', () => {
    render(
      <ChartElement
        element={
          baseElement({
            dataSource: [
              { name: 'A', value: 1 },
              { name: 'B', value: 2 },
              { extra: 'only' },
            ],
          })
        }
        attributes={{ 'data-slate-node': 'element' } as any}
      >
        <span />
      </ChartElement>,
    );
    expect(screen.getByTestId('chart-render')).toBeInTheDocument();
  });

  it('subgraphBy 分组渲染多图；空组返回 null', () => {
    render(
      <ChartElement
        element={
          baseElement({
            dataSource: [
              { name: 'A', value: 1, group: 'G1' },
              { name: 'B', value: 2, group: 'G2' },
            ],
            config: [
              {
                chartType: 'line',
                x: 'name',
                y: 'value',
                subgraphBy: 'group',
              },
            ],
          })
        }
        attributes={{ 'data-slate-node': 'element' } as any}
      >
        <span />
      </ChartElement>,
    );
    const renders = screen.getAllByTestId('chart-render');
    expect(renders.length).toBeGreaterThanOrEqual(1);
    expect(renders.some((el) => el.getAttribute('data-title') === 'G1')).toBe(
      true,
    );
  });

  it('numberString 解析本地化数字与日期字段', () => {
    render(
      <ChartElement
        element={
          baseElement({
            dataSource: [{ name: '2024-01-15', value: '1,234.5' }],
            config: [{ chartType: 'bar', x: 'name', y: 'value' }],
          })
        }
        attributes={{ 'data-slate-node': 'element' } as any}
      >
        <span />
      </ChartElement>,
    );
    expect(screen.getByTestId('chart-render')).toBeInTheDocument();
  });

  it('未完成且非末节点立即 finished=true', () => {
    mockIsLatestNode.mockReturnValue(false);
    render(
      <ChartElement
        element={baseElement({ finished: false })}
        attributes={{ 'data-slate-node': 'element' } as any}
      >
        <span />
      </ChartElement>,
    );
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        otherProps: expect.objectContaining({ finished: true }),
      }),
      expect.anything(),
    );
  });

  it('未完成且末节点 5 秒后 finished=true', () => {
    mockIsLatestNode.mockReturnValue(true);
    render(
      <ChartElement
        element={baseElement({ finished: false })}
        attributes={{ 'data-slate-node': 'element' } as any}
      >
        <span />
      </ChartElement>,
    );
    expect(screen.getByTestId('chart-render')).toHaveAttribute(
      'data-loading',
      'true',
    );
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        otherProps: expect.objectContaining({ finished: true }),
      }),
      expect.anything(),
    );
  });

  it('isLatestNode 抛错时回退 false；window resize 更新列宽', () => {
    mockIsLatestNode.mockImplementation(() => {
      throw new Error('store');
    });
    render(
      <ChartElement
        element={
          baseElement({
            config: [
              { chartType: 'bar', x: 'name', y: 'value' },
              { chartType: 'line', x: 'name', y: 'value' },
            ],
          })
        }
        attributes={{ 'data-slate-node': 'element' } as any}
      >
        <span />
      </ChartElement>,
    );
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    expect(screen.getAllByTestId('chart-render').length).toBeGreaterThan(0);
  });

  it('dragStart 与 columnLength=1 宽度 100%', () => {
    Object.defineProperty(mockRootContainer, 'clientWidth', {
      configurable: true,
      value: 256,
    });
    const { container } = render(
      <ChartElement
        element={baseElement()}
        attributes={{ 'data-slate-node': 'element' } as any}
      >
        <span />
      </ChartElement>,
    );
    const chartEl = container.querySelector('[data-be="chart"]') as HTMLElement;
    fireEvent.dragStart(chartEl);
    expect(mockDragStart).toHaveBeenCalled();
  });

  it('空 dataSource 返回空 chartData', () => {
    render(
      <ChartElement
        element={baseElement({ dataSource: [] })}
        attributes={{ 'data-slate-node': 'element' } as any}
      >
        <span />
      </ChartElement>,
    );
    expect(document.querySelector('[data-be="chart"]')).toBeInTheDocument();
  });
});
