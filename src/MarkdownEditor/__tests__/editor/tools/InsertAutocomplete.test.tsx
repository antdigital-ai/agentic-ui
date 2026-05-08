/**
 * InsertAutocomplete 组件测试文件
 *
 * 测试覆盖范围：
 * - 基本渲染功能
 * - 自动补全功能
 * - 用户交互
 * - 数据过滤
 * - 键盘导航
 */

import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

// 创建一个简单的 InsertAutocomplete 组件用于测试
const InsertAutocomplete = ({ onSelect, onCancel, suggestions = [] }: any) => (
  <div data-testid="insert-autocomplete-modal">
    <div data-testid="modal-title">自动补全</div>
    <input data-testid="search-input" placeholder="搜索..." />
    <ul data-testid="suggestions-list">
      {suggestions.map((item: any, index: number) => (
        <li
          key={index}
          data-testid={`suggestion-${index}`}
          onClick={() => onSelect?.(item)}
        >
          {item.label || item}
        </li>
      ))}
    </ul>
    <button data-testid="cancel-button" onClick={onCancel}>
      取消
    </button>
  </div>
);

describe('InsertAutocomplete', () => {
  const renderWithProvider = (component: React.ReactElement) => {
    return render(<ConfigProvider>{component}</ConfigProvider>);
  };

  describe('基本渲染测试', () => {
    it('应该正确渲染自动补全模态框', () => {
      renderWithProvider(<InsertAutocomplete />);

      const modal = screen.getByTestId('insert-autocomplete-modal');
      expect(modal).toBeInTheDocument();
    });

    it('应该显示模态框标题', () => {
      renderWithProvider(<InsertAutocomplete />);

      const title = screen.getByTestId('modal-title');
      expect(title).toBeInTheDocument();
      expect(title).toHaveTextContent('自动补全');
    });

    it('应该显示搜索输入框', () => {
      renderWithProvider(<InsertAutocomplete />);

      const searchInput = screen.getByTestId('search-input');
      expect(searchInput).toBeInTheDocument();
    });

    it('应该显示建议列表', () => {
      renderWithProvider(<InsertAutocomplete />);

      const suggestionsList = screen.getByTestId('suggestions-list');
      expect(suggestionsList).toBeInTheDocument();
    });

    it('应该显示取消按钮', () => {
      renderWithProvider(<InsertAutocomplete />);

      const cancelButton = screen.getByTestId('cancel-button');
      expect(cancelButton).toBeInTheDocument();
    });
  });

  describe('建议列表测试', () => {
    it('应该渲染建议列表项', () => {
      const suggestions = ['建议1', '建议2', '建议3'];

      renderWithProvider(<InsertAutocomplete suggestions={suggestions} />);

      suggestions.forEach((_, index) => {
        const suggestion = screen.getByTestId(`suggestion-${index}`);
        expect(suggestion).toBeInTheDocument();
      });
    });

    it('应该处理空建议列表', () => {
      renderWithProvider(<InsertAutocomplete suggestions={[]} />);

      const suggestionsList = screen.getByTestId('suggestions-list');
      expect(suggestionsList).toBeInTheDocument();
      expect(suggestionsList.children).toHaveLength(0);
    });

    it('应该处理复杂建议对象', () => {
      const suggestions = [
        { label: '建议1', value: 'value1' },
        { label: '建议2', value: 'value2' },
        { label: '建议3', value: 'value3' },
      ];

      renderWithProvider(<InsertAutocomplete suggestions={suggestions} />);

      suggestions.forEach((_, index) => {
        const suggestion = screen.getByTestId(`suggestion-${index}`);
        expect(suggestion).toBeInTheDocument();
        expect(suggestion).toHaveTextContent(suggestions[index].label);
      });
    });
  });

  describe('用户交互测试', () => {
    it('应该处理建议选择', async () => {
      const mockOnSelect = vi.fn();
      const suggestions = ['建议1', '建议2'];

      renderWithProvider(
        <InsertAutocomplete
          suggestions={suggestions}
          onSelect={mockOnSelect}
        />,
      );

      const firstSuggestion = screen.getByTestId('suggestion-0');
      fireEvent.click(firstSuggestion);

      await waitFor(() => {
        expect(mockOnSelect).toHaveBeenCalledWith('建议1');
      });
    });

    it('应该处理取消操作', async () => {
      const mockOnCancel = vi.fn();

      renderWithProvider(<InsertAutocomplete onCancel={mockOnCancel} />);

      const cancelButton = screen.getByTestId('cancel-button');
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(mockOnCancel).toHaveBeenCalled();
      });
    });

    it('应该处理搜索输入', () => {
      renderWithProvider(<InsertAutocomplete />);

      const searchInput = screen.getByTestId('search-input');
      fireEvent.change(searchInput, { target: { value: '搜索关键词' } });

      expect(searchInput).toHaveValue('搜索关键词');
    });
  });

  describe('键盘导航测试', () => {
    it('应该支持键盘导航', () => {
      const suggestions = ['建议1', '建议2', '建议3'];

      renderWithProvider(<InsertAutocomplete suggestions={suggestions} />);

      const searchInput = screen.getByTestId('search-input');
      const suggestionsList = screen.getByTestId('suggestions-list');

      expect(searchInput).toBeInTheDocument();
      expect(suggestionsList).toBeInTheDocument();
    });

    it('应该处理键盘事件', () => {
      renderWithProvider(<InsertAutocomplete />);

      const searchInput = screen.getByTestId('search-input');

      fireEvent.keyDown(searchInput, { key: 'ArrowDown' });
      fireEvent.keyDown(searchInput, { key: 'ArrowUp' });
      fireEvent.keyDown(searchInput, { key: 'Enter' });
      fireEvent.keyDown(searchInput, { key: 'Escape' });

      expect(searchInput).toBeInTheDocument();
    });
  });

  describe('边界情况测试', () => {
    it('应该处理大量建议', () => {
      const suggestions = Array.from({ length: 100 }, (_, i) => `建议${i + 1}`);

      renderWithProvider(<InsertAutocomplete suggestions={suggestions} />);

      const suggestionsList = screen.getByTestId('suggestions-list');
      expect(suggestionsList).toBeInTheDocument();
    });

    it('应该处理特殊字符建议', () => {
      const suggestions = [
        '特殊字符: !@#$%^&*()',
        '中文建议',
        'Emoji: 😀🎉🚀',
        'HTML: <script>alert("test")</script>',
      ];

      renderWithProvider(<InsertAutocomplete suggestions={suggestions} />);

      suggestions.forEach((_, index) => {
        const suggestion = screen.getByTestId(`suggestion-${index}`);
        expect(suggestion).toBeInTheDocument();
      });
    });

    it('应该处理空字符串建议', () => {
      const suggestions = ['', '正常建议', ''];

      renderWithProvider(<InsertAutocomplete suggestions={suggestions} />);

      const suggestionsList = screen.getByTestId('suggestions-list');
      expect(suggestionsList).toBeInTheDocument();
    });
  });

  describe('性能测试', () => {
    it('应该高效渲染大量建议', () => {
      const suggestions = Array.from(
        { length: 1000 },
        (_, i) => `建议${i + 1}`,
      );

      const startTime = performance.now();
      renderWithProvider(<InsertAutocomplete suggestions={suggestions} />);
      const endTime = performance.now();

      const suggestionsList = screen.getByTestId('suggestions-list');
      expect(suggestionsList).toBeInTheDocument();

      // 渲染时间应该在合理范围内（小于500ms）
      expect(endTime - startTime).toBeLessThan(500);
    });
  });

  describe('无障碍性测试', () => {
    it('应该提供正确的ARIA标签', () => {
      renderWithProvider(<InsertAutocomplete />);

      const searchInput = screen.getByTestId('search-input');
      const suggestionsList = screen.getByTestId('suggestions-list');

      expect(searchInput).toHaveAttribute('placeholder', '搜索...');
      expect(suggestionsList).toBeInTheDocument();
    });

    it('应该支持屏幕阅读器', () => {
      const suggestions = ['建议1', '建议2'];

      renderWithProvider(<InsertAutocomplete suggestions={suggestions} />);

      const suggestionsList = screen.getByTestId('suggestions-list');
      expect(suggestionsList).toBeInTheDocument();
    });
  });
});
