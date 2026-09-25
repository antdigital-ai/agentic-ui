/**
 * LinkCard：finished false 骨架 / 超时文本 / 完成态。
 */
import { act, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LinkCard } from '../index';

const attrs = { 'data-slate-node': 'element' as const, ref: null };

describe('LinkCard branches', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('finished false 显示骨架', () => {
    render(
      <ConfigProvider>
        <LinkCard
          attributes={attrs as any}
          element={
            {
              type: 'link-card',
              finished: false,
              url: 'https://a.com',
              title: 'T',
              children: [{ text: '' }],
            } as any
          }
        >
          {['icon', 'rest'] as any}
        </LinkCard>
      </ConfigProvider>,
    );
    expect(document.querySelector('.ant-skeleton')).toBeTruthy();
  });

  it.skip('超时后显示文本回退', () => {
    vi.useFakeTimers();
    render(
      <ConfigProvider>
        <LinkCard
          attributes={attrs as any}
          element={
            {
              type: 'link-card',
              finished: false,
              url: 'https://a.com',
              children: [{ text: '' }],
            } as any
          }
        >
          {['icon'] as any}
        </LinkCard>
      </ConfigProvider>,
    );
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByText('https://a.com')).toBeTruthy();
  });

  it('finished 完成态渲染 link-card', () => {
    render(
      <ConfigProvider>
        <LinkCard
          attributes={attrs as any}
          element={
            {
              type: 'link-card',
              finished: true,
              url: 'https://a.com',
              title: 'Done',
              name: 'N',
              children: [{ text: '' }],
            } as any
          }
        >
          {['icon-child', null] as any}
        </LinkCard>
      </ConfigProvider>,
    );
    expect(document.querySelector('[data-be="link-card"]')).toBeTruthy();
  });

  it.skip('超时无 url/title/name 时用默认文案', () => {
    vi.useFakeTimers();
    render(
      <ConfigProvider>
        <LinkCard
          attributes={attrs as any}
          element={
            {
              type: 'link-card',
              finished: false,
              children: [{ text: '' }],
            } as any
          }
        >
          {[] as any}
        </LinkCard>
      </ConfigProvider>,
    );
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByText('链接卡片')).toBeTruthy();
  });

  it.skip('finished=false 骨架；5s 后文本回退；无 ConfigProvider blockCls', () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const { rerender } = render(
      <LinkCard
        attributes={attrs as any}
        element={
          {
            type: 'link-card',
            finished: false,
            url: 'https://u.com',
            children: [{ text: '' }],
          } as any
        }
      >
        {[] as any}
      </LinkCard>,
    );
    expect(document.querySelector('.ant-skeleton')).toBeTruthy();
    act(() => {
      vi.advanceTimersByTime(5001);
    });
    expect(screen.getByText('https://u.com')).toBeInTheDocument();

    rerender(
      <LinkCard
        attributes={attrs as any}
        element={
          {
            type: 'link-card',
            finished: true,
            title: 'T',
            url: 'https://u.com',
            children: [{ text: '' }],
            otherProps: { icon: 'https://i.com/i.png' },
          } as any
        }
      >
        {['icon', null] as any}
      </LinkCard>,
    );
    expect(document.querySelector('[data-be="link-card"]')).toBeTruthy();
    vi.clearAllTimers();
  });
});
