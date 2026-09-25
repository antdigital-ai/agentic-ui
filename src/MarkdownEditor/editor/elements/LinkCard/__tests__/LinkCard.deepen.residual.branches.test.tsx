/**
 * LinkCard deepen：无 prefixCls；超时后无 url/title/name 回退文案。
 */
import { act, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LinkCard } from '../index';

const attrs = { 'data-slate-node': 'element' } as any;

describe('LinkCard deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.restoreAllMocks();
  });

  it('finished=false 超时后无字段回退「链接卡片」', () => {
    render(
      <LinkCard
        element={
          {
            type: 'link-card',
            finished: false,
            children: [{ text: '' }],
          } as any
        }
        attributes={attrs}
      >
        <span>c</span>
      </LinkCard>,
    );
    expect(document.querySelector('.ant-skeleton')).toBeTruthy();
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByText('链接卡片')).toBeTruthy();
  });

  it('finished 完成态无 ConfigProvider prefix 时仍渲染卡片', () => {
    const { container } = render(
      <LinkCard
        element={
          {
            type: 'link-card',
            finished: true,
            title: 'T',
            url: 'https://t.test',
            collaborators: [],
            updateTime: '',
            children: [{ text: '' }],
          } as any
        }
        attributes={attrs}
      >
        <span key="icon">ICON</span>
        <span key="body">body</span>
      </LinkCard>,
    );
    expect(container.querySelector('[data-be="link-card"]')).toBeTruthy();
    expect(screen.getByText('ICON')).toBeTruthy();
  });
});
