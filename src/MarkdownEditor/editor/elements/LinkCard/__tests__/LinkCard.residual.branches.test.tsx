/**
 * LinkCard residual：finished=false 骨架→超时文本；完成态渲染。
 */
import { act, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LinkCard } from '../index';

const attrs = { 'data-slate-node': 'element' } as any;

describe('LinkCard residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it.skip('finished=false 先骨架，5s 后文本回退', () => {
    render(
      <ConfigProvider>
        <LinkCard
          element={
            {
              type: 'link-card',
              finished: false,
              url: 'https://x.test',
              children: [{ text: '' }],
            } as any
          }
          attributes={attrs}
        >
          <span key="c">c</span>
        </LinkCard>
      </ConfigProvider>,
    );
    expect(document.querySelector('.ant-skeleton')).toBeTruthy();
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByText('https://x.test')).toBeTruthy();
  });

  it.skip('finished 完成态；无 contentCls 时 blockCls 空', () => {
    const { container } = render(
      <LinkCard
        element={
          {
            type: 'link-card',
            finished: true,
            title: 'TitleOnly',
            name: 'n',
            url: '',
            collaborators: [{ a: 1 }],
            updateTime: 't',
            children: [{ text: '' }],
          } as any
        }
        attributes={attrs}
      >
        <span key="icon">ICON</span>
        <span key="x">x</span>
      </LinkCard>,
    );
    expect(container.querySelector('[data-be="link-card"]')).toBeTruthy();
    expect(screen.getByText('ICON')).toBeTruthy();
  });

  it.skip('finished 从 false 变 true 清理超时', () => {
    const { rerender } = render(
      <ConfigProvider>
        <LinkCard
          element={{ type: 'link-card', finished: false, url: 'u' } as any}
          attributes={attrs}
        />
      </ConfigProvider>,
    );
    rerender(
      <ConfigProvider>
        <LinkCard
          element={
            {
              type: 'link-card',
              finished: true,
              url: 'u',
              title: 'T',
              children: [{ text: '' }],
            } as any
          }
          attributes={attrs}
        >
          <span key="i">i</span>
        </LinkCard>
      </ConfigProvider>,
    );
    act(() => {
      vi.advanceTimersByTime(6000);
    });
    expect(document.querySelector('[data-be="link-card"]')).toBeTruthy();
  });
});
