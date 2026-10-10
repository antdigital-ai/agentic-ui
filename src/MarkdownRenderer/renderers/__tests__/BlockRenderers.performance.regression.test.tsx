import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ChartBlockRenderer } from '../ChartRenderer';
import { CodeBlockToolbar } from '../CodeBlockToolbar';
import { SchemaBlockRenderer } from '../SchemaRenderer';

const { chartRender, schemaRender, currency } = vi.hoisted(() => ({
  chartRender: vi.fn(),
  schemaRender: vi.fn(),
  currency: vi.fn((value: string) => (value === '1万' ? 10000 : null)),
}));

vi.mock('../../../Plugins/chart/ChartRender', () => ({
  ChartRender: (props: Record<string, unknown>) => {
    chartRender(props);
    return <div data-testid="chart" />;
  },
}));
vi.mock('../../../Plugins/chart/utils', () => ({
  parseChineseCurrencyToNumber: currency,
}));
vi.mock('../../../Schema', async () => {
  const { memo } = await import('react');
  return {
    SchemaRenderer: memo((props: Record<string, unknown>) => {
      schemaRender(props);
      return <div data-testid="schema" />;
    }),
  };
});
vi.mock('../../../Components/ActionIconBox', () => ({
  ActionIconBox: ({
    children,
    title,
    onClick,
  }: {
    children: React.ReactNode;
    title?: string;
    onClick?: React.MouseEventHandler;
  }) => (
    <button aria-label={title} onClick={onClick}>
      {children}
    </button>
  ),
}));
vi.mock('../../../Plugins/code/langIconMap', () => ({
  langIconMap: new Map(),
}));
vi.mock('@sofa-design/icons', () => ({
  Copy: () => <svg />,
  ChevronsUpDown: () => <svg />,
}));

let pendingFrames: Map<number, FrameRequestCallback>;
let nextFrame: number;
const flushFrames = () =>
  act(() => {
    const callbacks = [...pendingFrames.values()];
    pendingFrames.clear();
    callbacks.forEach((callback) => callback(0));
  });

beforeEach(() => {
  vi.clearAllMocks();
  pendingFrames = new Map();
  nextFrame = 0;
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    pendingFrames.set(++nextFrame, callback);
    return nextFrame;
  });
  vi.stubGlobal('cancelAnimationFrame', (id: number) =>
    pendingFrames.delete(id),
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const rows = Array.from({ length: 500 }, (_, index) => ({
  name: `Item ${index}`,
  value: '1万',
}));
const chartCode = JSON.stringify({
  chartType: 'bar',
  x: 'name',
  y: 'value',
  dataSource: rows,
});

describe('Markdown block render boundaries', () => {
  it('keeps chart rows and the chart instance stable during surrounding updates', () => {
    const { rerender } = render(
      <ChartBlockRenderer>{chartCode}</ChartBlockRenderer>,
    );
    flushFrames();
    const chart = screen.getByTestId('chart');
    const initialRows = chartRender.mock.calls.at(-1)?.[0].chartData;
    const initialConfig = chartRender.mock.calls.at(-1)?.[0].config;
    expect(initialRows[0].value).toBe(10000);
    chartRender.mockClear();
    currency.mockClear();
    const parse = vi.spyOn(JSON, 'parse');
    for (let index = 0; index < 20; index++) {
      rerender(
        <ChartBlockRenderer className={`version-${index}`}>
          <span>{chartCode}</span>
        </ChartBlockRenderer>,
      );
    }
    expect(chartRender).not.toHaveBeenCalled();
    expect(currency).not.toHaveBeenCalled();
    expect(
      parse.mock.calls.filter(([input]) => input === chartCode),
    ).toHaveLength(0);
    expect(screen.getByTestId('chart')).toBe(chart);
    const updated = JSON.stringify({
      chartType: 'bar',
      x: 'name',
      y: 'value',
      dataSource: [{ name: 'Changed', value: '42' }],
    });
    rerender(<ChartBlockRenderer>{updated}</ChartBlockRenderer>);
    const latest = chartRender.mock.calls.at(-1)?.[0];
    expect(latest.chartData).not.toBe(initialRows);
    expect(latest.config).not.toBe(initialConfig);
    expect(latest.chartData[0]).toMatchObject({ name: 'Changed', value: 42 });
    expect(screen.getByTestId('chart')).toBe(chart);
  });

  it('updates chart height within the same column count without reprocessing data', () => {
    const { container } = render(
      <ChartBlockRenderer>{chartCode}</ChartBlockRenderer>,
    );
    const chart = container.querySelector('[data-be="chart"]')!;
    Object.defineProperty(chart, 'clientWidth', {
      configurable: true,
      value: 300,
    });
    flushFrames();
    const initialRows = chartRender.mock.calls.at(-1)?.[0].chartData;
    expect(chartRender.mock.calls.at(-1)?.[0].config.height).toBe(300);
    chartRender.mockClear();
    currency.mockClear();
    Object.defineProperty(chart, 'clientWidth', {
      configurable: true,
      value: 350,
    });
    act(() => window.dispatchEvent(new Event('resize')));
    expect(chartRender.mock.calls.at(-1)?.[0].config.height).toBe(350);
    expect(chartRender.mock.calls.at(-1)?.[0].chartData).toBe(initialRows);
    expect(currency).not.toHaveBeenCalled();
    chartRender.mockClear();
    for (let index = 0; index < 20; index++)
      act(() => window.dispatchEvent(new Event('resize')));
    expect(chartRender).not.toHaveBeenCalled();
  });

  it('does not invalidate default schema rendering through newly allocated empty values', () => {
    const code = JSON.stringify({ component: { schema: '<p>Hello</p>' } });
    const customRender = vi.fn(() => undefined);
    const { rerender } = render(
      <SchemaBlockRenderer language="schema">{code}</SchemaBlockRenderer>,
    );
    const schema = screen.getByTestId('schema');
    const initialValues = schemaRender.mock.calls.at(-1)?.[0].values;
    schemaRender.mockClear();
    for (let index = 0; index < 20; index++) {
      rerender(
        <SchemaBlockRenderer
          language="schema"
          editorCodeProps={{ render: customRender }}
        >
          <span>{code}</span>
        </SchemaBlockRenderer>,
      );
    }
    expect(schemaRender).not.toHaveBeenCalled();
    expect(customRender).toHaveBeenCalledTimes(20);
    expect(screen.getByTestId('schema')).toBe(schema);
    const next = JSON.stringify({
      component: { schema: '<p>Updated</p>' },
      initialValues: { name: 'Updated' },
    });
    rerender(
      <SchemaBlockRenderer language="schema">{next}</SchemaBlockRenderer>,
    );
    expect(schemaRender.mock.calls.at(-1)?.[0].values).not.toBe(initialValues);
    expect(schemaRender.mock.calls.at(-1)?.[0].values).toEqual({
      name: 'Updated',
    });
  });

  it('retains current custom schema callbacks without repeatedly stringifying unchanged schemas', () => {
    const value = {
      marker: 'test-schema',
      component: { schema: '<p>Hello</p>' },
    };
    const code = JSON.stringify(value);
    const first = vi.fn(() => <p>First callback</p>);
    const { rerender } = render(
      <SchemaBlockRenderer apaasifyRender={first}>{code}</SchemaBlockRenderer>,
    );
    const stringify = vi.spyOn(JSON, 'stringify');
    const next = vi.fn(() => <p>Latest callback</p>);
    rerender(
      <SchemaBlockRenderer apaasifyRender={next}>
        <span>{code}</span>
      </SchemaBlockRenderer>,
    );
    expect(screen.getByText('Latest callback')).toBeInTheDocument();
    expect(next).toHaveBeenCalledWith(value);
    expect(
      stringify.mock.calls.filter(
        ([input]) => (input as typeof value)?.marker === value.marker,
      ),
    ).toHaveLength(0);
  });

  it('uses one language wrapper per code toolbar while preserving copy and collapse actions', () => {
    const copy = vi.fn();
    const toggle = vi.fn();
    const { container } = render(
      <>
        {Array.from({ length: 100 }, (_, index) => (
          <CodeBlockToolbar
            key={index}
            language="test"
            expanded
            theme="light"
            onCopy={copy}
            onToggleExpanded={toggle}
          />
        ))}
      </>,
    );
    expect(container.querySelectorAll('*')).toHaveLength(800);
    const buttons = container.querySelectorAll('button');
    fireEvent.click(buttons[0]);
    fireEvent.click(buttons[1]);
    expect(copy).toHaveBeenCalledTimes(1);
    expect(toggle).toHaveBeenCalledTimes(1);
  });
});
