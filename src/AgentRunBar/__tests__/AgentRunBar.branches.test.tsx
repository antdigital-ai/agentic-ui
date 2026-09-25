/**
 * AgentRunBar 补充分支：iconTooltip、locale 覆盖、缺回调、actionsRender 返回 null、
 * running+pause 组合、error/default 动作表。
 *
 * 注意：组件从 I18nContext 读取 locale，props.locale 不会生效。
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

const wrap = (
  ui: React.ReactElement,
  agentRunBarOverride?: Partial<(typeof cnLabels)['agentRunBar']>,
) =>
  render(
    <ConfigProvider>
      <I18nContext.Provider
        value={{
          locale: {
            ...cnLabels,
            agentRunBar: {
              ...cnLabels.agentRunBar,
              ...agentRunBarOverride,
            },
          },
          language: 'zh-CN',
        }}
      >
        {ui}
      </I18nContext.Provider>
    </ConfigProvider>,
  );

describe('AgentRunBar 分支补充', () => {
  it('自定义 icon + iconTooltip', () => {
    wrap(
      <AgentRunBar
        taskStatus={TASK_STATUS.RUNNING}
        taskRunningStatus={TASK_RUNNING_STATUS.RUNNING}
        icon={<span data-testid="custom-icon">🤖</span>}
        iconTooltip="机器人"
        title="t"
        description="d"
      />,
    );
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('locale.agentRunBar 覆盖按钮文案', () => {
    wrap(
      <AgentRunBar
        taskStatus={TASK_STATUS.SUCCESS}
        taskRunningStatus={TASK_RUNNING_STATUS.COMPLETE}
        onReplay={vi.fn()}
        onViewResult={vi.fn()}
        onCreateNewTask={vi.fn()}
      />,
      {
        replayTask: '再跑一次',
        submitTask: '查看结果',
        newTask: '新建',
      },
    );
    expect(screen.getByText('再跑一次')).toBeInTheDocument();
    expect(screen.getByText('查看结果')).toBeInTheDocument();
    expect(screen.getByText('新建')).toBeInTheDocument();
  });

  it('缺 onReplay 时 success 不渲染重试按钮', () => {
    wrap(
      <AgentRunBar
        taskStatus={TASK_STATUS.SUCCESS}
        taskRunningStatus={TASK_RUNNING_STATUS.COMPLETE}
        onViewResult={vi.fn()}
        onCreateNewTask={vi.fn()}
      />,
    );
    expect(screen.queryByText('重试')).not.toBeInTheDocument();
  });

  it('actionsRender 返回 null 仍显示控制按钮', () => {
    wrap(
      <AgentRunBar
        taskStatus={TASK_STATUS.RUNNING}
        taskRunningStatus={TASK_RUNNING_STATUS.RUNNING}
        onPause={vi.fn()}
        onStop={vi.fn()}
        actionsRender={() => null}
      />,
      { pause: '暂停X', stop: '停止X' },
    );
    expect(screen.getByLabelText('暂停X')).toBeInTheDocument();
    expect(screen.getByLabelText('停止X')).toBeInTheDocument();
  });

  it('RUNNING + PAUSE 显示继续/停止', () => {
    const onResume = vi.fn();
    const onStop = vi.fn();
    wrap(
      <AgentRunBar
        taskStatus={TASK_STATUS.RUNNING}
        taskRunningStatus={TASK_RUNNING_STATUS.PAUSE}
        onResume={onResume}
        onStop={onStop}
        onCreateNewTask={vi.fn()}
      />,
      { play: '继续X', stop: '停止X', newTask: '新' },
    );
    fireEvent.click(screen.getByLabelText('继续X'));
    expect(onResume).toHaveBeenCalled();
    fireEvent.click(screen.getByLabelText('停止X'));
    expect(onStop).toHaveBeenCalled();
  });

  it('ERROR 状态动作表', () => {
    wrap(
      <AgentRunBar
        taskStatus={TASK_STATUS.ERROR}
        taskRunningStatus={TASK_RUNNING_STATUS.COMPLETE}
        onReplay={vi.fn()}
        onViewResult={vi.fn()}
        onCreateNewTask={vi.fn()}
      />,
    );
    expect(screen.getByText('重试')).toBeInTheDocument();
  });

  it('simple 变体暂停态图标', () => {
    wrap(
      <AgentRunBar
        variant="simple"
        taskStatus={TASK_STATUS.PAUSE}
        taskRunningStatus={TASK_RUNNING_STATUS.PAUSE}
        onResume={vi.fn()}
        onStop={vi.fn()}
        onCreateNewTask={vi.fn()}
      />,
      { play: '继续', stop: '停止', newTask: '新任务' },
    );
    expect(screen.getByLabelText('继续')).toBeInTheDocument();
  });

  it('RUNNING 态展示停止；缺省 locale 回退', () => {
    wrap(
      <AgentRunBar
        taskStatus={TASK_STATUS.RUNNING}
        taskRunningStatus={TASK_RUNNING_STATUS.RUNNING}
        onStop={vi.fn()}
        onPause={vi.fn()}
      />,
    );
    expect(screen.getAllByLabelText('停止').length).toBeGreaterThan(0);
  });
});
