import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { HistoryLoadMore } from '../../../src/History/components/LoadMoreComponent';
import { I18nContext } from '../../../src/I18n';

const mockI18nLocale = {
  'task.history.loadMore': '查看更多历史',
  'chat.history.loadMore': '查看更多',
};

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ConfigProvider>
    <I18nContext.Provider
      value={{ locale: mockI18nLocale, language: 'zh-CN' } as any}
    >
      {children}
    </I18nContext.Provider>
  </ConfigProvider>
);

describe('HistoryLoadMore', () => {
  it('应该渲染加载更多按钮', () => {
    const onLoadMore = vi.fn();
    render(
      <TestWrapper>
        <HistoryLoadMore onLoadMore={onLoadMore} />
      </TestWrapper>,
    );

    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('应该显示默认的 chat 类型文本', () => {
    const onLoadMore = vi.fn();
    render(
      <TestWrapper>
        <HistoryLoadMore onLoadMore={onLoadMore} />
      </TestWrapper>,
    );

    expect(screen.getByText('查看更多')).toBeInTheDocument();
  });

  it('应该显示 task 类型文本', () => {
    const onLoadMore = vi.fn();
    render(
      <TestWrapper>
        <HistoryLoadMore onLoadMore={onLoadMore} type="task" />
      </TestWrapper>,
    );

    expect(screen.getByText('查看更多历史')).toBeInTheDocument();
  });

  it('应该在点击时调用 onLoadMore', async () => {
    const onLoadMore = vi.fn().mockResolvedValue(undefined);
    render(
      <TestWrapper>
        <HistoryLoadMore onLoadMore={onLoadMore} />
      </TestWrapper>,
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(
      () => {
        expect(onLoadMore).toHaveBeenCalledTimes(1);
      },
      { timeout: 1000 },
    );
  });

  it('应该在按下 Enter 键时调用 onLoadMore', async () => {
    const onLoadMore = vi.fn().mockResolvedValue(undefined);
    render(
      <TestWrapper>
        <HistoryLoadMore onLoadMore={onLoadMore} />
      </TestWrapper>,
    );

    const button = screen.getByRole('button');
    fireEvent.keyDown(button, { key: 'Enter' });

    await waitFor(
      () => {
        expect(onLoadMore).toHaveBeenCalledTimes(1);
      },
      { timeout: 1000 },
    );
  });

  it('应该在按下空格键时调用 onLoadMore', async () => {
    const onLoadMore = vi.fn().mockResolvedValue(undefined);
    render(
      <TestWrapper>
        <HistoryLoadMore onLoadMore={onLoadMore} />
      </TestWrapper>,
    );

    const button = screen.getByRole('button');
    fireEvent.keyDown(button, { key: ' ' });

    await waitFor(
      () => {
        expect(onLoadMore).toHaveBeenCalledTimes(1);
      },
      { timeout: 1000 },
    );
  });

  it('应该在加载时显示 loading 图标', async () => {
    const onLoadMore = vi.fn(
      () =>
        new Promise((resolve) => {
          setTimeout(resolve, 100);
        }),
    );
    render(
      <TestWrapper>
        <HistoryLoadMore onLoadMore={onLoadMore} />
      </TestWrapper>,
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    // 应该显示 LoadingOutlined
    await waitFor(
      () => {
        expect(button.querySelector('.anticon-loading')).toBeInTheDocument();
      },
      { timeout: 1000 },
    );
  });

  it('应该防止在加载时重复点击', async () => {
    const onLoadMore = vi.fn(async () => {
      // 模拟较长的异步操作
      await new Promise((resolve) => {
        setTimeout(resolve, 200);
      });
    });

    const { container } = render(
      <TestWrapper>
        <HistoryLoadMore onLoadMore={onLoadMore} />
      </TestWrapper>,
    );

    const button = screen.getByRole('button', { name: /查看更多/i });

    // 第一次点击
    fireEvent.click(button);

    // 等待 loading 图标出现，确保组件进入加载状态
    await waitFor(
      () => {
        const loadingIcon = container.querySelector('.anticon-loading');
        expect(loadingIcon).toBeInTheDocument();
      },
      { timeout: 1000 },
    );

    // 记录当前的调用次数
    const callCountAfterLoading = onLoadMore.mock.calls.length;

    // 在加载图标可见期间尝试再次点击
    const loadingIcon = container.querySelector('.anticon-loading');
    expect(loadingIcon).toBeInTheDocument();

    fireEvent.click(button);

    // 等待真实的 setTimeout 完成
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    // 验证在loading图标出现后的点击被忽略了（callCount没有增加）
    expect(onLoadMore).toHaveBeenCalledTimes(callCountAfterLoading);

    // 等待 loading 完成
    await waitFor(
      () => {
        const icon = container.querySelector('.anticon-loading');
        expect(icon).not.toBeInTheDocument();
      },
      { timeout: 1000 },
    );
  });
  it('应该处理加载错误', async () => {
    const onLoadMore = vi.fn().mockRejectedValue(new Error('Load failed'));
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    render(
      <TestWrapper>
        <HistoryLoadMore onLoadMore={onLoadMore} />
      </TestWrapper>,
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(
      () => {
        expect(onLoadMore).toHaveBeenCalled();
      },
      { timeout: 1000 },
    );

    await waitFor(
      () => {
        expect(consoleError).toHaveBeenCalled();
      },
      { timeout: 1000 },
    );

    consoleError.mockRestore();
  });

  it('应该应用自定义类名', () => {
    const onLoadMore = vi.fn();
    const { container } = render(
      <TestWrapper>
        <HistoryLoadMore onLoadMore={onLoadMore} className="custom-class" />
      </TestWrapper>,
    );

    const button = container.querySelector('.custom-class');
    expect(button).toBeInTheDocument();
  });

  it('应该具有正确的可访问性属性', () => {
    const onLoadMore = vi.fn();
    render(
      <TestWrapper>
        <HistoryLoadMore onLoadMore={onLoadMore} />
      </TestWrapper>,
    );

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('tabIndex', '0');
  });

  it('应该在加载完成后恢复初始状态', async () => {
    const onLoadMore = vi.fn().mockResolvedValue(undefined);
    render(
      <TestWrapper>
        <HistoryLoadMore onLoadMore={onLoadMore} />
      </TestWrapper>,
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(
      () => {
        expect(onLoadMore).toHaveBeenCalled();
      },
      { timeout: 1000 },
    );

    // 加载完成后应该能够再次点击
    fireEvent.click(button);

    await waitFor(
      () => {
        expect(onLoadMore).toHaveBeenCalledTimes(2);
      },
      { timeout: 1000 },
    );
  });

  it('应该为 chat 类型显示正确的图标', () => {
    const onLoadMore = vi.fn();
    const { container } = render(
      <TestWrapper>
        <HistoryLoadMore onLoadMore={onLoadMore} type="chat" />
      </TestWrapper>,
    );

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('width', '16');
    expect(svg).toHaveAttribute('height', '16');
  });

  it('应该为 task 类型显示省略号图标', () => {
    const onLoadMore = vi.fn();
    const { container } = render(
      <TestWrapper>
        <HistoryLoadMore onLoadMore={onLoadMore} type="task" />
      </TestWrapper>,
    );

    expect(container.querySelector('.anticon-ellipsis')).toBeInTheDocument();
  });
});
