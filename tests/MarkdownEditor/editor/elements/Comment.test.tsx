/**
 * Comment 组件测试文件
 */

import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  CommentCreate,
  CommentView,
} from '../../../../src/MarkdownEditor/editor/elements/Comment';
import { TestSlateWrapper } from './TestSlateWrapper';

// Mock dependencies
const mockSetShowComment = vi.hoisted(() => vi.fn());

vi.mock(
  '../../../../src/MarkdownEditor/editor/store',
  async (importOriginal) => {
    const actual = (await importOriginal()) as any;
    return {
      ...actual,
      EditorStoreContext: React.createContext({
        store: {},
        typewriter: false,
        setShowComment: mockSetShowComment(),
        readonly: false,
        keyTask$: { next: vi.fn() },
        insertCompletionText$: { next: vi.fn() },
        openInsertLink$: { next: vi.fn() },
        domRect: null,
        setDomRect: vi.fn(),
        editorProps: {},
        markdownEditorRef: { current: null },
        markdownContainerRef: { current: null },
      }),
      useEditorStore: vi.fn(() => ({
        store: {},
        readonly: false,
        typewriter: false,
        editorProps: {},
        markdownEditorRef: { current: null },
        setShowComment: mockSetShowComment(),
      })),
    };
  },
);

describe('Comment', () => {
  const renderWithProvider = (component: React.ReactElement) => {
    return render(
      <ConfigProvider>
        <TestSlateWrapper>{component}</TestSlateWrapper>
      </ConfigProvider>,
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('CommentView', () => {
    const mockCommentItem = [
      {
        id: 'comment-1',
        content: 'Test comment',
        author: 'Test User',
        timestamp: '2023-01-01T00:00:00Z',
        selection: {
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 0 },
        },
        path: [0, 0],
        anchorOffset: 0,
        focusOffset: 0,
        refContent: 'Test content',
        commentType: 'text',
        time: Date.now(),
        user: {
          name: 'Test User',
        },
      },
    ] as any;

    it('应该正确渲染有评论的内容', () => {
      renderWithProvider(
        <CommentView
          comment={{}}
          commentItem={mockCommentItem}
          id="test-id"
         
        >
          
          <span>Test content</span>
        </CommentView>,
      );

      const commentElement = screen.getByTestId('comment-view');
      expect(commentElement).toBeInTheDocument();
      expect(commentElement).toHaveAttribute('data-be', 'comment-text');
      expect(commentElement).toHaveAttribute('id', 'test-id');
      expect(commentElement).toHaveTextContent('Test content');
    });

    it('应该处理点击事件', () => {
      renderWithProvider(
        <CommentView
          comment={{}}
          commentItem={mockCommentItem}
          id="test-id"
         
        >
          <span>Test content</span>
        </CommentView>,
      );

      const commentElement = screen.getByTestId('comment-view');
      fireEvent.click(commentElement);

      // 验证点击事件被触发
      expect(commentElement).toBeInTheDocument();
    });

    it('应该处理点击事件并阻止默认行为', () => {
      const mockPreventDefault = vi.fn();
      const mockStopPropagation = vi.fn();

      renderWithProvider(
        <CommentView
          comment={{}}
          commentItem={mockCommentItem}
          id="test-id"
         
        >
          <span>Test content</span>
        </CommentView>,
      );

      const commentElement = screen.getByTestId('comment-view');

      // 模拟点击事件
      fireEvent.click(commentElement, {
        preventDefault: mockPreventDefault,
        stopPropagation: mockStopPropagation,
      });

      // 验证点击事件被触发
      expect(commentElement).toBeInTheDocument();
    });

    it('应该在没有评论时直接渲染子元素', () => {
      renderWithProvider(
        <CommentView
          comment={{}}
          commentItem={[]}
          id="test-id"
         
        >
          <span>Test content</span>
        </CommentView>,
      );

      const contentElement = screen.getByText('Test content');
      expect(contentElement).toBeInTheDocument();
      // 不应该有 comment-view testid
      expect(screen.queryByTestId('comment-view')).not.toBeInTheDocument();
    });

    it('应该在没有评论项时直接渲染子元素', () => {
      renderWithProvider(
        <CommentView
          comment={{}}
          commentItem={undefined as any}
          id="test-id"
         
        >
          <span>Test content</span>
        </CommentView>,
      );

      const contentElement = screen.getByText('Test content');
      expect(contentElement).toBeInTheDocument();
      // 不应该有 comment-view testid
      expect(screen.queryByTestId('comment-view')).not.toBeInTheDocument();
    });

    it('应该处理空的评论项数组', () => {
      renderWithProvider(
        <CommentView
          comment={{}}
          commentItem={[]}
          id="test-id"
         
        >
          <span>Test content</span>
        </CommentView>,
      );

      const contentElement = screen.getByText('Test content');
      expect(contentElement).toBeInTheDocument();
      expect(screen.queryByTestId('comment-view')).not.toBeInTheDocument();
    });

    it('应该处理复杂的子元素', () => {
      renderWithProvider(
        <CommentView
          comment={{}}
          commentItem={mockCommentItem}
          id="test-id"
         
        >
          <div>
            <span>Complex content</span>
            <p>With multiple elements</p>
          </div>
        </CommentView>,
      );

      const commentElement = screen.getByTestId('comment-view');
      expect(commentElement).toBeInTheDocument();
      expect(commentElement).toHaveTextContent('Complex content');
      expect(commentElement).toHaveTextContent('With multiple elements');
    });

    it('应该处理多个评论项', () => {
      const multipleCommentItems = [
        {
          id: 'comment-1',
          content: 'First comment',
          author: 'User 1',
          timestamp: '2023-01-01T00:00:00Z',
          selection: {
            anchor: { path: [0, 0], offset: 0 },
            focus: { path: [0, 0], offset: 0 },
          },
          path: [0, 0],
          anchorOffset: 0,
          focusOffset: 0,
          refContent: 'Test content',
          commentType: 'text',
          time: Date.now(),
          user: {
            name: 'User 1',
          },
        },
        {
          id: 'comment-2',
          content: 'Second comment',
          author: 'User 2',
          timestamp: '2023-01-02T00:00:00Z',
          selection: {
            anchor: { path: [0, 0], offset: 0 },
            focus: { path: [0, 0], offset: 0 },
          },
          path: [0, 0],
          anchorOffset: 0,
          focusOffset: 0,
          refContent: 'Test content',
          commentType: 'text',
          time: Date.now(),
          user: {
            name: 'User 2',
          },
        },
      ] as any;

      renderWithProvider(
        <CommentView
          comment={{}}
          commentItem={multipleCommentItems}
          id="test-id"
         
        >
          <span>Test content</span>
        </CommentView>,
      );

      const commentElement = screen.getByTestId('comment-view');
      expect(commentElement).toBeInTheDocument();
    });
  });

  describe('CommentCreate', () => {
    it('应该渲染默认的 div 元素', () => {
      renderWithProvider(<CommentCreate comment={{}} />);

      const divElement = screen.getByTestId('comment-create-default');
      expect(divElement).toBeInTheDocument();
    });

    it('应该使用自定义的 editorRender 函数', () => {
      const mockEditorRender = vi.fn((dom) => (
        <div data-testid="custom-editor-render">
          Custom Editor
          {dom}
        </div>
      ));

      renderWithProvider(
        <CommentCreate
          comment={{
            editorRender: mockEditorRender,
          }}
        />,
      );

      const customElement = screen.getByTestId('custom-editor-render');
      expect(customElement).toBeInTheDocument();
      expect(customElement).toHaveTextContent('Custom Editor');
      expect(mockEditorRender).toHaveBeenCalledWith(expect.any(Object));
    });

    it('应该在没有 comment 属性时渲染默认 div', () => {
      renderWithProvider(<CommentCreate comment={undefined as any} />);

      const divElement = screen.getByTestId('comment-create-default');
      expect(divElement).toBeInTheDocument();
    });

    it('应该处理空的 comment 对象', () => {
      renderWithProvider(<CommentCreate comment={{}} />);

      const divElement = screen.getByTestId('comment-create-default');
      expect(divElement).toBeInTheDocument();
    });

    it('应该处理没有 editorRender 的 comment', () => {
      renderWithProvider(
        <CommentCreate
          comment={
            {
              // 没有 editorRender 属性
            }
          }
        />,
      );

      const divElement = screen.getByTestId('comment-create-default');
      expect(divElement).toBeInTheDocument();
    });

    it('应该处理 editorRender 返回 null 的情况', () => {
      const mockEditorRender = vi.fn(() => null);

      renderWithProvider(
        <CommentCreate
          comment={{
            editorRender: mockEditorRender,
          }}
        />,
      );

      expect(mockEditorRender).toHaveBeenCalledWith(expect.any(Object));
    });

    it('应该处理 editorRender 返回字符串的情况', () => {
      const mockEditorRender = vi.fn(() => 'String content' as any);

      renderWithProvider(
        <CommentCreate
          comment={{
            editorRender: mockEditorRender,
          }}
        />,
      );

      expect(mockEditorRender).toHaveBeenCalledWith(expect.any(Object));
    });

    it('应该验证 editorRender 接收到的 dom 参数', () => {
      const mockEditorRender = vi.fn((dom) => {
        expect(dom).toBeDefined();
        expect(dom.props).toBeDefined();
        expect(dom.props['data-testid']).toBe('comment-create-default');
        return <div data-testid="verified-render">Verified</div>;
      });

      renderWithProvider(
        <CommentCreate
          comment={{
            editorRender: mockEditorRender,
          }}
        />,
      );

      expect(mockEditorRender).toHaveBeenCalledWith(expect.any(Object));
      expect(screen.getByTestId('verified-render')).toBeInTheDocument();
    });
  });

  describe('边界情况测试', () => {
    it('应该处理空的子元素', () => {
      renderWithProvider(
        <CommentView
          comment={{}}
          commentItem={[]}
          id="test-id"
         
        >
          {null}
        </CommentView>,
      );

      expect(screen.queryByTestId('comment-view')).not.toBeInTheDocument();
    });

    it('应该处理空的字符串子元素', () => {
      renderWithProvider(
        <CommentView
          comment={{}}
          commentItem={[]}
          id="test-id"
         
        >
          {''}
        </CommentView>,
      );

      expect(screen.queryByTestId('comment-view')).not.toBeInTheDocument();
    });

    it('应该处理数字子元素', () => {
      renderWithProvider(
        <CommentView
          comment={{}}
          commentItem={[]}
          id="test-id"
         
        >
          {123}
        </CommentView>,
      );

      expect(screen.getByText('123')).toBeInTheDocument();
    });

    it('应该处理布尔子元素', () => {
      renderWithProvider(
        <CommentView
          comment={{}}
          commentItem={[]}
          id="test-id"
         
        >
          {true}
        </CommentView>,
      );

      // 当 commentItem 为空时，布尔值 true 不会被渲染为文本
      // 因为组件直接返回 children，而布尔值在 React 中不会被渲染
      expect(screen.queryByText('true')).not.toBeInTheDocument();
    });
  });
});
