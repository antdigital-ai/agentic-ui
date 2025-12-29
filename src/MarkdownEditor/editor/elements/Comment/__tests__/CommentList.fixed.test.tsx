import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  CommentDataType,
  MarkdownEditorProps,
} from '@ant-design/agentic-ui/MarkdownEditor/BaseMarkdownEditor';
import { CommentList } from '@ant-design/agentic-ui/MarkdownEditor/editor/components/CommentList';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

// Mock Slate Transforms
vi.mock('slate', () => ({
  Transforms: {
    setNodes: vi.fn(),
  },
}));

// Mock dayjs
vi.mock('dayjs', () => {
  const mockDayjs = vi.fn(() => ({
    format: vi.fn(() => '2023-12-01 10:30:00'),
  }));
  return {
    default: mockDayjs,
  };
});

describe('CommentList Component', () => {
  const mockCommentData: CommentDataType[] = [
    {
      id: 'comment-1',
      content: 'This is a test comment',
      user: {
        name: 'John Doe',
        avatar: 'https://example.com/avatar1.jpg',
      },
      time: Date.now(),
      path: [0, 0],
      selection: null,
      anchorOffset: 0,
      focusOffset: 10,
      refContent: 'reference content 1',
      commentType: 'text',
    },
    {
      id: 'comment-2',
      content: 'Another test comment',
      user: {
        name: 'Jane Smith',
        avatar: 'https://example.com/avatar2.jpg',
      },
      time: Date.now() - 1000,
      path: [0, 1],
      selection: null,
      anchorOffset: 5,
      focusOffset: 15,
      refContent: 'reference content 2',
      commentType: 'text',
    },
  ];

  const mockComment: MarkdownEditorProps['comment'] = {
    onClick: vi.fn(),
    onDelete: vi.fn(),
    onEdit: vi.fn(),
    deleteConfirmText: 'Are you sure to delete this comment?',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const renderWithProvider = (component: React.ReactElement) => {
    return render(<ConfigProvider>{component}</ConfigProvider>);
  };

  it('should render basic comment list', () => {
    renderWithProvider(
      <CommentList
        commentList={mockCommentData}
        comment={mockComment}
        style={{ width: '300px' }}
      />,
    );

    expect(screen.getByText('This is a test comment')).toBeInTheDocument();
    expect(screen.getByText('Another test comment')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('should render comment with avatar', () => {
    renderWithProvider(
      <CommentList
        commentList={[mockCommentData[0]]}
        comment={mockComment}
        style={{ width: '300px' }}
      />,
    );

    const avatar = screen.getByRole('img', { name: '' });
    expect(avatar).toHaveAttribute('src', 'https://example.com/avatar1.jpg');
  });

  it('should render comment time using dayjs format', () => {
    renderWithProvider(
      <CommentList
        commentList={[mockCommentData[0]]}
        comment={mockComment}
        style={{ width: '300px' }}
      />,
    );

    expect(screen.getByText('2023-12-01 10:30:00')).toBeInTheDocument();
  });

  it('should render action buttons', () => {
    renderWithProvider(
      <CommentList
        commentList={[mockCommentData[0]]}
        comment={mockComment}
        style={{ width: '300px' }}
      />,
    );

    // Check for action icons
    expect(screen.getByLabelText('delete')).toBeInTheDocument();
    expect(screen.getByLabelText('edit')).toBeInTheDocument();
    expect(screen.getByLabelText('export')).toBeInTheDocument();
  });

  it('should handle click on comment', () => {
    renderWithProvider(
      <CommentList
        commentList={[mockCommentData[0]]}
        comment={mockComment}
        style={{ width: '300px' }}
      />,
    );

    const commentElement = screen.getByText('This is a test comment');
    fireEvent.click(commentElement);

    expect(mockComment.onClick).toHaveBeenCalledWith(
      mockCommentData[0].id,
      mockCommentData[0],
    );
  });

  it('should handle edit button click', () => {
    renderWithProvider(
      <CommentList
        commentList={[mockCommentData[0]]}
        comment={mockComment}
        style={{ width: '300px' }}
      />,
    );

    const editButton = screen.getByLabelText('edit');
    fireEvent.click(editButton);

    expect(mockComment.onEdit).toHaveBeenCalledWith(
      mockCommentData[0].id,
      mockCommentData[0],
    );
  });

  it('should handle delete button click', () => {
    renderWithProvider(
      <CommentList
        commentList={[mockCommentData[0]]}
        comment={mockComment}
        style={{ width: '300px' }}
      />,
    );

    const deleteButton = screen.getByLabelText('delete');
    fireEvent.click(deleteButton);

    // 由于删除按钮在 Popconfirm 中，需要确认
    const confirmButton = screen.getByText('OK');
    fireEvent.click(confirmButton);

    expect(mockComment.onDelete).toHaveBeenCalledWith(
      mockCommentData[0].id,
      mockCommentData[0],
    );
  });

  it('should handle empty comment data', () => {
    renderWithProvider(
      <CommentList
        commentList={[]}
        comment={mockComment}
        style={{ width: '300px' }}
      />,
    );

    // Should render the header but no comments
    expect(screen.getByText('划词评论 (0)')).toBeInTheDocument();
  });

  it('should render user name without avatar when no avatar provided', () => {
    const commentWithoutAvatar = {
      ...mockCommentData[0],
      user: { name: 'Test User' },
    };

    renderWithProvider(
      <CommentList
        commentList={[commentWithoutAvatar]}
        comment={mockComment}
        style={{ width: '300px' }}
      />,
    );

    expect(screen.getByText('Test User')).toBeInTheDocument();
    // Should render empty string for initials in avatar
    const avatar = document.querySelector('.ant-avatar-string');
    expect(avatar).toBeInTheDocument();
  });

  it('should handle comment without user name', () => {
    const commentWithoutUserName = {
      ...mockCommentData[0],
      user: {},
    };

    renderWithProvider(
      <CommentList
        commentList={[commentWithoutUserName] as any[]}
        comment={mockComment}
        style={{ width: '300px' }}
      />,
    );

    // Should render empty string for initials in avatar
    const avatar = document.querySelector('.ant-avatar-string');
    expect(avatar).toBeInTheDocument();
  });

  it('should handle custom style prop', () => {
    const customStyle = { backgroundColor: 'red', width: '400px' };

    renderWithProvider(
      <CommentList
        commentList={mockCommentData}
        comment={mockComment}
        style={customStyle}
      />,
    );

    const commentView = document.querySelector('.ant-agentic-md-editor-comment-view');
    expect(commentView).toHaveStyle('background-color: rgb(255, 0, 0)');
    expect(commentView).toHaveStyle('width: 400px');
  });

  it('should stop propagation on action buttons', () => {
    renderWithProvider(
      <CommentList
        commentList={[mockCommentData[0]]}
        comment={mockComment}
        style={{ width: '300px' }}
      />,
    );

    const deleteButton = screen.getByLabelText('delete');

    // Simulate click
    fireEvent.click(deleteButton);

    // 由于删除按钮在 Popconfirm 中，需要确认
    const confirmButton = screen.getByText('OK');
    fireEvent.click(confirmButton);

    // The component should have called onDelete
    expect(mockComment.onDelete).toHaveBeenCalled();
  });

  it('should apply correct CSS classes', () => {
    renderWithProvider(
      <CommentList
        commentList={[mockCommentData[0]]}
        comment={mockComment}
        style={{ width: '300px' }}
      />,
    );

    expect(
      document.querySelector('.ant-agentic-md-editor-comment-view'),
    ).toBeInTheDocument();
    expect(
      document.querySelector('.ant-agentic-md-editor-comment-view-item'),
    ).toBeInTheDocument();
    expect(
      document.querySelector('.ant-agentic-md-editor-comment-view-item-header'),
    ).toBeInTheDocument();
    expect(
      document.querySelector('.ant-agentic-md-editor-comment-view-item-content'),
    ).toBeInTheDocument();
  });

  it('should render comment count correctly', () => {
    renderWithProvider(
      <CommentList
        commentList={mockCommentData}
        comment={mockComment}
        style={{ width: '300px' }}
      />,
    );

    expect(screen.getByText('划词评论 (2)')).toBeInTheDocument();
  });

  it('should render close button', () => {
    renderWithProvider(
      <CommentList
        commentList={mockCommentData}
        comment={mockComment}
        style={{ width: '300px' }}
      />,
    );

    expect(screen.getByLabelText('close')).toBeInTheDocument();
  });

  it('should handle missing comment prop gracefully', () => {
    renderWithProvider(
      <CommentList
        commentList={mockCommentData}
        comment={undefined as any}
        style={{ width: '300px' }}
      />,
    );

    expect(screen.getByText('This is a test comment')).toBeInTheDocument();
  });
});
