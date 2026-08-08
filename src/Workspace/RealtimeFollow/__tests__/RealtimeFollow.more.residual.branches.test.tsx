/**
 * RealtimeFollow more residual：RealtimeFollowList header/back、html 受控、customContent。
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { RealtimeFollow, RealtimeFollowList } from '../index';

vi.mock('../style', () => ({
  useRealtimeFollowStyle: () => ({ hashId: 'h' }),
}));

describe('RealtimeFollow more residual branches', () => {
  it('RealtimeFollowList：onBack + title/subTitle/icon/rightContent', () => {
    const onBack = vi.fn();
    const Icon = () => <span data-testid="ico">I</span>;
    render(
      <ConfigProvider>
        <RealtimeFollowList
          data={{
            type: 'markdown',
            content: '# h',
            status: 'done',
            title: 'Custom',
            subTitle: 'sub',
            icon: Icon,
            rightContent: <span>RC</span>,
            onBack,
            className: 'rt-x',
            style: { padding: 4 },
          }}
        />
      </ConfigProvider>,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onBack).toHaveBeenCalled();
    expect(screen.getByText('Custom')).toBeTruthy();
    expect(screen.getByText('sub')).toBeTruthy();
    expect(screen.getByText('RC')).toBeTruthy();
  });

  it('html 受控 viewMode；segmentedItems；onViewModeChange', () => {
    const onViewModeChange = vi.fn();
    render(
      <ConfigProvider>
        <RealtimeFollowList
          data={{
            type: 'html',
            content: '<b>1</b>',
            status: 'done',
            viewMode: 'code',
            onViewModeChange,
            labels: { preview: 'P', code: 'C' },
            segmentedExtra: <span>ex</span>,
          }}
        />
      </ConfigProvider>,
    );
    expect(screen.getByTestId('realtime-follow')).toBeTruthy();
  });

  it('html 非受控 defaultViewMode + segmentedItems', () => {
    const onViewModeChange = vi.fn();
    render(
      <ConfigProvider>
        <RealtimeFollowList
          data={{
            type: 'html',
            content: '<p>a</p>',
            status: 'done',
            defaultViewMode: 'preview',
            onViewModeChange,
            segmentedItems: [
              { label: 'A', value: 'preview' },
              { label: 'B', value: 'code' },
            ],
          }}
        />
      </ConfigProvider>,
    );
    fireEvent.click(screen.getByText('B'));
    expect(onViewModeChange).toHaveBeenCalledWith('code');
  });

  it('customContent 函数；未知 type 返回 null；prefixCls', () => {
    render(
      <ConfigProvider>
        <RealtimeFollow
          prefixCls="rt-custom"
          data={{
            type: 'default',
            status: 'done',
            customContent: () => <span>custom-fn</span>,
          }}
        />
      </ConfigProvider>,
    );
    expect(screen.getByText('custom-fn')).toBeTruthy();

    const { container } = render(
      <ConfigProvider>
        <RealtimeFollow data={{ type: 'diff' as any, content: 'x' }} />
      </ConfigProvider>,
    );
    expect(container.textContent).toBe('');
  });

  it('shell streaming/typewriter 在 test 环境不崩', () => {
    render(
      <ConfigProvider>
        <RealtimeFollow
          data={{
            type: 'shell',
            content: 'echo 1',
            status: 'done',
            streaming: true,
            typewriter: true,
          }}
          htmlViewMode="preview"
        />
      </ConfigProvider>,
    );
    expect(document.body.textContent).toMatch(/echo/);
  });
});
