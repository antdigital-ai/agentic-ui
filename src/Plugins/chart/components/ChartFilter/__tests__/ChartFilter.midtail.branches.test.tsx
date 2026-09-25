/**
 * ChartFilter mid-tail：空选项、主题/variant、二级下拉与 Segmented。
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@sofa-design/icons', () => ({
  ChevronDown: () => <span data-testid="chevron" />,
}));

import ChartFilter from '../ChartFilter';

const wrap = (ui: React.ReactElement) =>
  render(<ConfigProvider>{ui}</ConfigProvider>);

describe('ChartFilter midtail branches', () => {
  it('选项不足时返回 null', () => {
    const { container: c1 } = wrap(<ChartFilter />);
    expect(c1.firstChild).toBeNull();

    const { container: c2 } = wrap(
      <ChartFilter filterOptions={[{ label: 'A', value: 'a' }]} />,
    );
    expect(c2.firstChild).toBeNull();

    const { container: c3 } = wrap(
      <ChartFilter
        customOptions={[
          { key: 'r1', label: 'R1' },
          { key: 'r2', label: 'R2' },
        ]}
      />,
    );
    expect(c3.firstChild).toBeNull();
  });

  it('主筛选 Segmented 触发 onFilterChange；dark/compact', () => {
    const onFilterChange = vi.fn();
    const { container } = wrap(
      <ChartFilter
        filterOptions={[
          { label: 'A', value: 'a' },
          { label: 'B', value: 'b' },
        ]}
        selectedFilter="a"
        onFilterChange={onFilterChange}
        theme="dark"
        variant="compact"
        className="extra"
        classNames={['x']}
        styles={[{ margin: 1 }]}
      />,
    );
    expect(container.querySelector('.extra')).toBeTruthy();
    const opts = screen.getAllByRole('radio');
    expect(opts.length).toBeGreaterThanOrEqual(2);
    fireEvent.click(opts[1]);
    expect(onFilterChange).toHaveBeenCalled();
  });

  it('二级 customOptions Dropdown 触发 onSelectionChange', async () => {
    const onSelectionChange = vi.fn();
    wrap(
      <ChartFilter
        filterOptions={[
          { label: 'A', value: 'a' },
          { label: 'B', value: 'b' },
        ]}
        customOptions={[
          { key: 'east', label: 'East' },
          { key: 'west', label: 'West' },
        ]}
        selectedCustomSelection="east"
        onSelectionChange={onSelectionChange}
      />,
    );
    const btn = screen.getByRole('button');
    fireEvent.click(btn);
    const item = await screen.findByText('West');
    fireEvent.click(item);
    expect(onSelectionChange).toHaveBeenCalledWith('west');
  });

  it('无回调时点击不抛错', () => {
    wrap(
      <ChartFilter
        filterOptions={[
          { label: 'A', value: 'a' },
          { label: 'B', value: 'b' },
        ]}
        selectedFilter="a"
      />,
    );
    fireEvent.click(screen.getAllByRole('radio')[1]);
  });
});
