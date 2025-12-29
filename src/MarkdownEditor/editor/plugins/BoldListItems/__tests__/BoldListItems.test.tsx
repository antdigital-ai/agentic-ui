import '@testing-library/jest-dom';
import { cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { BaseMarkdownEditor } from '../../../../BaseMarkdownEditor';

describe('BaseMarkdownEditor - Bold Text in Lists', () => {
  afterEach(() => {
    cleanup();
  });

  it('should render list items with bold text and percentage correctly', () => {
    const markdownContent = `# 只读模式测试
- **90%+** 得的利润
- **高收益** 投资策略
- 获得 **95%** 的满意度`;

    const { unmount } = render(
      <BaseMarkdownEditor
        initValue={markdownContent}
        readonly={true}
        width="100%"
        height="300px"
      />,
    );

    // 检查标题是否正确渲染
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      '只读模式测试',
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

  it('should handle readonly mode with api.md example format', () => {
    // 这是来自 api.md 文档中的具体示例
    const apiExample = `# 只读模式 
- **90%+** 得的利润`;

    const { unmount } = render(
      <BaseMarkdownEditor
        initValue={apiExample}
        readonly={true}
        width="100%"
      />,
    );

    // 验证内容是否正确渲染
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      '只读模式',
    );
    expect(screen.getByText('得的利润')).toBeInTheDocument();

    // 验证粗体部分
    const boldElement = screen.getByTestId('markdown-bold');
    expect(boldElement).toHaveTextContent('90%+');

    // 清理组件
    unmount();
  });

  it('should handle mixed bold text formats in lists', () => {
    const complexMarkdown = `## 投资报告
- **90%+** 得的利润率增长
- 成功率达到 **95%**
- **ROI** 超过预期
- 使用 **AI-driven** 策略`;

    const { unmount } = render(
      <BaseMarkdownEditor
        initValue={complexMarkdown}
        readonly={true}
        width="100%"
      />,
    );

    // 检查所有粗体元素
    const boldElements = screen.getAllByTestId('markdown-bold');
    expect(boldElements).toHaveLength(4); // 90%+, 95%, ROI, AI-driven

    // 检查特定内容
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      '投资报告',
    );
    expect(screen.getByText('得的利润率增长')).toBeInTheDocument();
    expect(screen.getByText('成功率达到')).toBeInTheDocument();
    expect(screen.getByText('超过预期')).toBeInTheDocument();
    expect(screen.getByText('策略')).toBeInTheDocument();

    // 清理组件
    unmount();
  });

  it('should handle percentage symbols with bold text in various formats', () => {
    const percentageFormats = `# 百分比格式测试
- **90%+** 利润增长
- **95%-100%** 的完成率
- 达到 **80%** 的效率
- **Top 10%** 的表现`;

    const { unmount } = render(
      <BaseMarkdownEditor
        initValue={percentageFormats}
        readonly={true}
        width="100%"
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

  it('should maintain proper spacing and formatting in readonly mode', () => {
    const spacingExample = `# 格式测试
- **重要**: 这是一个测试
- 结果: **90%+** 满意度
- **Performance** 指标良好`;

    const { container, unmount } = render(
      <BaseMarkdownEditor
        initValue={spacingExample}
        readonly={true}
        width="100%"
      />,
    );

    // 检查容器中是否包含正确的结构
    expect(container.querySelector('[data-be="list"]')).toBeInTheDocument();

    // 检查粗体元素
    const boldElements = screen.getAllByTestId('markdown-bold');
    expect(boldElements).toHaveLength(3);

    // 验证文本内容
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      '格式测试',
    );
    expect(screen.getByText(': 这是一个测试')).toBeInTheDocument();
    expect(screen.getByText('满意度')).toBeInTheDocument();
    expect(screen.getByText('指标良好')).toBeInTheDocument();

    unmount();
  });
});
