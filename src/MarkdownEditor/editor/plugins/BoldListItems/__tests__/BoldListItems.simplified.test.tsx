import '@testing-library/jest-dom';
import { cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { BaseMarkdownEditor } from '@ant-design/agentic-ui/MarkdownEditor/BaseMarkdownEditor';

describe('BaseMarkdownEditor - Bold Text in Lists', () => {
  afterEach(() => {
    cleanup();
  });

  it('should handle the specific api.md example format', () => {
    // 用户在选择的内容中提到的具体格式：- **90%+** 得的利润
    const userExample = `- **90%+** 得的利润`;

    const { unmount } = render(
      <BaseMarkdownEditor
        initValue={userExample}
        readonly={true}
        width="100%"
        toc={false}
      />,
    );

    // 验证这个特定格式是否正确渲染
    const boldElement = screen.getByTestId('markdown-bold');
    expect(boldElement).toHaveTextContent('90%+');
    expect(screen.getByText('得的利润')).toBeInTheDocument();

    // 验证列表结构
    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.getByRole('listitem')).toBeInTheDocument();

    // 清理组件
    unmount();
  });

  it('should render multiple list items with bold text and percentage correctly', () => {
    const markdownContent = `- **90%+** 得的利润
- **高收益** 投资策略
- 获得 **95%** 的满意度`;

    const { unmount } = render(
      <BaseMarkdownEditor
        initValue={markdownContent}
        readonly={true}
        width="100%"
        toc={false}
      />,
    );

    // 检查粗体文本是否被正确标记
    const boldElements = screen.getAllByTestId('markdown-bold');
    expect(boldElements).toHaveLength(3); // 三个粗体部分：90%+、高收益、95%

    // 检查列表项是否存在
    expect(screen.getByText('得的利润')).toBeInTheDocument();
    expect(screen.getByText('投资策略')).toBeInTheDocument();
    expect(screen.getByText('的满意度')).toBeInTheDocument();

    // 清理组件
    unmount();
  });

  it('should handle percentage symbols with bold text in various formats', () => {
    const percentageFormats = `- **90%+** 利润增长
- **95%-100%** 的完成率
- 达到 **80%** 的效率
- **Top 10%** 的表现`;

    const { unmount } = render(
      <BaseMarkdownEditor
        initValue={percentageFormats}
        readonly={true}
        width="100%"
        toc={false}
      />,
    );

    const boldElements = screen.getAllByTestId('markdown-bold');
    expect(boldElements).toHaveLength(4);

    // 检查各种百分比格式的粗体文本
    expect(boldElements[0]).toHaveTextContent('90%+');
    expect(boldElements[1]).toHaveTextContent('95%-100%');
    expect(boldElements[2]).toHaveTextContent('80%');
    expect(boldElements[3]).toHaveTextContent('Top 10%');

    // 清理组件
    unmount();
  });

  it('should maintain proper DOM structure for bold text in lists', () => {
    const spacingExample = `- **重要**: 这是一个测试
- 结果: **90%+** 满意度
- **Performance** 指标良好`;

    const { container, unmount } = render(
      <BaseMarkdownEditor
        initValue={spacingExample}
        readonly={true}
        width="100%"
        toc={false}
      />,
    );

    // 检查容器中是否包含正确的结构
    expect(container.querySelector('[data-be="list"]')).toBeInTheDocument();

    // 检查粗体元素
    const boldElements = screen.getAllByTestId('markdown-bold');
    expect(boldElements).toHaveLength(3);

    // 验证文本内容
    expect(screen.getByText(': 这是一个测试')).toBeInTheDocument();
    expect(screen.getByText('满意度')).toBeInTheDocument();
    expect(screen.getByText('指标良好')).toBeInTheDocument();

    // 清理组件
    unmount();
  });

  it('should test readonly mode exactly as shown in api.md', () => {
    // 来自api.md文档中的确切示例
    const apiMarkdown = `# 只读模式 
- **90%+** 得的利润`;

    const { unmount } = render(
      <BaseMarkdownEditor
        initValue={apiMarkdown}
        readonly={true}
        width="100%"
        toc={false}
      />,
    );

    // 验证粗体部分
    const boldElement = screen.getByTestId('markdown-bold');
    expect(boldElement).toHaveTextContent('90%+');

    // 验证列表项内容
    expect(screen.getByText('得的利润')).toBeInTheDocument();

    // 清理组件
    unmount();
  });
});
