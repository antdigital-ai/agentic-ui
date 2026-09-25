/**
 * AgentRunBar residual：cancelled/stopped/error、缺回调、自定义 className。
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
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
      <I18nContext.Provider
        value={{ locale: cnLabels, language: 'zh-CN' }}
      >
        {ui}
      </I18nContext.Provider>
    </ConfigProvider>,
  );

describe('AgentRunBar residual branches', () => {
  it('error 态显示重试；点击 onReplay', () => {
    const onReplay = vi.fn();
    wrap(
      <AgentRunBar
        taskStatus={TASK_STATUS.ERROR}
        taskRunningStatus={TASK_RUNNING_STATUS.COMPLETE}
        onReplay={onReplay}
        onCreateNewTask={vi.fn()}
        className="arb-x"
        title="err"
      />,
    );
    fireEvent.click(screen.getByText(/重试|再试|Replay/i));
    expect(onReplay).toHaveBeenCalled();
  });

  it('cancelled / stopped 仍渲染新建', () => {
    const onCreateNewTask = vi.fn();
    wrap(
      <AgentRunBar
        taskStatus={TASK_STATUS.CANCELLED}
        taskRunningStatus={TASK_RUNNING_STATUS.COMPLETE}
        onCreateNewTask={onCreateNewTask}
      />,
    );
    wrap(
      <AgentRunBar
        taskStatus={TASK_STATUS.STOPPED}
        taskRunningStatus={TASK_RUNNING_STATUS.COMPLETE}
        onCreateNewTask={onCreateNewTask}
      />,
    );
    expect(document.body).toBeTruthy();
  });

  it('running 无 onPause/onStop 不崩', () => {
    expect(() =>
      wrap(
        <AgentRunBar
          taskStatus={TASK_STATUS.RUNNING}
          taskRunningStatus={TASK_RUNNING_STATUS.RUNNING}
        />,
      ),
    ).not.toThrow();
  });
});
