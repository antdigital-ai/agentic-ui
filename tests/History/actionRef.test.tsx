import { render, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { History } from '../../src/History';

// Mock the request function
const mockRequest = vi.fn().mockResolvedValue([
  {
    id: '1',
    sessionId: 'session-1',
    sessionTitle: 'Test Session 1',
    gmtCreate: Date.now(),
  },
  {
    id: '2',
    sessionId: 'session-2',
    sessionTitle: 'Test Session 2',
    gmtCreate: Date.now(),
  },
]);

// 测试组件包装器
const TestComponent = ({
  actionRef,
}: {
  actionRef: React.MutableRefObject<{ reload: () => void } | null>;
}) => {
  return (
    <History
      agentId="test-agent"
      sessionId="test-session"
      request={mockRequest}
      actionRef={actionRef}
      standalone
    />
  );
};

describe('History actionRef', () => {
  beforeEach(() => {
    mockRequest.mockClear();
  });

  it('should expose reload method through actionRef', async () => {
    const actionRef: React.MutableRefObject<{ reload: () => void } | null> = {
      current: null,
    };

    render(<TestComponent actionRef={actionRef} />);

    // 等待组件初始化
    await waitFor(
      () => {
        expect(mockRequest).toHaveBeenCalledWith({ agentId: 'test-agent' });
      },
      { timeout: 1000 },
    );

    // 验证 actionRef 被正确设置
    expect(actionRef.current).toBeDefined();
    expect(typeof actionRef.current?.reload).toBe('function');

    // 清空 mock 调用记录
    mockRequest.mockClear();

    // 通过 actionRef 触发 reload
    actionRef.current?.reload();

    // 验证 reload 方法被调用
    await waitFor(
      () => {
        expect(mockRequest).toHaveBeenCalledWith({ agentId: 'test-agent' });
      },
      { timeout: 1000 },
    );
  });

  it('should reload data when actionRef.reload is called', async () => {
    const actionRef: React.MutableRefObject<{ reload: () => void } | null> = {
      current: null,
    };

    render(<TestComponent actionRef={actionRef} />);

    // 等待初始加载
    await waitFor(
      () => {
        expect(mockRequest).toHaveBeenCalledTimes(1);
      },
      { timeout: 1000 },
    );

    // 清空调用记录
    mockRequest.mockClear();

    // 触发 reload
    actionRef.current?.reload();

    // 验证重新加载
    await waitFor(
      () => {
        expect(mockRequest).toHaveBeenCalledTimes(1);
        expect(mockRequest).toHaveBeenCalledWith({ agentId: 'test-agent' });
      },
      { timeout: 1000 },
    );
  });

  it('should work without actionRef', async () => {
    render(
      <History
        agentId="test-agent"
        sessionId="test-session"
        request={mockRequest}
        standalone
      />,
    );

    // 验证组件正常工作
    await waitFor(
      () => {
        expect(mockRequest).toHaveBeenCalledWith({ agentId: 'test-agent' });
      },
      { timeout: 1000 },
    );
  });
});
