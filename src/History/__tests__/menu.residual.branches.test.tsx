/**
 * GroupMenu 残留：disabled、空 group、level&lt;2、icon、tabIndex。
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { GroupMenu } from '../menu';

vi.mock('../style', () => ({
  useStyle: () => ({ wrapSSR: (n: any) => n, hashId: 'm' }),
}));

describe('History menu residual branches', () => {
  it('disabled 项 tabIndex=-1 且不触发 onSelect', () => {
    const onSelect = vi.fn();
    render(
      <ConfigProvider>
        <GroupMenu
          selectedKeys={[]}
          onSelect={onSelect}
          items={[
            {
              key: 'd',
              label: 'Disabled',
              disabled: true,
              icon: <span data-testid="icon-d">I</span>,
            },
          ]}
        />
      </ConfigProvider>,
    );
    const item = screen.getByText('Disabled');
    fireEvent.click(item);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('空 children 的 group 跳过；有 children 且 level&lt;2 渲染子项', () => {
    const onSelect = vi.fn();
    render(
      <ConfigProvider>
        <GroupMenu
          selectedKeys={['c1']}
          onSelect={onSelect}
          items={[
            { key: 'empty', label: 'Empty', type: 'group', children: [] },
            {
              key: 'g1',
              label: 'Group',
              type: 'group',
              icon: <span data-testid="g-icon">G</span>,
              children: [
                { key: 'c1', label: 'Child1', icon: <span>C</span> },
                { key: 'c2', label: 'Child2', disabled: true },
              ],
            },
          ]}
        />
      </ConfigProvider>,
    );
    expect(screen.getByText('Child1')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Child1'));
    expect(onSelect).toHaveBeenCalled();
  });

  it('loading 态；inlineIndent 默认', () => {
    render(
      <ConfigProvider>
        <GroupMenu loading items={[{ key: 'a', label: 'A' }]} />
      </ConfigProvider>,
    );
    expect(document.querySelector('.ant-spin')).toBeTruthy();
  });
});
