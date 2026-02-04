import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { HistoryActionsBox } from '../../../src/History/components/HistoryActionsBox';
import { I18nContext } from '../../../src/I18n';

const mockI18nLocale = {
  'chat.history.favorite': '收藏',
  'chat.history.favorited': '已收藏',
  'chat.history.delete': '删除',
  'chat.history.delete.popconfirm': '确定删除该消息吗？',
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

describe('HistoryActionsBox', () => {
  const mockItem = {
    sessionId: 'session-1',
    isFavorite: false,
    title: 'Test Session',
    createTime: Date.now(),
  };

  it('应该渲染子元素', () => {
    render(
      <TestWrapper>
        <HistoryActionsBox>
          <span>测试时间</span>
        </HistoryActionsBox>
      </TestWrapper>,
    );

    expect(screen.getByText('测试时间')).toBeInTheDocument();
  });

  it('应该在鼠标悬停时显示操作按钮', () => {
    const onDeleteItem = vi.fn();
    const { container } = render(
      <TestWrapper>
        <HistoryActionsBox onDeleteItem={onDeleteItem} item={mockItem}>
          <span>测试时间</span>
        </HistoryActionsBox>
      </TestWrapper>,
    );

    const wrapper = container.firstChild as HTMLElement;

    // 初始状态不应该显示操作按钮（opacity: 0）
    const actionsContainer = wrapper.querySelector(
      'div[style*="position: absolute"]',
    ) as HTMLElement;
    expect(actionsContainer).toHaveStyle({ opacity: '0' });

    // 鼠标悬停后应该显示操作按钮
    fireEvent.mouseEnter(wrapper);
    expect(actionsContainer).toHaveStyle({ opacity: '1' });

    // 鼠标离开后应该隐藏操作按钮
    fireEvent.mouseLeave(wrapper);
    expect(actionsContainer).toHaveStyle({ opacity: '0' });
  });

  it('应该在 agent 模式下始终显示操作按钮', () => {
    const onFavorite = vi.fn();
    const { container } = render(
      <TestWrapper>
        <HistoryActionsBox
          agent={{ enabled: true, onFavorite }}
          item={mockItem}
          onFavorite={onFavorite}
        >
          <span>测试时间</span>
        </HistoryActionsBox>
      </TestWrapper>,
    );

    const actionsContainer = container.querySelector(
      'div[style*="position: absolute"]',
    ) as HTMLElement;

    // agent 模式下应该始终显示
    expect(actionsContainer).toHaveStyle({ opacity: '1' });
  });

  it('应该处理收藏功能', async () => {
    const onFavorite = vi.fn().mockResolvedValue(undefined);
    render(
      <TestWrapper>
        <HistoryActionsBox
          agent={{ enabled: true, onFavorite }}
          item={mockItem}
          onFavorite={onFavorite}
        >
          <span>测试时间</span>
        </HistoryActionsBox>
      </TestWrapper>,
    );

    const buttons = screen.getAllByTestId('action-icon-box');
    const favoriteButton = buttons.find(
      (btn) => btn.getAttribute('data-title') === '收藏',
    )!;
    expect(favoriteButton).toBeInTheDocument();
    fireEvent.click(favoriteButton);

    await waitFor(
      () => {
        expect(onFavorite).toHaveBeenCalledWith('session-1', true);
      },
      { timeout: 1000 },
    );

    // 点击后应该变成已收藏状态
    await waitFor(
      () => {
        const updatedButtons = screen.getAllByTestId('action-icon-box');
        const favoritedButton = updatedButtons.find(
          (btn) => btn.getAttribute('data-title') === '已收藏',
        );
        expect(favoritedButton).toBeInTheDocument();
      },
      { timeout: 1000 },
    );
  });

  it('应该处理取消收藏', async () => {
    const onFavorite = vi.fn().mockResolvedValue(undefined);
    const favoriteItem = { ...mockItem, isFavorite: true };

    render(
      <TestWrapper>
        <HistoryActionsBox
          agent={{ enabled: true, onFavorite }}
          item={favoriteItem}
          onFavorite={onFavorite}
        >
          <span>测试时间</span>
        </HistoryActionsBox>
      </TestWrapper>,
    );

    const buttons = screen.getAllByTestId('action-icon-box');
    const favoriteButton = buttons.find(
      (btn) => btn.getAttribute('data-title') === '已收藏',
    )!;
    expect(favoriteButton).toBeInTheDocument();
    fireEvent.click(favoriteButton);

    await waitFor(
      () => {
        expect(onFavorite).toHaveBeenCalledWith('session-1', false);
      },
      { timeout: 1000 },
    );
  });

  it('应该显示删除确认对话框', async () => {
    const onDeleteItem = vi.fn();
    render(
      <TestWrapper>
        <HistoryActionsBox onDeleteItem={onDeleteItem} item={mockItem}>
          <span>测试时间</span>
        </HistoryActionsBox>
      </TestWrapper>,
    );

    // 鼠标悬停显示删除按钮
    const wrapper = screen.getByText('测试时间').parentElement!;
    fireEvent.mouseEnter(wrapper);

    const buttons = screen.getAllByTestId('action-icon-box');
    const deleteButton = buttons.find(
      (btn) => btn.getAttribute('data-title') === '删除',
    )!;
    expect(deleteButton).toBeInTheDocument();
    fireEvent.click(deleteButton);

    // 应该显示确认对话框
    await waitFor(
      () => {
        expect(screen.getByText('确定删除该消息吗？')).toBeInTheDocument();
      },
      { timeout: 1000 },
    );
  });

  it('应该处理删除操作', async () => {
    const onDeleteItem = vi.fn().mockResolvedValue(undefined);
    render(
      <TestWrapper>
        <HistoryActionsBox onDeleteItem={onDeleteItem} item={mockItem}>
          <span>测试时间</span>
        </HistoryActionsBox>
      </TestWrapper>,
    );

    const wrapper = screen.getByText('测试时间').parentElement!;
    fireEvent.mouseEnter(wrapper);

    const buttons = screen.getAllByTestId('action-icon-box');
    const deleteButton = buttons.find(
      (btn) => btn.getAttribute('data-title') === '删除',
    )!;
    expect(deleteButton).toBeInTheDocument();
    fireEvent.click(deleteButton);

    // 点击确认按钮
    const confirmButton = await screen.findByRole('button', {
      name: /确定|ok/i,
    });
    fireEvent.click(confirmButton);

    await waitFor(
      () => {
        expect(onDeleteItem).toHaveBeenCalled();
      },
      { timeout: 1000 },
    );
  });

  it('应该处理取消删除', async () => {
    const onDeleteItem = vi.fn();
    render(
      <TestWrapper>
        <HistoryActionsBox onDeleteItem={onDeleteItem} item={mockItem}>
          <span>测试时间</span>
        </HistoryActionsBox>
      </TestWrapper>,
    );

    const wrapper = screen.getByText('测试时间').parentElement!;
    fireEvent.mouseEnter(wrapper);

    const buttons = screen.getAllByTestId('action-icon-box');
    const deleteButton = buttons.find(
      (btn) => btn.getAttribute('data-title') === '删除',
    )!;
    expect(deleteButton).toBeInTheDocument();
    fireEvent.click(deleteButton);

    // 点击取消按钮
    const cancelButton = await screen.findByRole('button', {
      name: /取消|cancel/i,
    });
    fireEvent.click(cancelButton);

    expect(onDeleteItem).not.toHaveBeenCalled();
  });

  it('应该在弹窗打开时保持操作按钮可见', async () => {
    const onDeleteItem = vi.fn();
    const { container } = render(
      <TestWrapper>
        <HistoryActionsBox onDeleteItem={onDeleteItem} item={mockItem}>
          <span>测试时间</span>
        </HistoryActionsBox>
      </TestWrapper>,
    );

    const wrapper = container.firstChild as HTMLElement;
    fireEvent.mouseEnter(wrapper);

    const buttons = screen.getAllByTestId('action-icon-box');
    const deleteButton = buttons.find(
      (btn) => btn.getAttribute('data-title') === '删除',
    )!;
    expect(deleteButton).toBeInTheDocument();
    fireEvent.click(deleteButton);

    // 鼠标离开，但因为弹窗打开，操作按钮应该保持可见
    fireEvent.mouseLeave(wrapper);

    const actionsContainer = wrapper.querySelector(
      'div[style*="position: absolute"]',
    ) as HTMLElement;

    // 由于 Popconfirm 打开，操作按钮应该保持可见
    expect(actionsContainer).toHaveStyle({ opacity: '1' });
  });

  it('应该处理收藏操作错误', async () => {
    const onFavorite = vi.fn().mockRejectedValue(new Error('Network error'));
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    render(
      <TestWrapper>
        <HistoryActionsBox
          agent={{ enabled: true, onFavorite }}
          item={mockItem}
          onFavorite={onFavorite}
        >
          <span>测试时间</span>
        </HistoryActionsBox>
      </TestWrapper>,
    );

    const buttons = screen.getAllByTestId('action-icon-box');
    const favoriteButton = buttons.find(
      (btn) => btn.getAttribute('data-title') === '收藏',
    )!;
    expect(favoriteButton).toBeInTheDocument();
    fireEvent.click(favoriteButton);

    await waitFor(
      () => {
        expect(onFavorite).toHaveBeenCalled();
      },
      { timeout: 1000 },
    );

    // 即使出错，loading 状态也应该被重置
    await waitFor(
      () => {
        expect(favoriteButton).not.toHaveAttribute('disabled');
      },
      { timeout: 1000 },
    );

    consoleError.mockRestore();
  });

  it('应该处理删除操作错误', async () => {
    const onDeleteItem = vi.fn().mockRejectedValue(new Error('Delete failed'));
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    render(
      <TestWrapper>
        <HistoryActionsBox onDeleteItem={onDeleteItem} item={mockItem}>
          <span>测试时间</span>
        </HistoryActionsBox>
      </TestWrapper>,
    );

    const wrapper = screen.getByText('测试时间').parentElement!;
    fireEvent.mouseEnter(wrapper);

    const buttons = screen.getAllByTestId('action-icon-box');
    const deleteButton = buttons.find(
      (btn) => btn.getAttribute('data-title') === '删除',
    )!;
    expect(deleteButton).toBeInTheDocument();
    fireEvent.click(deleteButton);

    const confirmButton = await screen.findByRole('button', {
      name: /确定|ok/i,
    });
    fireEvent.click(confirmButton);

    await waitFor(
      () => {
        expect(onDeleteItem).toHaveBeenCalled();
      },
      { timeout: 1000 },
    );

    consoleError.mockRestore();
  });

  it('应该在 agent 模式下隐藏子元素', () => {
    const { container } = render(
      <TestWrapper>
        <HistoryActionsBox agent={{ enabled: true }}>
          <span>测试时间</span>
        </HistoryActionsBox>
      </TestWrapper>,
    );

    // agent 模式下，子元素应该被替换为占位符
    // 应该找不到原来的文本
    expect(screen.queryByText('测试时间')).not.toBeInTheDocument();

    // 应该有一个空的占位符 span
    const placeholder = container.querySelector('span[style*="width: 20px"]');
    expect(placeholder).toBeInTheDocument();
    expect(placeholder).toHaveStyle({ width: '20px', height: '20px' });
  });

  it('应该正确应用样式过渡效果', () => {
    const { container } = render(
      <TestWrapper>
        <HistoryActionsBox>
          <span>测试时间</span>
        </HistoryActionsBox>
      </TestWrapper>,
    );

    const actionsContainer = container.querySelector(
      'div[style*="position: absolute"]',
    ) as HTMLElement;

    expect(actionsContainer).toHaveStyle({
      transition: 'opacity 0.2s ease',
    });
  });
});
