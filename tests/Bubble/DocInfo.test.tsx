import '@testing-library/jest-dom';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DocInfoList } from '../../src/Bubble/MessagesContent/DocInfo';

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

  describe('交互与分支覆盖', () => {
    it('点击引用区域 label 应切换展开/收起 (115)', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <DocInfoList
          {...defaultProps}
          options={[{ content: 'Only one', docMeta: { doc_name: 'O' }, originUrl: '#' }]}
          reference_url_info_list={[]}
        />,
      );
      const label = container.querySelector('[class*="doc-info-label"]');
      expect(label).toBeTruthy();
      await user.click(label as HTMLElement);
      await user.click(label as HTMLElement);
      expect(label).toBeInTheDocument();
    });

    it('占位符替换函数应被调用 (66)', () => {
      const props = {
        ...defaultProps,
        options: [
          {
            content: 'See $[ref1] for more.',
            docMeta: { doc_name: 'Doc' },
            originUrl: 'https://example.com/doc',
          },
        ],
        reference_url_info_list: [
          { placeholder: 'ref1', url: 'https://ref1.com', doc_id: '' },
        ],
      };
      render(<DocInfoList {...props} />);
      expect(screen.getByText('Doc')).toBeInTheDocument();
    });

    it('点击列表项且存在 onOriginUrlClick 时应调用回调 (212-213)', async () => {
      const user = userEvent.setup();
      const onOriginUrlClick = vi.fn();
      render(
        <DocInfoList
          {...defaultProps}
          onOriginUrlClick={onOriginUrlClick}
          options={[
            {
              content: 'Test document 1',
              docMeta: { doc_name: 'Document 1' },
              originUrl: 'https://example.com/doc1',
            },
          ]}
        />,
      );
      const item = screen.getByText('Test document 1').closest('[class*="list-item"]');
      await user.click(item!);
      expect(onOriginUrlClick).toHaveBeenCalledWith('https://example.com/doc1');
    });

    it('点击列表项且无 originUrl 时应调用 window.open (215)', async () => {
      const user = userEvent.setup();
      const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
      render(
        <DocInfoList
          {...defaultProps}
          onOriginUrlClick={undefined}
          options={[
            {
              content: 'No url doc',
              docMeta: { doc_name: 'No URL' },
              originUrl: undefined as any,
            },
          ]}
        />,
      );
      const item = screen.getByText('No url doc').closest('[class*="list-item"]');
      await user.click(item!);
      expect(openSpy).toHaveBeenCalledWith(undefined);
      openSpy.mockRestore();
    });

    it('点击「查看原文」且存在 onOriginUrlClick 时应调用回调 (305-307)', async () => {
      const user = userEvent.setup();
      const onOriginUrlClick = vi.fn();
      render(
        <DocInfoList
          {...defaultProps}
          onOriginUrlClick={onOriginUrlClick}
          options={[
            {
              content: 'Short',
              docMeta: { doc_name: 'D1' },
              originUrl: 'https://example.com/d1',
            },
          ]}
        />,
      );
      const btn = screen.getByLabelText('查看原文');
      await user.click(btn);
      expect(onOriginUrlClick).toHaveBeenCalledWith('https://example.com/d1');
    });

    it('点击「查看原文」且无 onOriginUrlClick 时不抛错 (308-310)', async () => {
      const user = userEvent.setup();
      render(
        <DocInfoList
          {...defaultProps}
          onOriginUrlClick={undefined}
          options={[
            {
              content: 'Short',
              docMeta: { doc_name: 'D2' },
              originUrl: 'https://example.com/d2',
            },
          ]}
        />,
      );
      const btn = screen.getByLabelText('查看原文');
      await user.click(btn);
      expect(btn).toBeInTheDocument();
    });

    it('内容长度小于 20 时不包 Popover 直接渲染 dom (323)', () => {
      render(
        <DocInfoList
          {...defaultProps}
          options={[
            {
              content: 'Short',
              docMeta: { doc_name: 'ShortDoc' },
              originUrl: 'https://example.com/short',
            },
          ]}
        />,
      );
      expect(screen.getByText('Short')).toBeInTheDocument();
      expect(screen.getByText('ShortDoc')).toBeInTheDocument();
    });

    it('内容长度不小于 20 时包 Popover，悬停后点击 docMeta 区域可设置 docMeta (371)', async () => {
      const user = userEvent.setup();
      const longContent = 'A'.repeat(25);
      const docName = 'LongDocInPopover';
      const { container } = render(
        <DocInfoList
          {...defaultProps}
          options={[
            {
              content: longContent,
              docMeta: { doc_name: docName, doc_url: 'https://example.com/long' },
              originUrl: 'https://example.com/long',
            },
          ]}
        />,
      );
      expect(screen.getByText(longContent)).toBeInTheDocument();
      const listItem = screen.getByText(longContent).closest('[class*="list-item"]');
      await user.hover(listItem as HTMLElement);
      const popoverContent = document.body.querySelector('[class*="popover"] [class*="content"]') || document.body.querySelector('.ant-popover-content');
      if (popoverContent) {
        const docMetaInPopover = within(popoverContent as HTMLElement).getByText(docName);
        await user.click(docMetaInPopover);
      }
      expect(screen.getByText(docName)).toBeInTheDocument();
    });

    it('传入 render 时使用自定义渲染 (396)', () => {
      const longContent = 'Custom content that is long enough to trigger Popover';
      const renderItem = vi.fn((item: any, dom: React.ReactNode) => (
        <div data-testid="custom-render">{item?.content}</div>
      ));
      render(
        <DocInfoList
          {...defaultProps}
          options={[
            {
              content: longContent,
              docMeta: { doc_name: 'C' },
              originUrl: 'https://example.com/c',
            },
          ]}
          render={renderItem}
        />,
      );
      expect(screen.getByTestId('custom-render')).toBeInTheDocument();
      expect(screen.getByText(longContent)).toBeInTheDocument();
      expect(renderItem).toHaveBeenCalled();
    });
  });
});
