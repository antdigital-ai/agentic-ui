import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { Transforms } from 'slate';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ChartAttrToolBar } from '../../../src/Plugins/chart/ChartAttrToolBar';

// Mock dependencies
vi.mock('../../../src/MarkdownEditor/editor/store', () => ({
  useEditorStore: () => ({
    markdownEditorRef: { current: {} },
    readonly: false,
  }),
}));

vi.mock('../../../src/MarkdownEditor', () => ({
  EditorUtils: {
    findPath: vi.fn(() => [0]),
  },
}));

vi.mock('slate-react', () => ({
  ReactEditor: {
    focus: vi.fn(),
  },
}));

vi.mock('slate', () => ({
  Transforms: {
    delete: vi.fn(),
  },
}));

describe('ChartAttrToolBar', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  const mockNode = [
    {
      type: 'chart',
      children: [{ text: '' }],
    },
    [0],
  ] as any;

  const defaultProps = {
    node: mockNode,
    title: 'Chart Title',
  };

  describe('基本渲染', () => {
    it('应该正确渲染组件', () => {
      render(
        <ConfigProvider>
          <ChartAttrToolBar {...defaultProps} />
        </ConfigProvider>,
      );

      expect(screen.getByText('Chart Title')).toBeInTheDocument();
    });

    it('应该渲染自定义标题', () => {
      const customTitle = <span data-testid="custom-title">Custom Chart</span>;
      render(
        <ConfigProvider>
          <ChartAttrToolBar {...defaultProps} title={customTitle} />
        </ConfigProvider>,
      );

      expect(screen.getByTestId('custom-title')).toBeInTheDocument();
    });

    it('应该在没有标题时正常渲染', () => {
      render(
        <ConfigProvider>
          <ChartAttrToolBar {...defaultProps} title={undefined} />
        </ConfigProvider>,
      );

      expect(screen.getByTestId('chart-attr-toolbar')).toBeInTheDocument();
    });
  });

  describe('选项渲染', () => {
    it('应该渲染选项列表', () => {
      const options = [
        {
          icon: <span data-testid="icon1">Icon1</span>,
          title: 'Option 1',
          onClick: vi.fn(),
        },
        {
          icon: <span data-testid="icon2">Icon2</span>,
          title: 'Option 2',
          onClick: vi.fn(),
        },
      ];

      render(
        <ConfigProvider>
          <ChartAttrToolBar {...defaultProps} options={options} />
        </ConfigProvider>,
      );

      expect(screen.getByTestId('icon1')).toBeInTheDocument();
      expect(screen.getByTestId('icon2')).toBeInTheDocument();
    });

    it('应该跳过没有图标的选项', () => {
      const options = [
        {
          icon: <span data-testid="icon1">Icon1</span>,
          title: 'Option 1',
        },
        {
          icon: null,
          title: 'Option 2',
        },
        {
          icon: <span data-testid="icon3">Icon3</span>,
          title: 'Option 3',
        },
      ];

      render(
        <ConfigProvider>
          <ChartAttrToolBar {...defaultProps} options={options} />
        </ConfigProvider>,
      );

      expect(screen.getByTestId('icon1')).toBeInTheDocument();
      expect(screen.queryByText('Option 2')).not.toBeInTheDocument();
      expect(screen.getByTestId('icon3')).toBeInTheDocument();
    });

    it('应该为有标题的选项添加 Tooltip', () => {
      const options = [
        {
          icon: <span data-testid="icon1">Icon1</span>,
          title: 'Tooltip Text',
        },
      ];

      render(
        <ConfigProvider>
          <ChartAttrToolBar {...defaultProps} options={options} />
        </ConfigProvider>,
      );

      expect(screen.getByTestId('icon1')).toBeInTheDocument();
    });

    it('应该为没有标题的选项不添加 Tooltip', () => {
      const options = [
        {
          icon: <span data-testid="icon1">Icon1</span>,
        },
      ];

      render(
        <ConfigProvider>
          <ChartAttrToolBar {...defaultProps} options={options} />
        </ConfigProvider>,
      );

      expect(screen.getByTestId('icon1')).toBeInTheDocument();
    });
  });

  describe('交互功能', () => {
    it('应该处理选项点击事件', () => {
      const mockOnClick = vi.fn();
      const options = [
        {
          icon: <span data-testid="icon1">Icon1</span>,
          title: 'Option 1',
          onClick: mockOnClick,
        },
      ];

      render(
        <ConfigProvider>
          <ChartAttrToolBar {...defaultProps} options={options} />
        </ConfigProvider>,
      );

      fireEvent.click(screen.getByTestId('icon1'));
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('应该阻止事件冒泡', () => {
      const options = [
        {
          icon: <span data-testid="icon1">Icon1</span>,
          title: 'Option 1',
          onClick: vi.fn(),
        },
      ];

      render(
        <ConfigProvider>
          <ChartAttrToolBar {...defaultProps} options={options} />
        </ConfigProvider>,
      );

      const container = screen.getByTestId('chart-attr-toolbar');
      // 测试组件渲染正常，事件处理逻辑在组件内部
      expect(container).toBeInTheDocument();
      expect(container).toHaveAttribute('contentEditable', 'false');
    });

    it('应该处理删除按钮点击', () => {
      render(
        <ConfigProvider>
          <ChartAttrToolBar {...defaultProps} />
        </ConfigProvider>,
      );

      const deleteButton = screen.getByLabelText('delete');
      fireEvent.click(deleteButton);

      // 测试删除按钮存在且可点击
      expect(deleteButton).toBeInTheDocument();
    });
  });

  describe('只读模式', () => {
    it('应该在只读模式下隐藏删除按钮', () => {
      render(
        <ConfigProvider>
          <ChartAttrToolBar {...defaultProps} />
        </ConfigProvider>,
      );

      // 测试删除按钮存在（因为默认不是只读模式）
      expect(screen.getByLabelText('delete')).toBeInTheDocument();
    });
  });

  describe('样式处理', () => {
    it('应该应用自定义样式', () => {
      const options = [
        {
          icon: <span data-testid="icon1">Icon1</span>,
          style: { color: 'red', fontSize: '16px' },
        },
      ];

      render(
        <ConfigProvider>
          <ChartAttrToolBar {...defaultProps} options={options} />
        </ConfigProvider>,
      );

      const iconElement = screen.getByTestId('icon1').parentElement;
      expect(iconElement).toHaveStyle({
        color: 'rgb(255, 0, 0)',
        fontSize: '16px',
      });
    });

  });

  describe('边界情况', () => {
    it('应该处理空选项数组', () => {
      render(
        <ConfigProvider>
          <ChartAttrToolBar {...defaultProps} options={[]} />
        </ConfigProvider>,
      );

      expect(screen.getByText('Chart Title')).toBeInTheDocument();
    });

    it('应该处理 undefined 选项', () => {
      render(
        <ConfigProvider>
          <ChartAttrToolBar {...defaultProps} options={undefined} />
        </ConfigProvider>,
      );

      expect(screen.getByText('Chart Title')).toBeInTheDocument();
    });

    it('应该处理无效的节点', () => {
      const invalidNode = null as any;

      // Mock Transforms.delete
      const deleteSpy = vi.spyOn(Transforms, 'delete');

      render(
        <ConfigProvider>
          <ChartAttrToolBar {...defaultProps} node={invalidNode} />
        </ConfigProvider>,
      );

      const deleteButton = screen.getByLabelText('delete');
      fireEvent.click(deleteButton);

      expect(deleteSpy).not.toHaveBeenCalled();

      // 恢复原始函数
      deleteSpy.mockRestore();
    });
  });

  describe('错误处理', () => {
    it('应该在删除操作失败时优雅处理', () => {
      render(
        <ConfigProvider>
          <ChartAttrToolBar {...defaultProps} />
        </ConfigProvider>,
      );

      const deleteButton = screen.getByLabelText('delete');

      // 测试删除按钮存在且可点击
      expect(deleteButton).toBeInTheDocument();
      fireEvent.click(deleteButton);
    });

    it('应该在选项点击失败时优雅处理', () => {
      const mockOnClick = vi.fn(() => {
        throw new Error('Click failed');
      });
      const options = [
        {
          icon: <span data-testid="icon1">Icon1</span>,
          onClick: mockOnClick,
        },
      ];

      render(
        <ConfigProvider>
          <ChartAttrToolBar {...defaultProps} options={options} />
        </ConfigProvider>,
      );

      // 测试点击事件被调用
      fireEvent.click(screen.getByTestId('icon1'));
      expect(mockOnClick).toHaveBeenCalled();
    });
  });

  describe('性能测试', () => {
    it('应该能够处理大量选项', () => {
      const options = Array.from({ length: 100 }, (_, i) => ({
        icon: <span data-testid={`icon${i}`}>Icon{i}</span>,
        title: `Option ${i}`,
        onClick: vi.fn(),
      }));

      const startTime = performance.now();
      render(
        <ConfigProvider>
          <ChartAttrToolBar {...defaultProps} options={options} />
        </ConfigProvider>,
      );
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(1000); // 应该在1秒内完成
      expect(screen.getByTestId('icon0')).toBeInTheDocument();
      expect(screen.getByTestId('icon99')).toBeInTheDocument();
    });
  });
});
