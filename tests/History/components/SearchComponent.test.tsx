import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HistorySearch } from '../../../src/History/components/SearchComponent';
import { I18nContext } from '../../../src/I18n';

const mockI18nLocale = {
  'chat.history.search': '搜索',
  'chat.history.search.placeholder': '搜索话题',
  'chat.task.search.placeholder': '搜索任务',
  'chat.history.historyChats': '历史对话',
  'chat.history.historyTasks': '历史任务',
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

describe('HistorySearch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该渲染搜索组件', () => {
    const onSearch = vi.fn();
    render(
      <TestWrapper>
        <HistorySearch onSearch={onSearch} />
      </TestWrapper>,
    );

    expect(screen.getByText('历史对话')).toBeInTheDocument();
  });

  it('应该显示 task 类型的默认文本', () => {
    const onSearch = vi.fn();
    render(
      <TestWrapper>
        <HistorySearch onSearch={onSearch} type="task" />
      </TestWrapper>,
    );

    expect(screen.getByText('历史任务')).toBeInTheDocument();
  });

  it('应该显示搜索图标按钮', () => {
    const onSearch = vi.fn();
    render(
      <TestWrapper>
        <HistorySearch onSearch={onSearch} />
      </TestWrapper>,
    );

    const searchButton = screen.getByTestId('action-icon-box');
    expect(searchButton).toBeInTheDocument();
    expect(searchButton).toHaveAttribute('data-title', '搜索');
  });

  it('应该在点击搜索按钮后展开输入框', () => {
    const onSearch = vi.fn();
    render(
      <TestWrapper>
        <HistorySearch onSearch={onSearch} />
      </TestWrapper>,
    );

    const searchButton = screen.getByTestId('action-icon-box');
    fireEvent.click(searchButton);

    expect(screen.getByPlaceholderText('搜索话题')).toBeInTheDocument();
  });

  it('应该显示 task 类型的 placeholder', () => {
    const onSearch = vi.fn();
    render(
      <TestWrapper>
        <HistorySearch onSearch={onSearch} type="task" />
      </TestWrapper>,
    );

    const searchButton = screen.getByTestId('action-icon-box');
    fireEvent.click(searchButton);

    expect(screen.getByPlaceholderText('搜索任务')).toBeInTheDocument();
  });

  it('应该使用自定义 placeholder', () => {
    const onSearch = vi.fn();
    render(
      <TestWrapper>
        <HistorySearch
          onSearch={onSearch}
          searchOptions={{ placeholder: '自定义搜索' }}
        />
      </TestWrapper>,
    );

    const searchButton = screen.getByTestId('action-icon-box');
    fireEvent.click(searchButton);

    expect(screen.getByPlaceholderText('自定义搜索')).toBeInTheDocument();
  });

  it('应该使用自定义默认文本', () => {
    const onSearch = vi.fn();
    render(
      <TestWrapper>
        <HistorySearch
          onSearch={onSearch}
          searchOptions={{ text: '自定义文本' }}
        />
      </TestWrapper>,
    );

    expect(screen.getByText('自定义文本')).toBeInTheDocument();
  });

  it('应该支持清空输入', async () => {
    const onSearch = vi.fn().mockResolvedValue(undefined);

    render(
      <TestWrapper>
        <HistorySearch onSearch={onSearch} />
      </TestWrapper>,
    );

    const searchButton = screen.getByTestId('action-icon-box');
    fireEvent.click(searchButton);

    const input = screen.getByPlaceholderText('搜索话题') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'test' } });

    // 等待真实的 debounce 延迟完成
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 360));
    });

    await waitFor(
      () => {
        expect(onSearch).toHaveBeenCalledWith('test');
      },
      { timeout: 1000 },
    );

    // 清空输入
    fireEvent.change(input, { target: { value: '' } });
    // 等待真实的 debounce 延迟完成
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 360));
    });

    await waitFor(
      () => {
        expect(onSearch).toHaveBeenCalledWith('');
      },
      { timeout: 1000 },
    );
  });

  it('应该在点击后显示输入框', () => {
    const onSearch = vi.fn();
    render(
      <TestWrapper>
        <HistorySearch onSearch={onSearch} />
      </TestWrapper>,
    );

    const searchButton = screen.getByTestId('action-icon-box');
    fireEvent.click(searchButton);

    const input = screen.getByPlaceholderText('搜索话题');
    expect(input).toBeInTheDocument();
    expect(input).toBeVisible();
  });

  it('应该在输入搜索词后触发搜索', async () => {
    const onSearch = vi.fn().mockResolvedValue(undefined);
    render(
      <TestWrapper>
        <HistorySearch onSearch={onSearch} />
      </TestWrapper>,
    );

    const searchButton = screen.getByTestId('action-icon-box');
    fireEvent.click(searchButton);

    const input = screen.getByPlaceholderText('搜索话题');
    expect(input).toBeInTheDocument();

    // 输入搜索词
    fireEvent.change(input, { target: { value: '测试搜索' } });

    // 等待真实的 debounce 延迟完成
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 360));
    });

    await waitFor(
      () => {
        expect(onSearch).toHaveBeenCalledWith('测试搜索');
      },
      { timeout: 1000 },
    );
  });

  it('应该在加载时显示 Spin', async () => {
    const onSearch = vi.fn(
      () =>
        new Promise((resolve) => {
          setTimeout(resolve, 100);
        }),
    );

    render(
      <TestWrapper>
        <HistorySearch onSearch={onSearch} />
      </TestWrapper>,
    );

    const searchButton = screen.getByTestId('action-icon-box');
    fireEvent.click(searchButton);

    const input = screen.getByPlaceholderText('搜索话题');
    fireEvent.change(input, { target: { value: 'test' } });

    // 等待真实的 debounce 延迟完成
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 360));
    });

    await waitFor(
      () => {
        const spinElement = document.querySelector('.ant-spin');
        expect(spinElement).toBeInTheDocument();
      },
      { timeout: 1000 },
    );
  });

  it('应该处理搜索错误', async () => {
    const onSearch = vi.fn().mockRejectedValue(new Error('Search failed'));

    render(
      <TestWrapper>
        <HistorySearch onSearch={onSearch} />
      </TestWrapper>,
    );

    const searchButton = screen.getByTestId('action-icon-box');
    fireEvent.click(searchButton);

    const input = screen.getByPlaceholderText('搜索话题');
    fireEvent.change(input, { target: { value: 'test' } });

    // 等待真实的 debounce 延迟完成
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 360));
    });

    await waitFor(
      () => {
        expect(onSearch).toHaveBeenCalled();
      },
      { timeout: 1000 },
    );
  });

  it('应该应用正确的样式', () => {
    const onSearch = vi.fn();
    const { container } = render(
      <TestWrapper>
        <HistorySearch onSearch={onSearch} />
      </TestWrapper>,
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveStyle({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '32px',
    });
  });

  it('应该切换搜索图标和输入框', () => {
    const onSearch = vi.fn();
    render(
      <TestWrapper>
        <HistorySearch onSearch={onSearch} />
      </TestWrapper>,
    );

    // 初始状态应该显示文本和图标按钮
    expect(screen.getByText('历史对话')).toBeInTheDocument();
    const searchButton = screen.getByTestId('action-icon-box');
    expect(searchButton).toHaveAttribute('data-title', '搜索');

    // 点击后应该显示输入框
    fireEvent.click(searchButton);

    expect(screen.queryByText('历史对话')).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText('搜索话题')).toBeInTheDocument();
  });

  describe('trigger 配置测试', () => {
    it('应该在 trigger=change 时实时触发搜索(默认行为)', async () => {
      const onSearch = vi.fn().mockResolvedValue(undefined);
      render(
        <TestWrapper>
          <HistorySearch
            onSearch={onSearch}
            searchOptions={{ trigger: 'change' }}
          />
        </TestWrapper>,
      );

      const searchButton = screen.getByTestId('action-icon-box');
      fireEvent.click(searchButton);

      const input = screen.getByPlaceholderText('搜索话题');
      fireEvent.change(input, { target: { value: '测试搜索' } });

      // 等待真实的 debounce 延迟完成
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 360));
    });

      await waitFor(
        () => {
          expect(onSearch).toHaveBeenCalledWith('测试搜索');
        },
        { timeout: 1000 },
      );
    });

    it('应该在 trigger=enter 时只在按回车时触发搜索', async () => {
      const onSearch = vi.fn().mockResolvedValue(undefined);
      render(
        <TestWrapper>
          <HistorySearch
            onSearch={onSearch}
            searchOptions={{ trigger: 'enter' }}
          />
        </TestWrapper>,
      );

      const searchButton = screen.getByTestId('action-icon-box');
      fireEvent.click(searchButton);

      const input = screen.getByPlaceholderText('搜索话题');

      // 输入文字,不应该触发搜索
      fireEvent.change(input, { target: { value: '测试搜索' } });

      // 等待真实的 debounce 延迟完成
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 360));
    });

      // 验证没有调用搜索
      expect(onSearch).not.toHaveBeenCalled();

      // 按下回车键
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

      await waitFor(
        () => {
          expect(onSearch).toHaveBeenCalledWith('测试搜索');
          expect(onSearch).toHaveBeenCalledTimes(1);
        },
        { timeout: 1000 },
      );
    });

    it('应该在 trigger=enter 时支持多次回车搜索', async () => {
      const onSearch = vi.fn().mockResolvedValue(undefined);
      render(
        <TestWrapper>
          <HistorySearch
            onSearch={onSearch}
            searchOptions={{ trigger: 'enter' }}
          />
        </TestWrapper>,
      );

      const searchButton = screen.getByTestId('action-icon-box');
      fireEvent.click(searchButton);

      const input = screen.getByPlaceholderText('搜索话题');

      // 第一次搜索
      fireEvent.change(input, { target: { value: '第一次搜索' } });
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

      await waitFor(
        () => {
          expect(onSearch).toHaveBeenCalledWith('第一次搜索');
        },
        { timeout: 1000 },
      );

      // 第二次搜索
      fireEvent.change(input, { target: { value: '第二次搜索' } });
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

      await waitFor(
        () => {
          expect(onSearch).toHaveBeenCalledWith('第二次搜索');
          expect(onSearch).toHaveBeenCalledTimes(2);
        },
        { timeout: 1000 },
      );
    });

    it('应该在 trigger=enter 时按其他键不触发搜索', async () => {
      const onSearch = vi.fn().mockResolvedValue(undefined);
      render(
        <TestWrapper>
          <HistorySearch
            onSearch={onSearch}
            searchOptions={{ trigger: 'enter' }}
          />
        </TestWrapper>,
      );

      const searchButton = screen.getByTestId('action-icon-box');
      fireEvent.click(searchButton);

      const input = screen.getByPlaceholderText('搜索话题');

      fireEvent.change(input, { target: { value: '测试搜索' } });

      // 按下其他键
      fireEvent.keyDown(input, { key: 'a', code: 'KeyA' });
      fireEvent.keyDown(input, { key: 'Escape', code: 'Escape' });
      fireEvent.keyDown(input, { key: 'Tab', code: 'Tab' });

      // 等待真实的 debounce 延迟完成
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 360));
    });

      // 验证没有调用搜索
      expect(onSearch).not.toHaveBeenCalled();
    });

    it('默认应该使用 change 触发方式', async () => {
      const onSearch = vi.fn().mockResolvedValue(undefined);
      render(
        <TestWrapper>
          <HistorySearch onSearch={onSearch} searchOptions={{}} />
        </TestWrapper>,
      );

      const searchButton = screen.getByTestId('action-icon-box');
      fireEvent.click(searchButton);

      const input = screen.getByPlaceholderText('搜索话题');
      fireEvent.change(input, { target: { value: '测试' } });

      // 等待真实的 debounce 延迟完成
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 360));
    });

      await waitFor(
        () => {
          expect(onSearch).toHaveBeenCalledWith('测试');
        },
        { timeout: 1000 },
      );
    });
  });
});
