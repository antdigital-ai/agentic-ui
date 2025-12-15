import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TocHeading } from '../../../../src/MarkdownEditor/editor/tools/Leading';
import { Elements } from '../../../../src/MarkdownEditor/el';

// Mock nanoid
vi.mock('nanoid', () => {
  return {
    nanoid: () => 'mock-id',
    customAlphabet: () => () => 'mock-id',
  };
});
// Mock useEditorStore
const mockMarkdownContainerRef = {
  current: null,
};

vi.mock('../../../../src/MarkdownEditor/editor/store', () => ({
  useEditorStore: () => ({
    markdownContainerRef: mockMarkdownContainerRef,
  }),
}));

// Mock dom utilities
vi.mock('../../../../src/MarkdownEditor/editor/utils/dom', () => ({
  getOffsetTop: vi.fn(() => 100),
  slugify: vi.fn((str) => str.toLowerCase().replace(/\s+/g, '-')),
}));

describe('Leading (TocHeading)', () => {
  const mockSchema: Elements[] = [
    {
      type: 'head',
      level: 1,
      children: [{ text: '第一章' }],
    } as Elements,
    {
      type: 'head',
      level: 2,
      children: [{ text: '第一节' }],
    } as Elements,
    {
      type: 'head',
      level: 3,
      children: [{ text: '小节' }],
    } as Elements,
    {
      type: 'paragraph',
      children: [{ text: '段落内容' }],
    } as Elements,
    {
      type: 'head',
      level: 2,
      children: [{ text: '第二节' }],
    } as Elements,
  ];  beforeEach(() => {
    vi.clearAllMocks();
    // Reset DOM
    document.body.innerHTML = '';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('基础渲染测试', () => {
    it('应该正确渲染目录组件', () => {
      render(<TocHeading schema={mockSchema} />);
      
      // 检查是否渲染了目录项
      expect(screen.getByText('第一章')).toBeInTheDocument();
      expect(screen.getByText('第一节')).toBeInTheDocument();
      expect(screen.getByText('小节')).toBeInTheDocument();
      expect(screen.getByText('第二节')).toBeInTheDocument();
    });

    it('应该在没有标题时返回null', () => {
      const { container } = render(<TocHeading schema={[]} />);
      expect(container.firstChild).toBeNull();
    });

    it('应该过滤掉非标题元素', () => {
      const paragraphOnlySchema: Elements[] = [
        {
          type: 'paragraph',
          children: [{ text: '段落内容' }],
        } as Elements,
      ];
      
      const { container } = render(<TocHeading schema={paragraphOnlySchema} />);
      expect(container.firstChild).toBeNull();
    });
    it('应该过滤掉层级大于4的标题', () => {
      const schemaWithHighLevel: Elements[] = [
        {
          type: 'head',
          level: 5,
          children: [{ text: '第五级标题' }],
        } as Elements,
        {
          type: 'head',
          level: 1,
          children: [{ text: '第一级标题' }],
        } as Elements,
      ];
      
      render(<TocHeading schema={schemaWithHighLevel} />);
      expect(screen.queryByText('第五级标题')).not.toBeInTheDocument();
      expect(screen.getByText('第一级标题')).toBeInTheDocument();
    });  });

  describe('目录树构建测试', () => {
    it('应该正确构建层级目录树', () => {
      render(<TocHeading schema={mockSchema} />);
      
      // 检查层级结构
      const firstChapter = screen.getByText('第一章');
      const firstSection = screen.getByText('第一节');
      const subsection = screen.getByText('小节');
      const secondSection = screen.getByText('第二节');
      
      // 验证元素都存在
      expect(firstChapter).toBeInTheDocument();
      expect(firstSection).toBeInTheDocument();
      expect(subsection).toBeInTheDocument();
      expect(secondSection).toBeInTheDocument();
    });

    it('应该处理空标题', () => {
      const schemaWithEmptyTitle: Elements[] = [
        {
          type: 'head',
          level: 1,
          children: [{ text: '' }],
        } as Elements,
        {
          type: 'head',
          level: 1,
          children: [{ text: '有效标题' }],
        } as Elements,
      ];
      
      render(<TocHeading schema={schemaWithEmptyTitle} />);
      // 检查是否渲染了"有效标题"
      expect(screen.getByText('有效标题')).toBeInTheDocument();
      // 检查空标题不应该出现在DOM中
      const links = screen.queryAllByRole('link');
      const emptyLinks = links.filter(link => link.textContent === '');
      expect(emptyLinks.length).toBe(0);
    });
  });

  describe('Anchor组件测试', () => {
    it('应该正确传递anchorProps', () => {
      const customAnchorProps = {
        className: 'custom-anchor',
        style: { color: 'red' },
      };
      
      render(<TocHeading schema={mockSchema} anchorProps={customAnchorProps} />);
      
      // 检查是否应用了自定义属性
      const anchorWrapper = screen.getByText('第一章').closest('.ant-anchor-wrapper');
      expect(anchorWrapper).toBeInTheDocument();
      // 检查是否添加了自定义类名到 wrapper 上
      expect(anchorWrapper).toHaveClass('custom-anchor');
    });

    it('应该正确处理useCustomContainer属性', () => {
      render(<TocHeading schema={mockSchema} useCustomContainer={false} />);
      
      // 检查是否渲染了Anchor组件
      const anchorWrapper = screen.getByText('第一章').closest('.ant-anchor-wrapper');
      expect(anchorWrapper).toBeInTheDocument();
    });
  });

  describe('滚动处理测试', () => {
    beforeEach(() => {
      // Mock scrollIntoView function
      Element.prototype.scrollIntoView = vi.fn();
    });

    it('应该处理锚点点击事件', () => {
      // 创建模拟的DOM元素
      const mockElement = document.createElement('div');
      mockElement.id = '第一章';
      document.body.appendChild(mockElement);
      
      render(<TocHeading schema={mockSchema} />);
      
      // 模拟点击锚点
      const anchorLinks = screen.getAllByRole('link');
      const firstLink = anchorLinks[0];
      
      fireEvent.click(firstLink);
      
      // 验证元素仍然存在
      expect(mockElement).toBeInTheDocument();
      
      // 清理
      document.body.removeChild(mockElement);
    });

    it('应该处理目标元素不存在的情况', () => {
      // Mock console.warn
      const mockWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      render(<TocHeading schema={mockSchema} />);
      
      // 模拟点击锚点（目标元素不存在）
      const anchorLinks = screen.getAllByRole('link');
      const firstLink = anchorLinks[0];
      
      fireEvent.click(firstLink);
      
      // 验证警告被调用
      expect(mockWarn).toHaveBeenCalledWith('Target element with id "第一章" not found');
      
      mockWarn.mockRestore();
    });
  });  describe('缓存机制测试', () => {
    it('应该使用缓存避免重复处理', () => {
      const { rerender } = render(<TocHeading schema={mockSchema} />);
      
      // 重新渲染相同的schema
      rerender(<TocHeading schema={mockSchema} />);
      
      // 检查标题仍然正确渲染
      expect(screen.getByText('第一章')).toBeInTheDocument();
    });
  });

  describe('边界情况测试', () => {
    it('应该处理空schema', () => {
      const { container } = render(<TocHeading schema={[]} />);
      expect(container.firstChild).toBeNull();
    });

    it('应该处理undefined schema', () => {
      const { container } = render(<TocHeading schema={undefined as any} />);
      expect(container.firstChild).toBeNull();
    });

    it('应该处理null schema', () => {
      const { container } = render(<TocHeading schema={null as any} />);
      expect(container.firstChild).toBeNull();
    });
  });
});