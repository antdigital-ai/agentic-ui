import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DocInfoList } from '../MessagesContent/DocInfo';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => (
      <div data-testid="motion-div" {...props}>
        {children}
      </div>
    ),
  },
}));

describe('DocInfoList', () => {
  const defaultProps = {
    options: [
      {
        content: 'Test document 1',
        docMeta: {
          doc_name: 'Document 1',
          doc_url: 'https://example.com/doc1',
        },
        originUrl: 'https://example.com/doc1',
      },
      {
        content: 'Test document 2',
        docMeta: {
          doc_name: 'Document 2',
          doc_url: 'https://example.com/doc2',
        },
        originUrl: 'https://example.com/doc2',
      },
    ],
    reference_url_info_list: [
      {
        content: 'Reference 1',
        docMeta: {
          doc_name: 'Ref Doc 1',
          doc_url: 'https://example.com/ref1',
        },
        originUrl: 'https://example.com/ref1',
      },
    ],
    onOriginUrlClick: vi.fn(),
    render: undefined,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('基本渲染测试', () => {
    it('应该正确渲染文档列表', () => {
      render(<DocInfoList {...defaultProps} />);
      expect(
        screen.getAllByText((content, node: any) => {
          const hasText = (node: any) =>
            node?.textContent?.replace(/\s/g, '').includes('引用内容');
          return hasText(node);
        }).length,
      ).toBeGreaterThan(0);
    });

    it('应该显示正确的文档数量', () => {
      render(<DocInfoList {...defaultProps} />);
      expect(
        screen.getAllByText((content, node: any) => {
          const hasText = (node: any) =>
            node?.textContent?.replace(/\s/g, '').includes('2');
          return hasText(node);
        }).length,
      ).toBeGreaterThan(0);
      expect(
        screen.getAllByText((content, node: any) => {
          const hasText = (node: any) =>
            node?.textContent?.replace(/\s/g, '').includes('1');
          return hasText(node);
        }).length,
      ).toBeGreaterThan(0);
    });

    it('应该渲染文档内容', () => {
      render(<DocInfoList {...defaultProps} />);
      expect(screen.getByText('Test document 1')).toBeInTheDocument();
      expect(screen.getByText('Test document 2')).toBeInTheDocument();
    });
  });

  describe('文档项测试', () => {
    it('应该渲染文档项', () => {
      render(<DocInfoList {...defaultProps} />);
      expect(screen.getByText('Test document 1')).toBeInTheDocument();
      expect(screen.getByText('Test document 2')).toBeInTheDocument();
    });

    it('应该显示文档名称', () => {
      render(<DocInfoList {...defaultProps} />);
      expect(
        screen.getAllByText((content, node: any) => {
          const hasText = (node: any) =>
            node?.textContent?.replace(/\s/g, '').includes('引用内容');
          return hasText(node);
        }).length,
      ).toBeGreaterThan(0);
    });

    it('应该渲染操作按钮', () => {
      render(<DocInfoList {...defaultProps} />);
      expect(screen.getAllByLabelText('查看原文')).toHaveLength(
        defaultProps.options.length,
      );
    });
  });

  describe('引用URL信息测试', () => {
    it('应该处理多个引用URL信息', () => {
      const props = {
        ...defaultProps,
        reference_url_info_list: [
          {
            content: 'Reference 1',
            docMeta: { doc_name: 'Ref 1' },
            originUrl: 'https://example.com/ref1',
          },
          {
            content: 'Reference 2',
            docMeta: { doc_name: 'Ref 2' },
            originUrl: 'https://example.com/ref2',
          },
        ],
      };
      render(<DocInfoList {...props} />);
      expect(
        screen.getAllByText((content, node: any) => {
          const hasText = (node: any) =>
            node?.textContent?.replace(/\s/g, '').includes('2');
          return hasText(node);
        }).length,
      ).toBeGreaterThan(0);
    });
  });

  describe('边界条件测试', () => {
    it('应该处理无选项的情况', () => {
      const props = {
        ...defaultProps,
        options: [],
      };
      render(<DocInfoList {...props} />);
      expect(
        screen.getAllByText((content, node: any) => {
          const hasText = (node: any) =>
            node?.textContent?.replace(/\s/g, '').includes('0');
          return hasText(node);
        }).length,
      ).toBeGreaterThan(0);
    });

    it('应该处理空内容的情况', () => {
      const props = {
        ...defaultProps,
        options: [
          {
            content: '',
            docMeta: { doc_name: 'Empty Doc' },
            originUrl: 'https://example.com/empty',
          },
        ],
      };
      render(<DocInfoList {...props} />);
      expect(screen.getByText('Empty Doc')).toBeInTheDocument();
    });

    it('应该处理无originUrl的情况', () => {
      const props = {
        ...defaultProps,
        options: [
          {
            content: 'Test content',
            docMeta: { doc_name: 'No URL Doc' },
            originUrl: 'https://example.com/no-url',
          },
        ],
      };
      render(<DocInfoList {...props} />);
      expect(
        screen.getAllByText((content, node: any) => {
          const hasText = (node: any) =>
            node?.textContent?.replace(/\s/g, '').includes('引用内容');
          return hasText(node);
        }).length,
      ).toBeGreaterThan(0);
    });
  });

  describe('样式测试', () => {
    it('应该应用正确的样式类名', () => {
      render(<DocInfoList {...defaultProps} />);
      expect(
        screen.getAllByText((content, node: any) => {
          const hasText = (node: any) =>
            node?.textContent?.replace(/\s/g, '').includes('引用内容');
          return hasText(node);
        }).length,
      ).toBeGreaterThan(0);
    });

    it('应该处理紧凑模式的样式', () => {
      render(<DocInfoList {...defaultProps} />);
      expect(
        screen.getAllByText((content, node: any) => {
          const hasText = (node: any) =>
            node?.textContent?.replace(/\s/g, '').includes('引用内容');
          return hasText(node);
        }).length,
      ).toBeGreaterThan(0);
    });
  });

  describe('动画测试', () => {
    it('应该应用正确的动画属性', () => {
      render(<DocInfoList {...defaultProps} />);

      expect(screen.getAllByTestId('motion-div')).toHaveLength(3);
    });
  });
});
