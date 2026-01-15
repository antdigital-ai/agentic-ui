import { act, fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { HistoryNewChat } from '../../../src/History/components/NewChatComponent';
import { I18nContext } from '../../../src/I18n';

const mockI18nLocale = {
  'chat.history.newChat': '新对话',
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

describe('HistoryNewChat', () => {
  it('应该渲染新对话按钮', () => {
    const onNewChat = vi.fn();
    render(
      <TestWrapper>
        <HistoryNewChat onNewChat={onNewChat} />
      </TestWrapper>,
    );

    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText('新对话')).toBeInTheDocument();
  });

  it('应该在点击时调用 onNewChat', async () => {
    const onNewChat = vi.fn().mockResolvedValue(undefined);
    render(
      <TestWrapper>
        <HistoryNewChat onNewChat={onNewChat} />
      </TestWrapper>,
    );

    const button = screen.getByRole('button');

    await act(async () => {
      fireEvent.click(button);
    });

    // 等待所有异步操作完成，包括 setState
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(onNewChat).toHaveBeenCalledTimes(1);
  });

  it('应该在按下 Enter 键时调用 onNewChat', async () => {
    const onNewChat = vi.fn().mockResolvedValue(undefined);
    render(
      <TestWrapper>
        <HistoryNewChat onNewChat={onNewChat} />
      </TestWrapper>,
    );

    const button = screen.getByRole('button');

    await act(async () => {
      fireEvent.keyDown(button, { key: 'Enter' });
    });

    // 等待所有异步操作完成，包括 setState
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(onNewChat).toHaveBeenCalledTimes(1);
  });

  it('应该在按下空格键时调用 onNewChat', async () => {
    const onNewChat = vi.fn().mockResolvedValue(undefined);
    render(
      <TestWrapper>
        <HistoryNewChat onNewChat={onNewChat} />
      </TestWrapper>,
    );

    const button = screen.getByRole('button');

    await act(async () => {
      fireEvent.keyDown(button, { key: ' ' });
    });

    // 等待所有异步操作完成，包括 setState
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(onNewChat).toHaveBeenCalledTimes(1);
  });

  it('应该显示图标', () => {
    const onNewChat = vi.fn();
    const { container } = render(
      <TestWrapper>
        <HistoryNewChat onNewChat={onNewChat} />
      </TestWrapper>,
    );

    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('应该具有正确的可访问性属性', () => {
    const onNewChat = vi.fn();
    render(
      <TestWrapper>
        <HistoryNewChat onNewChat={onNewChat} />
      </TestWrapper>,
    );

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('tabIndex', '0');
    expect(button).toHaveAttribute('aria-label', '新对话');
    expect(button).toHaveAttribute('aria-busy', 'false');
    expect(button).toHaveAttribute('aria-disabled', 'false');
  });

  it('应该在加载时设置 aria-busy 和 aria-disabled', async () => {
    let resolvePromise: () => void;
    const onNewChat = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolvePromise = resolve;
        }),
    );
    render(
      <TestWrapper>
        <HistoryNewChat onNewChat={onNewChat} />
      </TestWrapper>,
    );

    const button = screen.getByRole('button');

    await act(async () => {
      fireEvent.click(button);
      // 等待 Promise 微任务完成
      await Promise.resolve();
    });

    // 此时 loading 状态应该已经设置为 true
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toHaveAttribute('aria-disabled', 'true');

    // 确保在测试结束前完成 Promise，避免在测试环境拆除后执行 setState
    await act(async () => {
      resolvePromise!();
      await Promise.resolve();
    });
  });

  it('应该防止在加载时重复点击', async () => {
    let resolvePromise: () => void;
    const onNewChat = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolvePromise = resolve;
        }),
    );
    render(
      <TestWrapper>
        <HistoryNewChat onNewChat={onNewChat} />
      </TestWrapper>,
    );

    const button = screen.getByRole('button');

    // 第一次点击
    await act(async () => {
      fireEvent.click(button);
      // 等待 Promise 微任务完成，让 loading 状态更新
      await Promise.resolve();
    });

    // 此时 loading 应该为 true，验证状态
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toHaveAttribute('aria-disabled', 'true');

    // 在 loading 状态下再次点击（应该被阻止）
    await act(async () => {
      fireEvent.click(button);
      fireEvent.click(button);
      await Promise.resolve();
    });

    // 应该只调用一次，因为后续点击被 loading 状态阻止
    expect(onNewChat).toHaveBeenCalledTimes(1);

    // 确保在测试结束前完成 Promise，避免在测试环境拆除后执行 setState
    await act(async () => {
      resolvePromise!();
      await Promise.resolve();
    });
  });

  it('应该应用自定义类名', async () => {
    const onNewChat = vi.fn();
    render(
      <TestWrapper>
        <HistoryNewChat onNewChat={onNewChat} className="custom-class" />
      </TestWrapper>,
    );

    await act(async () => {});

    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('应该在加载完成后恢复初始状态', async () => {
    const onNewChat = vi.fn().mockResolvedValue(undefined);
    render(
      <TestWrapper>
        <HistoryNewChat onNewChat={onNewChat} />
      </TestWrapper>,
    );

    const button = screen.getByRole('button');

    await act(async () => {
      fireEvent.click(button);
    });

    // 等待所有异步操作完成，包括 setState
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    // 第一次调用应该完成
    expect(onNewChat).toHaveBeenCalledTimes(1);
    // 状态应该恢复
    expect(button).toHaveAttribute('aria-busy', 'false');
    expect(button).toHaveAttribute('aria-disabled', 'false');

    // 加载完成后应该能够再次点击
    await act(async () => {
      fireEvent.click(button);
    });

    // 等待所有异步操作完成，包括 setState
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    // 应该被调用两次
    expect(onNewChat).toHaveBeenCalledTimes(2);
  });

  it('应该防止通过键盘在加载时重复触发', async () => {
    let resolvePromise: () => void;
    const onNewChat = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolvePromise = resolve;
        }),
    );
    render(
      <TestWrapper>
        <HistoryNewChat onNewChat={onNewChat} />
      </TestWrapper>,
    );

    const button = screen.getByRole('button');

    // 第一次按键
    await act(async () => {
      fireEvent.keyDown(button, { key: 'Enter' });
      // 等待 Promise 微任务完成，让 loading 状态更新
      await Promise.resolve();
    });

    // 此时 loading 应该为 true，验证状态
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toHaveAttribute('aria-disabled', 'true');

    // 在 loading 状态下再次按键（应该被阻止）
    await act(async () => {
      fireEvent.keyDown(button, { key: 'Enter' });
      fireEvent.keyDown(button, { key: ' ' });
      await Promise.resolve();
    });

    // 应该只调用一次，因为后续按键被 loading 状态阻止
    expect(onNewChat).toHaveBeenCalledTimes(1);

    // 确保在测试结束前完成 Promise，避免在测试环境拆除后执行 setState
    await act(async () => {
      resolvePromise!();
      await Promise.resolve();
    });
  });

  it('应该忽略其他按键', () => {
    const onNewChat = vi.fn();
    render(
      <TestWrapper>
        <HistoryNewChat onNewChat={onNewChat} />
      </TestWrapper>,
    );

    const button = screen.getByRole('button');
    fireEvent.keyDown(button, { key: 'a' });
    fireEvent.keyDown(button, { key: 'Escape' });
    fireEvent.keyDown(button, { key: 'Tab' });

    expect(onNewChat).not.toHaveBeenCalled();
  });

  it('应该使用回退文本当 locale 未定义时', () => {
    const onNewChat = vi.fn();

    render(
      <ConfigProvider>
        <I18nContext.Provider value={{ locale: {}, language: 'zh-CN' } as any}>
          <HistoryNewChat onNewChat={onNewChat} />
        </I18nContext.Provider>
      </ConfigProvider>,
    );

    expect(screen.getByText('新对话')).toBeInTheDocument();
  });
});
