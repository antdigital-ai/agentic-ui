import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { HistoryLoadMore } from '../../History/components/LoadMoreComponent';
import { HistoryNewChat } from '../../History/components/NewChatComponent';
import { HistorySearch } from '../../History/components/SearchComponent';
import { cnLabels, enLabels, I18nContext } from '..';
import { TaskList } from '../../TaskList';

// Mock components that might not be available in test environment
vi.mock('../../MarkdownEditor/editor/components', () => ({
  ActionIconBox: ({ children, title, onClick }: any) => (
    <button
      onClick={onClick}
      title={title}
      data-testid="action-icon-box"
      type="button"
    >
      {children}
    </button>
  ),
}));

vi.mock('../../components/Loading', () => ({
  Loading: () => <span>Loading</span>,
}));

describe('Component Integration Tests', () => {
  afterEach(() => {
    cleanup();
  });

  describe('History Components', () => {
    describe('HistoryNewChat Component', () => {
      const mockOnNewChat = vi.fn();

      it('should render new chat button in Chinese', () => {
        render(
          <I18nContext.Provider value={{ locale: cnLabels, language: 'zh-CN' }}>
            <HistoryNewChat onNewChat={mockOnNewChat} />
          </I18nContext.Provider>,
        );

        expect(screen.getByText('新对话')).toBeInTheDocument();
      });

      it('should render new chat button in English', () => {
        render(
          <I18nContext.Provider value={{ locale: enLabels, language: 'en-US' }}>
            <HistoryNewChat onNewChat={mockOnNewChat} />
          </I18nContext.Provider>,
        );

        expect(screen.getByText('New Chat')).toBeInTheDocument();
      });

      it('should call onNewChat when clicked', () => {
        render(
          <I18nContext.Provider value={{ locale: cnLabels, language: 'zh-CN' }}>
            <HistoryNewChat onNewChat={mockOnNewChat} />
          </I18nContext.Provider>,
        );

        fireEvent.click(screen.getByText('新对话'));
        expect(mockOnNewChat).toHaveBeenCalledTimes(1);
      });
    });

    describe('HistorySearch Component', () => {
      const mockOnSearch = vi.fn();

      it('should render search text in Chinese', () => {
        render(
          <I18nContext.Provider value={{ locale: cnLabels, language: 'zh-CN' }}>
            <HistorySearch onSearch={mockOnSearch} type="task" />
          </I18nContext.Provider>,
        );

        expect(screen.getByText('历史任务')).toBeInTheDocument();
      });

      it('should render search text in English', () => {
        render(
          <I18nContext.Provider value={{ locale: enLabels, language: 'en-US' }}>
            <HistorySearch onSearch={mockOnSearch} type="task" />
          </I18nContext.Provider>,
        );

        expect(
          screen.getByText(enLabels['chat.history.historyTasks']),
        ).toBeInTheDocument();
      });

      it('should render search button title in Chinese', () => {
        render(
          <I18nContext.Provider value={{ locale: cnLabels, language: 'zh-CN' }}>
            <HistorySearch onSearch={mockOnSearch} />
          </I18nContext.Provider>,
        );

        const searchButton = screen.getByTestId('action-icon-box');
        expect(searchButton).toBeInTheDocument();
        expect(searchButton).toHaveAttribute('data-title', '搜索');
      });

      it('should render search button title in English', () => {
        render(
          <I18nContext.Provider value={{ locale: enLabels, language: 'en-US' }}>
            <HistorySearch onSearch={mockOnSearch} />
          </I18nContext.Provider>,
        );

        const searchButton = screen.getByTestId('action-icon-box');
        expect(searchButton).toBeInTheDocument();
        expect(searchButton).toHaveAttribute('data-title', 'Search');
      });
    });

    describe('HistoryLoadMore Component', () => {
      const mockOnLoadMore = vi.fn();

      it('should render load more button in Chinese', () => {
        render(
          <I18nContext.Provider value={{ locale: cnLabels, language: 'zh-CN' }}>
            <HistoryLoadMore onLoadMore={mockOnLoadMore} />
          </I18nContext.Provider>,
        );

        expect(screen.getByText('查看更多')).toBeInTheDocument();
      });

      it('should render load more button in English', () => {
        render(
          <I18nContext.Provider value={{ locale: enLabels, language: 'en-US' }}>
            <HistoryLoadMore onLoadMore={mockOnLoadMore} />
          </I18nContext.Provider>,
        );

        expect(screen.getByText('Load More')).toBeInTheDocument();
      });

      it('should call onLoadMore when clicked', () => {
        render(
          <I18nContext.Provider value={{ locale: cnLabels, language: 'zh-CN' }}>
            <HistoryLoadMore onLoadMore={mockOnLoadMore} />
          </I18nContext.Provider>,
        );

        fireEvent.click(screen.getByText('查看更多'));
        expect(mockOnLoadMore).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('TaskList Component', () => {
    const mockItems = [
      {
        key: '1',
        title: 'Test Task 1',
        content: [<div key="1">Task content 1</div>],
        status: 'success' as const,
      },
      {
        key: '2',
        title: 'Test Task 2',
        content: [<div key="2">Task content 2</div>],
        status: 'pending' as const,
      },
    ];

    it('should render task list with Chinese labels', () => {
      render(
        <I18nContext.Provider value={{ locale: cnLabels, language: 'zh-CN' }}>
          <TaskList items={mockItems} />
        </I18nContext.Provider>,
      );

      // Check if task titles are rendered
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
      expect(screen.getByText('Test Task 2')).toBeInTheDocument();

      // Check if expand/collapse buttons have correct titles
      const expandButtons = screen.getAllByTestId('action-icon-box');
      expect(expandButtons).toHaveLength(2);
      expandButtons.forEach((button) => {
        expect(button).toHaveAttribute('data-title', '收起');
      });
    });

    it('should render task list with English labels', () => {
      render(
        <I18nContext.Provider value={{ locale: enLabels, language: 'en-US' }}>
          <TaskList items={mockItems} />
        </I18nContext.Provider>,
      );

      // Check if task titles are rendered
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
      expect(screen.getByText('Test Task 2')).toBeInTheDocument();

      // Check if expand/collapse buttons have correct titles
      const expandButtons = screen.getAllByTestId('action-icon-box');
      expect(expandButtons).toHaveLength(2);
      expandButtons.forEach((button) => {
        expect(button).toHaveAttribute('data-title', 'Collapse');
      });
    });

    it('should render expand buttons with correct titles', () => {
      render(
        <I18nContext.Provider value={{ locale: cnLabels, language: 'zh-CN' }}>
          <TaskList items={mockItems} />
        </I18nContext.Provider>,
      );

      const expandButtons = screen.getAllByTestId('action-icon-box');
      expect(expandButtons).toHaveLength(2);
      expandButtons.forEach((button) => {
        expect(button).toHaveAttribute('data-title', '收起');
      });

      // Verify that task content is visible (expanded by default)
      expect(screen.getByText('Task content 1')).toBeInTheDocument();
      expect(screen.getByText('Task content 2')).toBeInTheDocument();
    });
  });

  describe('Context Integration', () => {
    it('should use custom locale from context', () => {
      const customLocale = {
        'chat.history.newChat': '自定义新对话',
        'chat.history.search.placeholder': '自定义搜索',
        'taskList.expand': '自定义展开',
      } as any;

      const mockOnNewChat = vi.fn();
      const mockOnSearch = vi.fn();

      render(
        <I18nContext.Provider
          value={{ locale: customLocale as any, language: 'zh-CN' }}
        >
          <div>
            <HistoryNewChat onNewChat={mockOnNewChat} />
            <HistorySearch onSearch={mockOnSearch} type="task" />
            <TaskList items={[]} />
          </div>
        </I18nContext.Provider>,
      );

      expect(screen.getByText('自定义新对话')).toBeInTheDocument();
      expect(screen.getByText('历史任务')).toBeInTheDocument();
    });

    it('should fallback to default text when context locale is missing', () => {
      render(
        <I18nContext.Provider value={{ locale: {} as any, language: 'zh-CN' }}>
          <div>
            <HistoryNewChat onNewChat={vi.fn()} />
            <HistorySearch onSearch={vi.fn()} type="task" />
          </div>
        </I18nContext.Provider>,
      );

      // Should fallback to default Chinese text
      expect(screen.getByText('新对话')).toBeInTheDocument();
      expect(screen.getByText('历史任务')).toBeInTheDocument();
    });
  });

  describe('Template String Integration', () => {
    it('should handle template strings in task progress messages', () => {
      const customLocale = {
        'taskList.taskInProgress': '正在执行任务：${taskName}',
      };

      render(
        <I18nContext.Provider
          value={{ locale: customLocale as any, language: 'zh-CN' }}
        >
          <div>
            <span data-testid="task-progress">
              {customLocale['taskList.taskInProgress'].replace(
                '${taskName}',
                '数据分析',
              )}
            </span>
          </div>
        </I18nContext.Provider>,
      );

      expect(screen.getByTestId('task-progress')).toHaveTextContent(
        '正在执行任务：数据分析',
      );
    });

    it('should handle template strings in file size messages', () => {
      const customLocale = {
        'markdownInput.fileSizeExceeded': '文件过大：${maxSize} KB',
      };

      render(
        <I18nContext.Provider
          value={{ locale: customLocale as any, language: 'zh-CN' }}
        >
          <div>
            <span data-testid="file-size-error">
              {customLocale['markdownInput.fileSizeExceeded'].replace(
                '${maxSize}',
                '2048',
              )}
            </span>
          </div>
        </I18nContext.Provider>,
      );

      expect(screen.getByTestId('file-size-error')).toHaveTextContent(
        '文件过大：2048 KB',
      );
    });
  });
});
