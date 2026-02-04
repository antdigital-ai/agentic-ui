import { render, screen, waitFor } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { History, HistoryDataType } from '../../src/History';

// 提供必要的上下文
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ConfigProvider>{children}</ConfigProvider>
);

describe('History Running Icon', () => {
  const mockHistoryData: HistoryDataType[] = [
    {
      id: '1',
      sessionId: 'session-1',
      sessionTitle: '运行中的任务1',
      gmtCreate: Date.now() - 1000 * 60 * 60,
      gmtLastConverse: Date.now() - 1000 * 30 * 60,
      isFavorite: false,
    },
    {
      id: '2',
      sessionId: 'session-2',
      sessionTitle: '普通任务2',
      gmtCreate: Date.now() - 1000 * 60 * 60 * 24,
      gmtLastConverse: Date.now() - 1000 * 60 * 60 * 2,
      isFavorite: true,
    },
    {
      id: '3',
      sessionId: 'session-3',
      sessionTitle: '运行中的任务3',
      gmtCreate: Date.now() - 1000 * 60 * 60 * 2,
      gmtLastConverse: Date.now() - 1000 * 60 * 60,
      isFavorite: false,
    },
  ];

  const defaultProps = {
    agentId: 'test-agent',
    sessionId: 'current-session',
    request: vi.fn().mockResolvedValue(mockHistoryData),
  };

  it('应该支持 agent.runningId 配置', async () => {
    render(
      <TestWrapper>
        <History
          {...defaultProps}
          agent={{
            enabled: true,
            runningId: ['1', '3'],
          }}
          standalone
        />
      </TestWrapper>,
    );

    // 等待数据加载完成
    await waitFor(
      () => {
        expect(screen.getByRole('menu')).toBeInTheDocument();
      },
      { timeout: 1000 },
    );

    // 验证组件正常渲染
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('应该支持空的 agent.runningId 数组', async () => {
    render(
      <TestWrapper>
        <History
          {...defaultProps}
          agent={{
            enabled: true,
            runningId: [],
          }}
          standalone
        />
      </TestWrapper>,
    );

    // 等待数据加载完成
    await waitFor(
      () => {
        expect(screen.getByRole('menu')).toBeInTheDocument();
      },
      { timeout: 1000 },
    );

    // 验证组件正常渲染
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('应该支持未定义的 agent.runningId', async () => {
    render(
      <TestWrapper>
        <History
          {...defaultProps}
          agent={{
            enabled: true,
          }}
          standalone
        />
      </TestWrapper>,
    );

    // 等待数据加载完成
    await waitFor(
      () => {
        expect(screen.getByRole('menu')).toBeInTheDocument();
      },
      { timeout: 1000 },
    );

    // 验证组件正常渲染
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });
});
