import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { message, Modal } from 'antd';
import copy from 'copy-to-clipboard';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Transforms } from 'slate';
import { useEditorStore } from '../../../../src/MarkdownEditor/editor/store';
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

const storeRef: { current: { editorProps: { comment: { onSubmit: ReturnType<typeof vi.fn> } }; markdownEditorRef: any } | null } = { current: null };

vi.mock('../../../../src/MarkdownEditor/editor/store', () => ({
  useEditorStore: vi.fn(() => {
    const onSubmit = vi.fn();
    const store = {
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
          onSubmit,
        },
      },
    };
    storeRef.current = store as any;
    return store;
  }),
}));

vi.mock('../../../../src/MarkdownEditor/editor/utils/editorUtils', () => ({
  getPointStrOffset: vi.fn(() => 0),
  getSelectionFromDomSelection: vi.fn(() => ({
    anchor: { path: [0], offset: 0 },
    focus: { path: [0], offset: 10 },
  })),
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

    it('editor.selection 为空时从 dom 获取选区并复制', () => {
      const mockCopy = copy as any;
      mockCopy.mockReturnValue(true);

      const storeWithNullSelection = {
        refreshFloatBar: false,
        markdownEditorRef: {
          current: {
            selection: null,
            children: [{ type: 'paragraph', children: [{ text: 'Test content' }] }],
            nodes: vi.fn(() => [[{ type: 'paragraph', children: [{ text: 'Test content' }] }, [0]]]),
            fragment: vi.fn(() => [{ type: 'paragraph', children: [{ text: 'Test content' }] }]),
            string: vi.fn(() => 'Test content'),
          },
        },
        editorProps: {
          comment: { enable: true, onSubmit: vi.fn() },
        },
      } as any;

      const prevImpl = vi.mocked(useEditorStore).getMockImplementation();
      vi.mocked(useEditorStore).mockImplementation(() => storeWithNullSelection);

      try {
        render(<ReadonlyBaseBar {...defaultProps} />);

        const copyButton = screen.getByRole('button', { name: /copy/i });
        fireEvent.click(copyButton);

        expect(mockCopy).toHaveBeenCalledWith('Test content');
        expect(message.success).toHaveBeenCalledWith('复制成功');
      } finally {
        if (prevImpl) vi.mocked(useEditorStore).mockImplementation(prevImpl);
      }
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

    it('应该在评论对话框输入内容并确认后调用 onSubmit 和 Transforms.setNodes', async () => {
      render(<ReadonlyBaseBar {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      const commentButton = buttons[1];
      fireEvent.click(commentButton);

      await waitFor(() => {
        expect(Modal.confirm).toHaveBeenCalled();
      });

      const confirmConfig = (Modal.confirm as any).mock.calls[0][0];
      render(confirmConfig.content);
      const textarea = document.querySelector('textarea');
      expect(textarea).toBeInTheDocument();
      fireEvent.change(textarea!, { target: { value: '  my comment  ' } });

      await confirmConfig.onOk();

      expect(storeRef.current?.editorProps.comment.onSubmit).toHaveBeenCalled();
      expect(Transforms.setNodes).toHaveBeenCalled();
    });

    it('评论内容为空时 onOk 不应调用 onSubmit', async () => {
      render(<ReadonlyBaseBar {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      fireEvent.click(buttons[1]);

      await waitFor(() => {
        expect(Modal.confirm).toHaveBeenCalled();
      });

      const confirmConfig = (Modal.confirm as any).mock.calls[0][0];
      (storeRef.current!.editorProps.comment.onSubmit as any).mockClear();
      await confirmConfig.onOk();

      expect(storeRef.current?.editorProps.comment.onSubmit).not.toHaveBeenCalled();
    });
  });

  describe('高亮功能测试', () => {
    it('点击高亮按钮应调用 comment.onSubmit 和 Transforms.setNodes', async () => {
      render(<ReadonlyBaseBar {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      const highlightButton = buttons[0];
      fireEvent.click(highlightButton);

      await waitFor(() => {
        expect(storeRef.current?.editorProps.comment.onSubmit).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            commentType: 'highlight',
            refContent: 'Test content',
          }),
        );
      });
      expect(Transforms.setNodes).toHaveBeenCalled();
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
      render(<ReadonlyBaseBar />);

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
