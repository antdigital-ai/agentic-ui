/**
 * SkillModeBar deepen：非 test 动画路径、空 locale 默认文案、open enter/exit。
 */
import '@testing-library/jest-dom';
import { act, cleanup, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { I18nContext } from '../../../I18n';
import { SkillModeBar } from '../index';

describe('SkillModeBar deepen residual branches', () => {
  const prevEnv = process.env.NODE_ENV;

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    process.env.NODE_ENV = prevEnv;
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('test 环境 open false→true 走 enter', () => {
    const { rerender } = render(
      <ConfigProvider>
        <SkillModeBar skillMode={{ open: false, title: 'S' }} />
      </ConfigProvider>,
    );
    expect(screen.queryByTestId('skill-mode-bar')).toBeNull();
    rerender(
      <ConfigProvider>
        <SkillModeBar skillMode={{ open: true, title: 'S' }} />
      </ConfigProvider>,
    );
    expect(screen.getByTestId('skill-mode-bar')).toHaveAttribute(
      'data-state',
      'enter',
    );
  });

  it('空 locale：region/close 默认中文', () => {
    render(
      <ConfigProvider>
        <I18nContext.Provider value={{ locale: {} as any, language: 'zh-CN' }}>
          <SkillModeBar
            skillMode={{ open: true, title: 'T', closable: true }}
          />
        </I18nContext.Provider>
      </ConfigProvider>,
    );
    expect(screen.getByLabelText('技能模式')).toBeInTheDocument();
    expect(screen.getByLabelText('关闭技能模式')).toBeInTheDocument();
  });

  it('非 test：open 触发 rAF enter；关闭后 300ms 卸载', async () => {
    process.env.NODE_ENV = 'development';
    const rafSpy = vi
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((cb: FrameRequestCallback) => {
        cb(0);
        return 1;
      });

    const { rerender } = render(
      <ConfigProvider>
        <SkillModeBar skillMode={{ open: true, title: 'Dev' }} />
      </ConfigProvider>,
    );
    expect(screen.getByTestId('skill-mode-bar')).toBeInTheDocument();

    rerender(
      <ConfigProvider>
        <SkillModeBar skillMode={{ open: false, title: 'Dev' }} />
      </ConfigProvider>,
    );
    expect(screen.getByTestId('skill-mode-bar')).toHaveAttribute(
      'data-state',
      'exit',
    );
    await act(async () => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.queryByTestId('skill-mode-bar')).toBeNull();
    rafSpy.mockRestore();
  });
});
