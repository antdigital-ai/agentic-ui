/**
 * LayoutHeader deepen：空 locale 走中文 fallback；双侧折叠 + 分享。
 */
import '@testing-library/jest-dom';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { I18nContext } from '../../../I18n';
import { LayoutHeader } from '../index';

describe('LayoutHeader deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.restoreAllMocks();
  });

  it('空 locale 使用折叠/分享中文 fallback', () => {
    const onLeft = vi.fn();
    const onRight = vi.fn();
    const onShare = vi.fn();
    render(
      <ConfigProvider>
        <I18nContext.Provider value={{ locale: {}, language: 'zh-CN' } as any}>
          <LayoutHeader
            title="T"
            leftCollapsible
            rightCollapsible
            showShare
            onLeftCollapse={onLeft}
            onRightCollapse={onRight}
            onShare={onShare}
            leftExtra={<span data-testid="lx">L</span>}
            rightExtra={<span data-testid="rx">R</span>}
          />
        </I18nContext.Provider>
      </ConfigProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: '折叠左侧边栏' }));
    fireEvent.click(screen.getByRole('button', { name: '折叠右侧边栏' }));
    fireEvent.click(screen.getByRole('button', { name: '分享对话' }));
    expect(onLeft).toHaveBeenCalled();
    expect(onRight).toHaveBeenCalled();
    expect(onShare).toHaveBeenCalled();
    expect(screen.getByTestId('lx')).toBeInTheDocument();
    expect(screen.getByTestId('rx')).toBeInTheDocument();
    expect(screen.getByText('分享')).toBeInTheDocument();
  });
});
