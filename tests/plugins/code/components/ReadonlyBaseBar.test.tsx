import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { message, Modal } from 'antd';
import copy from 'copy-to-clipboard';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ReadonlyBaseBar } from '../../../../src/MarkdownEditor/editor/tools/ToolBar/ReadonlyBaseBar';

// Mock 依赖
vi.mock('copy-to-clipboard');
vi.mock('antd', () => ({
  message: {
    success: vi.fn(),
  },
  Modal: {
    confirm: vi.fn(),
  },
  Input: {
    TextArea: (props: any) => <textarea {...props} />,
  },
}));

vi.mock('../../../../src/MarkdownEditor/editor/store', () => ({
  useEditorStore: () => ({
    refreshFloatBar: false,
    markdownEditorRef: {
      current: {
        selection: {
          anchor: { path: [0], offset: 0 },
          focus: { path: [0], offset: 10 },
        },
        children: [
          {
            type: 'paragraph',
            children: [{ text: 'Test content' }],
          },
        ],
        nodes: vi.fn(() => [
          [
            {
              type: 'paragraph',
              children: [{ text: 'Test content' }],
            },
            [0],
          ],
        ]),
        fragment: vi.fn(() => [
          {
            type: 'paragraph',
            children: [{ text: 'Test content' }],
          },
        ]),
        string: vi.fn(() => 'Test content'),
      },
    },
    editorProps: {
      comment: {
        enable: true,
        onSubmit: vi.fn(),
      },
    },
  }),
}));

vi.mock('slate', () => ({
  Editor: {
    nodes: vi.fn(() => [
      [
        {
          type: 'paragraph',
          children: [{ text: 'Test content' }],
        },
        [0],
      ],
    ]),
  },
  Element: {
    isElement: vi.fn(() => true),
  },
  Node: {
    fragment: vi.fn(() => [
      {
        type: 'paragraph',
        children: [{ text: 'Test content' }],
      },
    ]),
    string: vi.fn(() => 'Test content'),
    first: vi.fn(() => ({ text: 'Test content' })),
  },
  Point: {
    isAfter: vi.fn(() => false),
  },
  Transforms: {
    setNodes: vi.fn(),
  },
}));

describe('ReadonlyBaseBar', () => {
  const defaultProps = {
    prefix: 'test-prefix',
    hashId: 'test-hash',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('基本渲染测试', () => {
    it('应该正确渲染组件', () => {
      render(<ReadonlyBaseBar {...defaultProps} />);

      expect(
        screen.getByRole('button', { name: /comment/i }),
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument();
    });

    it('应该应用正确的样式类', () => {
      render(<ReadonlyBaseBar {...defaultProps} />);

      const commentButton = screen.getByRole('button', { name: /comment/i });
      const copyButton = screen.getByRole('button', { name: /copy/i });

      expect(commentButton).toHaveClass('test-prefix-item');
      expect(copyButton).toHaveClass('test-prefix-item');
    });

    it('应该应用默认样式类当没有提供 prefix 时', () => {
      render(<ReadonlyBaseBar />);

      const commentButton = screen.getByRole('button', { name: /comment/i });
      const copyButton = screen.getByRole('button', { name: /copy/i });

      expect(commentButton).toHaveClass('toolbar-action-item');
      expect(copyButton).toHaveClass('toolbar-action-item');
    });
  });

  describe('复制功能测试', () => {
    it('应该正确处理复制功能', () => {
      const mockCopy = copy as any;
      mockCopy.mockReturnValue(true);

      render(<ReadonlyBaseBar {...defaultProps} />);

      const copyButton = screen.getByRole('button', { name: /copy/i });
      fireEvent.click(copyButton);

      expect(mockCopy).toHaveBeenCalledWith('Test content');
      expect(message.success).toHaveBeenCalledWith('复制成功');
    });

    it('应该处理复制失败的情况', () => {
      const mockCopy = copy as any;
      mockCopy.mockImplementation(() => {
        throw new Error('复制失败');
      });

      render(<ReadonlyBaseBar {...defaultProps} />);

      const copyButton = screen.getByRole('button', { name: /copy/i });
      fireEvent.click(copyButton);

      // 应该不会显示成功消息
      expect(message.success).not.toHaveBeenCalled();
    });
  });

  describe('评论功能测试', () => {
    it('应该点击评论按钮时打开评论对话框', async () => {
      render(<ReadonlyBaseBar {...defaultProps} />);

      const commentButton = screen.getByRole('button', { name: /comment/i });
      fireEvent.click(commentButton);

      await waitFor(() => {
        expect(Modal.confirm).toHaveBeenCalled();
      });
    });
  });

  describe('样式和布局测试', () => {
    it('应该应用正确的容器样式', () => {
      const { container } = render(<ReadonlyBaseBar {...defaultProps} />);

      const toolbarContainer = container.firstChild as HTMLElement;
      expect(toolbarContainer).toHaveStyle({
        display: 'flex',
        height: '100%',
        gap: '1px',
        alignItems: 'center',
      });
    });

    it('应该渲染所有按钮', () => {
      render(<ReadonlyBaseBar {...defaultProps} />);
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(3); // 评论按钮和复制按钮
    });
  });

  describe('边界情况测试', () => {
    it('应该处理没有 hashId 的情况', () => {
      render(<ReadonlyBaseBar prefix="test-prefix" />);

      const commentButton = screen.getByRole('button', { name: /comment/i });
      expect(commentButton).toHaveClass('test-prefix-item');
    });

    it('应该处理没有 prefix 的情况', () => {
      render(<ReadonlyBaseBar hashId="test-hash" />);

      const commentButton = screen.getByRole('button', { name: /comment/i });
      expect(commentButton).toHaveClass('toolbar-action-item');
    });

    it('应该处理没有 props 的情况', () => {
      render(<ReadonlyBaseBar />);

      const commentButton = screen.getByRole('button', { name: /comment/i });
      expect(commentButton).toHaveClass('toolbar-action-item');
    });
  });
});
