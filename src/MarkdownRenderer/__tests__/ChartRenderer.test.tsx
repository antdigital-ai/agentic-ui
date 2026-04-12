import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ChartBlockRenderer } from '../renderers/ChartRenderer';

vi.mock('../../Plugins/chart/ChartRender', () => ({
  ChartRender: (props: any) =>
    React.createElement('div', { 'data-testid': 'chart-render' }, JSON.stringify({
      chartType: props.chartType,
      dataLen: props.chartData?.length,
    })),
}));

vi.mock('../../Plugins/chart/loadChartRuntime', () => ({
  loadChartRuntime: vi.fn().mockResolvedValue({}),
}));


describe('ChartBlockRenderer', () => {
  it('renders error state for invalid JSON', () => {
    const { container } = render(
      React.createElement(ChartBlockRenderer, {
        children: 'not valid json',
      } as any),
    );
    expect(container.querySelector('pre')).toBeTruthy();
  });

  it('renders error state for null parse', () => {
    const { container } = render(
      React.createElement(ChartBlockRenderer, {
        children: 'null',
      } as any),
    );
    expect(container.querySelector('pre')).toBeTruthy();
  });

  it('renders with valid chart config array (mounted)', () => {
    const chartData = JSON.stringify([
      { chartType: 'line', x: 'month', y: 'value' },
    ]);
    const { container } = render(
      React.createElement(ChartBlockRenderer, {
        children: chartData,
      } as any),
    );

    expect(container.querySelector('[data-be="chart"]')).toBeTruthy();
    expect(container.querySelector('[data-be="chart"]')).toBeTruthy();
  });

  it('renders with full config format (mounted)', () => {
    const chartData = JSON.stringify({
      config: [{ chartType: 'bar', x: 'x', y: 'y' }],
      dataSource: [{ x: 'A', y: 10 }],
      columns: [
        { title: 'x', dataIndex: 'x' },
        { title: 'y', dataIndex: 'y' },
      ],
    });
    const { container } = render(
      React.createElement(ChartBlockRenderer, {
        children: chartData,
      } as any),
    );

    expect(container.querySelector('[data-be="chart"]')).toBeTruthy();
  });

  it('renders with single config object (mounted)', () => {
    const chartData = JSON.stringify({
      config: { chartType: 'pie', x: 'name', y: 'val' },
      dataSource: [{ name: 'A', val: 10 }],
    });
    const { container } = render(
      React.createElement(ChartBlockRenderer, {
        children: chartData,
      } as any),
    );

    expect(container.querySelector('[data-be="chart"]')).toBeTruthy();
  });

  it('renders with algTypes format (mounted)', () => {
    const chartData = JSON.stringify({
      type: 'histogram',
      value: {
        data: [{ x: 1, y: 2 }],
        dataMetaMap: {},
      },
    });
    const { container } = render(
      React.createElement(ChartBlockRenderer, {
        children: chartData,
      } as any),
    );

    expect(container.querySelector('[data-be="chart"]')).toBeTruthy();
  });

  it('renders with no config, uses chartData as config (mounted)', () => {
    const chartData = JSON.stringify({
      chartType: 'line',
      x: 'a',
      y: 'b',
      dataSource: [{ a: 1, b: 2 }],
    });
    const { container } = render(
      React.createElement(ChartBlockRenderer, {
        children: chartData,
      } as any),
    );

    expect(container.querySelector('[data-be="chart"]')).toBeTruthy();
  });

  it('renders Loading for config without chartType (mounted)', () => {
    const chartData = JSON.stringify({
      config: [{ x: 'month', y: 'value' }],
      dataSource: [{ month: 'Jan', value: 100 }],
    });
    const { container } = render(
      React.createElement(ChartBlockRenderer, {
        children: chartData,
      } as any),
    );

    expect(container.querySelector('[data-be="chart"]')).toBeTruthy();
  });

  it('handles dataSource with Chinese currency values (mounted)', () => {
    const chartData = JSON.stringify({
      config: [{ chartType: 'bar', x: 'name', y: 'val' }],
      dataSource: [{ name: 'A', val: '1.5亿' }],
    });
    const { container } = render(
      React.createElement(ChartBlockRenderer, {
        children: chartData,
      } as any),
    );

    expect(container.querySelector('[data-be="chart"]')).toBeTruthy();
  });

  it('handles dataSource with numeric string values (mounted)', () => {
    const chartData = JSON.stringify({
      config: [{ chartType: 'bar', x: 'name', y: 'val' }],
      dataSource: [{ name: 'A', val: '42' }],
    });
    const { container } = render(
      React.createElement(ChartBlockRenderer, {
        children: chartData,
      } as any),
    );

    expect(container.querySelector('[data-be="chart"]')).toBeTruthy();
  });

  it('handles data field instead of dataSource (mounted)', () => {
    const chartData = JSON.stringify({
      config: [{ chartType: 'bar', x: 'name', y: 'val' }],
      data: [{ name: 'A', val: 10 }],
    });
    const { container } = render(
      React.createElement(ChartBlockRenderer, {
        children: chartData,
      } as any),
    );

    expect(container.querySelector('[data-be="chart"]')).toBeTruthy();
  });

  it('extracts text from nested React elements', () => {
    const chartData = JSON.stringify({
      config: [{ chartType: 'bar', x: 'x', y: 'y' }],
      dataSource: [{ x: 'A', y: 10 }],
    });
    const nestedChildren = React.createElement(
      'span',
      null,
      React.createElement('span', null, chartData),
    );
    const { container } = render(
      React.createElement(ChartBlockRenderer, {
        children: nestedChildren,
      } as any),
    );

    expect(container.querySelector('[data-be="chart"]')).toBeTruthy();
  });

  it('extracts text from number children', () => {
    const { container } = render(
      React.createElement(ChartBlockRenderer, {
        children: 42,
      } as any),
    );
    expect(container.querySelector('pre')).toBeTruthy();
  });

  it('extracts text from array children', () => {
    const chartData = JSON.stringify({
      config: [{ chartType: 'line', x: 'x', y: 'y' }],
      dataSource: [{ x: 'A', y: 1 }],
    });
    const { container } = render(
      React.createElement(ChartBlockRenderer, {
        children: [chartData],
      } as any),
    );

    expect(container.querySelector('[data-be="chart"]')).toBeTruthy();
  });

  it('handles non-string non-parseable x values', () => {
    const chartData = JSON.stringify({
      config: [{ chartType: 'bar', x: 'name', y: 'val' }],
      dataSource: [{ name: 'hello', val: 'world' }],
    });
    const { container } = render(
      React.createElement(ChartBlockRenderer, {
        children: chartData,
      } as any),
    );

    expect(container.querySelector('[data-be="chart"]')).toBeTruthy();
  });
});
