import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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

  it('should render comment list with correct title and count', () => {
    renderWithProvider(
      <CommentList commentList={mockCommentData} comment={mockComment} />,
    );

    expect(screen.getByText('划词评论 (2)')).toBeInTheDocument();
  });

  it('should render empty comment list', () => {
    renderWithProvider(<CommentList commentList={[]} comment={mockComment} />);

    expect(screen.getByText('划词评论 (0)')).toBeInTheDocument();
  });

  it('should render comment items with user information', () => {
    renderWithProvider(
      <CommentList commentList={mockCommentData} comment={mockComment} />,
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('This is a test comment')).toBeInTheDocument();
    expect(screen.getByText('Another test comment')).toBeInTheDocument();
  });

  it('should render formatted time for comments', () => {
    renderWithProvider(
      <CommentList commentList={mockCommentData} comment={mockComment} />,
    );

    expect(screen.getAllByText('2023-12-01 10:30:00')).toHaveLength(2);
  });

  it('should render user avatars', () => {
    renderWithProvider(
      <CommentList commentList={mockCommentData} comment={mockComment} />,
    );

    const avatars = screen.getAllByRole('img');
    expect(avatars.length).toBeGreaterThanOrEqual(2);
  });

  it('should render user initials when no avatar provided', () => {
    const commentWithoutAvatar: CommentDataType[] = [
      {
        id: 'comment-1',
        content: 'Test comment',
        user: {
          name: 'John Doe',
        },
        time: Date.now(),
        path: [0, 0],
        selection: null,
        anchorOffset: 0,
        focusOffset: 10,
        refContent: 'reference content',
        commentType: 'text',
      },
    ];

    renderWithProvider(
      <CommentList commentList={commentWithoutAvatar} comment={mockComment} />,
    );

    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('should handle user name with single word', () => {
    const commentSingleName: CommentDataType[] = [
      {
        id: 'comment-1',
        content: 'Test comment',
        user: {
          name: 'John',
        },
        time: Date.now(),
        path: [0, 0],
        selection: null,
        anchorOffset: 0,
        focusOffset: 10,
        refContent: 'reference content',
        commentType: 'text',
      },
    ];

    renderWithProvider(
      <CommentList commentList={commentSingleName} comment={mockComment} />,
    );

    expect(screen.getByText('J')).toBeInTheDocument();
  });

  it('should handle empty user name', () => {
    const commentEmptyName: CommentDataType[] = [
      {
        id: 'comment-1',
        content: 'Test comment',
        user: {
          name: '',
        },
        time: Date.now(),
        path: [0, 0],
        selection: null,
        anchorOffset: 0,
        focusOffset: 10,
        refContent: 'reference content',
        commentType: 'text',
      },
    ];

    renderWithProvider(
      <CommentList commentList={commentEmptyName} comment={mockComment} />,
    );

    // Should render empty string for initials
    const avatar = screen.getAllByRole('img')[0];
    expect(avatar).toBeInTheDocument();
  });

  it('should call onClick when comment item is clicked', async () => {
    renderWithProvider(
      <CommentList commentList={mockCommentData} comment={mockComment} />,
    );

    const firstComment = screen
      .getByText('This is a test comment')
      .closest('div');
    fireEvent.click(firstComment!);

    await waitFor(() => {
      expect(mockComment.onClick).toHaveBeenCalledWith(
        'comment-1',
        mockCommentData[0],
      );
    });
  });

  it('should render action buttons when callbacks are provided', () => {
    renderWithProvider(
      <CommentList commentList={mockCommentData} comment={mockComment} />,
    );

    // Check for presence of action icons
    expect(screen.getAllByLabelText('delete')).toHaveLength(2);
    expect(screen.getAllByLabelText('edit')).toHaveLength(2);
    expect(screen.getAllByLabelText('export')).toHaveLength(2);
  });

  it('should not render delete button when onDelete is not provided', () => {
    const commentWithoutDelete = { ...mockComment, onDelete: undefined };
    renderWithProvider(
      <CommentList
        commentList={mockCommentData}
        comment={commentWithoutDelete}
      />,
    );

    expect(screen.queryAllByLabelText('delete')).toHaveLength(0);
  });

  it('should not render edit button when onEdit is not provided', () => {
    const commentWithoutEdit = { ...mockComment, onEdit: undefined };
    renderWithProvider(
      <CommentList
        commentList={mockCommentData}
        comment={commentWithoutEdit}
      />,
    );

    expect(screen.queryAllByLabelText('edit')).toHaveLength(0);
  });

  it('should call onEdit when edit button is clicked', async () => {
    renderWithProvider(
      <CommentList commentList={mockCommentData} comment={mockComment} />,
    );

    const editIcons = screen.getAllByLabelText('edit');
    fireEvent.click(editIcons[0]);

    await waitFor(() => {
      expect(mockComment.onEdit).toHaveBeenCalledWith(
        'comment-1',
        mockCommentData[0],
      );
    });
  });

  it('should handle navigation button click', async () => {
    // Mock document.getElementById
    const mockElement = {
      scrollIntoView: vi.fn(),
    };
    global.document.getElementById = vi.fn(() => mockElement as any);
    global.window.scrollBy = vi.fn();

    renderWithProvider(
      <CommentList commentList={mockCommentData} comment={mockComment} />,
    );

    const exportIcons = screen.getAllByLabelText('export');
    fireEvent.click(exportIcons[0]);

    await waitFor(() => {
      expect(mockComment.onClick).toHaveBeenCalledWith(
        'comment-1',
        mockCommentData[0],
      );
    });
  });

  it('should handle undefined comment list', () => {
    renderWithProvider(
      <CommentList commentList={undefined as any} comment={mockComment} />,
    );

    expect(screen.getByText('划词评论 ()')).toBeInTheDocument();
  });

  it('should render with proper structure', () => {
    const { container } = renderWithProvider(
      <CommentList commentList={mockCommentData} comment={mockComment} />,
    );

    expect(container.firstChild).toBeInTheDocument();
  });
});
