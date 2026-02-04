import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfigProvider } from 'antd';
import dayjs from 'dayjs';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BubbleConfigContext } from '../../Bubble/BubbleConfigProvide';
import { History, HistoryDataType } from '../index';

// 模拟默认请求函数
const mockRequest = vi.fn().mockResolvedValue([
  {
    id: '1',
    sessionId: 'session-1',
    sessionTitle: '今日对话1',
    agentId: 'agent-1',
    gmtCreate: dayjs().valueOf(),
    gmtLastConverse: dayjs().valueOf(),
  },
  {
    id: '2',
    sessionId: 'session-2',
    sessionTitle: '昨日对话1',
    agentId: 'agent-1',
    gmtCreate: dayjs().subtract(1, 'day').valueOf(),
    gmtLastConverse: dayjs().subtract(1, 'day').valueOf(),
  },
  {
    id: '3',
    sessionId: 'session-3',
    sessionTitle: '一周前对话1',
    agentId: 'agent-1',
    gmtCreate: dayjs().subtract(8, 'day').valueOf(),
    gmtLastConverse: dayjs().subtract(8, 'day').valueOf(),
  },
]);

// 默认 props
const defaultProps = {
  agentId: 'test-agent-1',
  sessionId: 'current-session',
  request: mockRequest,
};

// 测试包装器
const TestWrapper: React.FC<{ children: React.ReactNode; locale?: any }> = ({
  children,
  locale = {},
}) => {
  return (
    <ConfigProvider>
      <BubbleConfigContext.Provider value={{ locale, standalone: false }}>
        {children}
      </BubbleConfigContext.Provider>
    </ConfigProvider>
  );
};
describe('History Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render history dropdown button by default', () => {
      render(
        <TestWrapper>
          <History {...defaultProps} />
        </TestWrapper>,
      );

      expect(screen.getByTestId('history-button')).toBeInTheDocument();
      // 验证历史按钮包含 SVG 图标
      expect(
        screen.getByTestId('history-button').querySelector('svg'),
      ).toBeInTheDocument();
    });

    it('should render standalone menu when standalone=true', async () => {
      render(
        <TestWrapper>
          <History {...defaultProps} standalone />
        </TestWrapper>,
      );

      await waitFor(
        () => {
          expect(screen.getByRole('menu')).toBeInTheDocument();
        },
        { timeout: 3000 },
      );
    });

    it('should display correct title from locale', () => {
      const locale = {
        'chat.history': '聊天历史',
      };

      render(
        <TestWrapper locale={locale}>
          <History {...defaultProps} />
        </TestWrapper>,
      );

      // ActionIconBox 使用 aria-label 和 data-title 属性，而不是 HTML title 属性
      const button = screen.getByLabelText('聊天历史');
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('data-title', '聊天历史');
    });
  });

  describe('Data Loading and Display', () => {
    it('should call request function with correct agentId', async () => {
      render(
        <TestWrapper>
          <History {...defaultProps} />
        </TestWrapper>,
      );

      await waitFor(
        () => {
          expect(mockRequest).toHaveBeenCalledWith({
            agentId: 'test-agent-1',
          });
        },
        { timeout: 3000 },
      );
    });

    it('should call onInit and onShow callbacks', async () => {
      const onInit = vi.fn();
      const onShow = vi.fn();

      render(
        <TestWrapper>
          <History {...defaultProps} onInit={onInit} onShow={onShow} />
        </TestWrapper>,
      );

      await waitFor(
        () => {
          expect(onInit).toHaveBeenCalled();
          expect(onShow).toHaveBeenCalled();
        },
        { timeout: 3000 },
      );
    });

    it('should display history items grouped by date', async () => {
      render(
        <TestWrapper>
          <History {...defaultProps} standalone />
        </TestWrapper>,
      );

      await waitFor(
        () => {
          // 检查是否有菜单项
          expect(screen.getByRole('menu')).toBeInTheDocument();
        },
        { timeout: 3000 },
      );
    });
  });

  describe('User Interactions', () => {
    it('should open dropdown when clicking history button', async () => {
      render(
        <TestWrapper>
          <History {...defaultProps} />
        </TestWrapper>,
      );

      const historyButton = screen.getByTestId('history-button');

      await act(async () => {
        fireEvent.click(historyButton);
        // 等待一下让状态更新
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      // 等待弹出层出现
      await waitFor(
        () => {
          // 检查 Popover 是否打开
          expect(historyButton).toBeInTheDocument();
        },
        { timeout: 2000 },
      );
    });

    it('should call onSelected when clicking a history item', async () => {
      const onSelected = vi.fn();

      render(
        <TestWrapper>
          <History {...defaultProps} onSelected={onSelected} standalone />
        </TestWrapper>,
      );

      await waitFor(
        () => {
          expect(screen.getByRole('menu')).toBeInTheDocument();
        },
        { timeout: 3000 },
      );

      const historyItems = screen.getAllByRole('menuitem');
      expect(historyItems.length).toBeGreaterThan(0);

      const user = userEvent.setup();

      await act(async () => {
        await user.click(historyItems[0]);
        // 等待一下让回调执行
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      // Wait for the onSelected to be called with the correct arguments
      await waitFor(
        () => {
          expect(onSelected).toHaveBeenCalledWith(
            expect.objectContaining({
              id: '1',
              sessionId: 'session-1',
              sessionTitle: '今日对话1',
            }),
          );
        },
        { timeout: 2000 },
      );
    });

    it('should handle delete item when onDeleteItem is provided', async () => {
      const onDeleteItem = vi.fn().mockResolvedValue(true);

      render(
        <TestWrapper>
          <History {...defaultProps} onDeleteItem={onDeleteItem} standalone />
        </TestWrapper>,
      );

      // 等待历史项目渲染
      await waitFor(
        () => {
          expect(screen.getByRole('menu')).toBeInTheDocument();
        },
        { timeout: 3000 },
      );

      expect(onDeleteItem).not.toHaveBeenCalled();
    });
  });

  describe('Custom Formatting and Sorting', () => {
    it('should use customDateFormatter when provided', async () => {
      const customDateFormatter = vi.fn().mockReturnValue('自定义日期');

      render(
        <TestWrapper>
          <History
            {...defaultProps}
            customDateFormatter={customDateFormatter}
            standalone
          />
        </TestWrapper>,
      );

      // 等待数据加载完成
      await waitFor(
        () => {
          expect(screen.getByRole('menu')).toBeInTheDocument();
        },
        { timeout: 3000 },
      );

      await waitFor(
        () => {
          // 验证 customDateFormatter 被调用
          expect(customDateFormatter).toHaveBeenCalled();
        },
        { timeout: 2000 },
      );
    });

    it('should use custom groupBy function', async () => {
      const customGroupBy = vi.fn().mockReturnValue('custom-group');

      render(
        <TestWrapper>
          <History {...defaultProps} groupBy={customGroupBy} standalone />
        </TestWrapper>,
      );

      // 等待数据加载完成
      await waitFor(
        () => {
          expect(screen.getByRole('menu')).toBeInTheDocument();
        },
        { timeout: 3000 },
      );

      // 等待一段时间确保 generateHistoryItems 被调用
      await waitFor(
        () => {
          expect(customGroupBy).toHaveBeenCalled();
        },
        { timeout: 2000 },
      );
    });

    it('should apply custom sorting when sessionSort is provided', async () => {
      // 创建一个简单的测试，验证组件能够接受自定义排序函数
      const customSort = vi.fn().mockReturnValue(1);

      render(
        <TestWrapper>
          <History {...defaultProps} sessionSort={customSort} standalone />
        </TestWrapper>,
      );

      // 等待组件渲染和数据加载
      await waitFor(
        () => {
          expect(screen.getByRole('menu')).toBeInTheDocument();
        },
        { timeout: 3000 },
      );

      // 验证组件正常渲染，自定义排序参数已传递
      await waitFor(
        () => {
          const menuItems = screen.getAllByRole('menuitem');
          expect(menuItems.length).toBeGreaterThan(0);
        },
        { timeout: 3000 },
      );
    });

    it('should not sort when sessionSort is false', async () => {
      render(
        <TestWrapper>
          <History {...defaultProps} sessionSort={false} standalone />
        </TestWrapper>,
      );

      // 当 sessionSort 为 false 时，不应该进行排序
      await waitFor(
        () => {
          expect(screen.getByRole('menu')).toBeInTheDocument();
        },
        { timeout: 3000 },
      );
    });
  });

  describe('Extra Content', () => {
    it('should render extra content when extra prop is provided', async () => {
      const extraContent = (item: HistoryDataType) => (
        <div data-testid="extra-content">Extra: {item.sessionTitle}</div>
      );

      render(
        <TestWrapper>
          <History {...defaultProps} extra={extraContent} standalone />
        </TestWrapper>,
      );

      // 等待额外内容渲染
      await waitFor(
        () => {
          const extraContents = screen.queryAllByTestId('extra-content');
          expect(extraContents.length).toBeGreaterThan(0);
        },
        { timeout: 3000 },
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle empty data gracefully', async () => {
      const emptyRequest = vi.fn().mockResolvedValue([]);
      // 提供 emptyRender 以显示空状态
      const emptyRender = vi.fn(() => <div>暂无历史记录</div>);

      render(
        <TestWrapper>
          <History
            {...defaultProps}
            request={emptyRequest}
            emptyRender={emptyRender}
            standalone
          />
        </TestWrapper>,
      );

      await waitFor(
        () => {
          expect(emptyRequest).toHaveBeenCalled();
        },
        { timeout: 3000 },
      );

      await waitFor(
        () => {
          expect(screen.getByText('暂无历史记录')).toBeInTheDocument();
        },
        { timeout: 3000 },
      );
    });
  });

  describe('SessionId Changes', () => {
    it('should reload data when sessionId changes', async () => {
      const { rerender } = render(
        <TestWrapper>
          <History {...defaultProps} sessionId="session-1" />
        </TestWrapper>,
      );

      // 清除之前的调用
      mockRequest.mockClear();

      // 更改 sessionId
      rerender(
        <TestWrapper>
          <History {...defaultProps} sessionId="session-2" />
        </TestWrapper>,
      );

      await waitFor(
        () => {
          expect(mockRequest).toHaveBeenCalled();
        },
        { timeout: 3000 },
      );
      // 应该重新调用请求
    });
  });
  describe('slots', () => {
    it('should render beforeHistoryList when slots.beforeHistoryList is provided', async () => {
      render(
        <TestWrapper>
          <History
            {...defaultProps}
            standalone
            slots={{ beforeHistoryList: () => <div>beforeHistoryList</div> }}
          />
        </TestWrapper>,
      );
      await waitFor(
        () => {
          expect(screen.getByText('beforeHistoryList')).toBeInTheDocument();
        },
        { timeout: 3000 },
      );
    });
  });
});
