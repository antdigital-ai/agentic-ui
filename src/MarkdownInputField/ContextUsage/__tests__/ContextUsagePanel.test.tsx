import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { computeBarSegments, ContextUsagePanel } from '../ContextUsagePanel';

const category = (key: string, tokenCount: number, color?: string) => ({
  key,
  name: key,
  tokenCount,
  color,
});

describe('computeBarSegments（对齐 IDE computeBarSegments）', () => {
  it('分类宽度 = tokenCount / contextWindow', () => {
    const segments = computeBarSegments(
      [category('a', 25000), category('b', 25000)],
      100000,
      50000,
    );
    expect(segments).toHaveLength(2);
    expect(segments[0].widthPercent).toBeCloseTo(25);
  });

  it('分类合计超过总占用时按比例缩回', () => {
    const segments = computeBarSegments(
      [category('a', 60000), category('b', 60000)],
      100000,
      100000,
    );
    const total = segments.reduce((sum, s) => sum + s.widthPercent, 0);
    expect(total).toBeCloseTo(100, 0);
    expect(segments[0].widthPercent).toBeCloseTo(50);
  });

  it('分类覆盖不足时补残差分段', () => {
    const segments = computeBarSegments([category('a', 30000)], 100000, 50000);
    expect(segments).toHaveLength(2);
    expect(segments[1].key).toBe('__residual');
    expect(segments[1].widthPercent).toBeCloseTo(20);
  });

  it('无分类时仅剩聚合分段且保证最小可见宽度', () => {
    const segments = computeBarSegments([], 100000, 100);
    expect(segments).toHaveLength(1);
    expect(segments[0].key).toBe('__aggregate');
    expect(segments[0].widthPercent).toBeGreaterThanOrEqual(0.45);
  });

  it('零占用返回空分段', () => {
    expect(computeBarSegments([category('a', 100)], 100000, 0)).toEqual([]);
  });

  it('未传 color 时按默认色板取色', () => {
    const segments = computeBarSegments(
      [category('a', 1000), category('b', 1000)],
      100000,
      2000,
    );
    expect(segments[0].color).not.toBe(segments[1].color);
  });
});

describe('ContextUsagePanel', () => {
  const baseProps = {
    usedTokens: 53200,
    contextWindow: 128000,
    labels: {
      title: 'Context Usage',
      close: 'Close',
      occupancy: 'Context occupancy 42%',
      tokenSummary: '53.2K / 128K',
      compact: 'Compact session',
      compacting: 'Compacting…',
    },
    onClose: () => {},
  };

  it('渲染标题、摘要、分段条形图与压缩按钮', () => {
    const { getByTestId, getByText } = render(
      <ContextUsagePanel
        {...baseProps}
        categories={[category('system', 20000), category('messages', 33200)]}
        onCompact={() => {}}
      />,
    );
    expect(getByTestId('context-usage-panel-meter')).toBeTruthy();
    expect(getByText('53.2K / 128K')).toBeTruthy();
    expect(getByText('Compact session')).toBeTruthy();
  });

  it('分类行可展开明细', () => {
    const { getByText } = render(
      <ContextUsagePanel
        {...baseProps}
        categories={[
          {
            ...category('skills', 8000),
            items: [{ label: 'pdf-reader', estimatedTokens: 5000 }],
          },
        ]}
      />,
    );
    fireEvent.click(getByText('skills'));
    expect(getByText('pdf-reader')).toBeTruthy();
    expect(getByText('5K')).toBeTruthy();
  });

  it('高用量时渲染警告行', () => {
    const { getByTestId } = render(
      <ContextUsagePanel
        {...baseProps}
        usedTokens={120000}
        categories={[category('messages', 120000)]}
      />,
    );
    expect(getByTestId('context-usage-panel-warning')).toBeTruthy();
  });

  it('onCompact 触发且禁用态不触发', () => {
    const onCompact = vi.fn();
    const { getByText, rerender } = render(
      <ContextUsagePanel
        {...baseProps}
        onCompact={onCompact}
        compactDisabled
      />,
    );
    fireEvent.click(getByText('Compact session'));
    expect(onCompact).not.toHaveBeenCalled();

    rerender(<ContextUsagePanel {...baseProps} onCompact={onCompact} />);
    fireEvent.click(getByText('Compact session'));
    expect(onCompact).toHaveBeenCalledTimes(1);
  });
});
