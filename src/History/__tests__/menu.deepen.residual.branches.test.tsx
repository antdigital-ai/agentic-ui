/**
 * History menu deepen：disabled / 带 icon 项。
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GroupMenu } from '../menu';

vi.mock('../style', () => ({
  useStyle: () => ({ wrapSSR: (n: any) => n, hashId: 'm' }),
}));

describe('History menu deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('默认空 items 渲染', () => {
    expect(() =>
      render(
        <ConfigProvider>
          <GroupMenu selectedKeys={[]} onSelect={() => {}} items={[]} />
        </ConfigProvider>,
      ),
    ).not.toThrow();
  });

  it('可选项点击触发 onSelect', () => {
    const onSelect = vi.fn();
    render(
      <ConfigProvider>
        <GroupMenu
          selectedKeys={[]}
          onSelect={onSelect}
          items={[{ key: 'a', label: 'Alpha', icon: <span>I</span> }]}
        />
      </ConfigProvider>,
    );
    fireEvent.click(screen.getByText('Alpha'));
    expect(onSelect).toHaveBeenCalled();
  });
});
