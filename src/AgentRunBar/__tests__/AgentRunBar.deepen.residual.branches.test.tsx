/**
 * AgentRunBar deepen：ERROR / SUCCESS 动作区。
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cnLabels, I18nContext } from '../../I18n';
import {
  AgentRunBar,
  TASK_RUNNING_STATUS,
  TASK_STATUS,
} from '../index';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

const wrap = (ui: React.ReactElement) =>
  render(
    <ConfigProvider>
      <I18nContext.Provider value={{ locale: cnLabels, language: 'zh-CN' }}>
        {ui}
      </I18nContext.Provider>
    </ConfigProvider>,
  );

describe('AgentRunBar deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('ERROR 状态显示重试', () => {
    const onReplay = vi.fn();
    wrap(
      <AgentRunBar
        taskStatus={TASK_STATUS.ERROR}
        taskRunningStatus={TASK_RUNNING_STATUS.COMPLETE}
        onReplay={onReplay}
        onCreateNewTask={vi.fn()}
        title="err"
      />,
    );
    fireEvent.click(screen.getByText(/重试|再试|Replay/i));
    expect(onReplay).toHaveBeenCalled();
  });

  it('SUCCESS 非 COMPLETE 不走 successComplete', () => {
    wrap(
      <AgentRunBar
        taskStatus={TASK_STATUS.SUCCESS}
        taskRunningStatus={TASK_RUNNING_STATUS.RUNNING}
        onCreateNewTask={vi.fn()}
        title="run"
      />,
    );
    expect(screen.getByText('run')).toBeTruthy();
  });
});
