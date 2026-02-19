import { fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import CaseReply from '../../src/ChatBootPage/CaseReply';

describe('CaseReply 组件', () => {
  const TestButton = () => <button data-testid="test-button">测试按钮</button>;

  it('应该渲染基本的案例回复组件', () => {
    render(
      <CaseReply
        quote="这是一个测试引用"
        title="测试标题"
        description="测试描述"
      />,
    );

    expect(screen.getByText('这是一个测试引用')).toBeInTheDocument();
    expect(screen.getByText('测试标题')).toBeInTheDocument();
    expect(screen.getByText('测试描述')).toBeInTheDocument();
  });

  it('应该处理点击事件', () => {
    const handleClick = vi.fn();

    render(
      <CaseReply
        quote="点击测试"
        title="标题"
        description="描述"
        onClick={handleClick}
      />,
    );

    const container = screen.getByText('点击测试').closest('div');
    fireEvent.click(container!);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('应该在使用 buttonText 时点击按钮触发 onButtonClick', () => {
    const onButtonClick = vi.fn();
    render(
      <CaseReply
        quote="引用"
        title="标题"
        description="描述"
        buttonText="确定"
        onButtonClick={onButtonClick}
      />,
    );
    fireEvent.mouseEnter(screen.getByText('引用').closest('div')!);
    const btn = screen.getByText('确定').closest('button');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn!);
    expect(onButtonClick).toHaveBeenCalledTimes(1);
    expect(onButtonClick).toHaveBeenCalledWith(expect.any(Object));
  });

  it('应该处理鼠标悬停事件', () => {
    render(
      <CaseReply
        quote="悬停测试"
        title="标题"
        description="描述"
        buttonBar={<TestButton />}
      />,
    );

    const container = screen.getByText('悬停测试').closest('div');

    // 初始状态按钮应该不可见
    const button = screen.getByTestId('test-button');
    const buttonBar = button.closest('div');
    expect(buttonBar).toHaveClass('ant-agentic-chatboot-case-reply-button-bar');

    // 悬停后按钮应该可见
    fireEvent.mouseEnter(container!);
    expect(buttonBar).toHaveClass('ant-agentic-chatboot-case-reply-button-bar-visible');

    // 离开悬停后按钮应该不可见
    fireEvent.mouseLeave(container!);
    expect(buttonBar).not.toHaveClass(
      'ant-agentic-chatboot-case-reply-button-bar-visible',
    );
  });

  it('应该支持自定义背景色', () => {
    const { container } = render(
      <CaseReply quote="背景色测试" coverBackground="rgba(255, 0, 0, 0.5)" />,
    );

    const coverElement = container.querySelector(
      '.ant-agentic-chatboot-case-reply-cover',
    );
    expect(coverElement).toHaveStyle('background: rgba(255, 0, 0, 0.5)');
  });

  it('应该支持自定义引用图标颜色', () => {
    const { container } = render(
      <CaseReply quote="图标颜色测试" quoteIconColor="rgb(0, 255, 0)" />,
    );

    const svgElement = container.querySelector('svg path');
    expect(svgElement).toHaveAttribute('fill', 'rgb(0, 255, 0)');
  });

  it('应该支持自定义样式', () => {
    const customStyle = { backgroundColor: 'rgb(255, 0, 0)' };

    const { container } = render(
      <CaseReply quote="样式测试" style={customStyle} />,
    );

    const mainElement = container.querySelector('.ant-agentic-chatboot-case-reply');
    expect(mainElement).toHaveStyle('background-color: rgb(255, 0, 0)');
  });

  it('应该支持自定义类名', () => {
    const { container } = render(
      <CaseReply quote="类名测试" className="custom-class" />,
    );

    const mainElement = container.querySelector('.ant-agentic-chatboot-case-reply');
    expect(mainElement).toHaveClass('custom-class');
  });

  it('应该支持自定义前缀类名', () => {
    const { container } = render(
      <CaseReply quote="前缀测试" prefixCls="custom-prefix" />,
    );

    const mainElement = container.querySelector('.custom-prefix');
    expect(mainElement).toBeInTheDocument();
  });

  it('应该只渲染有内容的引用', () => {
    const { container } = render(
      <CaseReply title="只有标题" description="只有描述" />,
    );

    const quoteText = container.querySelector(
      '.ant-agentic-chatboot-case-reply-quote-text',
    );
    expect(quoteText).not.toBeInTheDocument();
  });

  it('应该只渲染有内容的标题', () => {
    const { container } = render(
      <CaseReply quote="只有引用" description="只有描述" />,
    );

    const titleElement = container.querySelector(
      '.ant-agentic-chatboot-case-reply-title',
    );
    expect(titleElement).not.toBeInTheDocument();
  });

  it('应该只渲染有内容的描述', () => {
    const { container } = render(
      <CaseReply quote="只有引用" title="只有标题" />,
    );

    const descriptionElement = container.querySelector(
      '.ant-agentic-chatboot-case-reply-description',
    );
    expect(descriptionElement).not.toBeInTheDocument();
  });

  it('应该只渲染有内容的按钮栏', () => {
    const { container } = render(
      <CaseReply
        quote="只有引用"
        title="只有标题"
        description="只有描述"
        buttonText=""
      />,
    );

    const buttonBarElement = container.querySelector(
      '.ant-agentic-chatboot-case-reply-button-bar',
    );
    expect(buttonBarElement).not.toBeInTheDocument();
  });

  it('应该使用默认的背景色', () => {
    const { container } = render(<CaseReply quote="默认背景色" />);

    const coverElement = container.querySelector(
      '.ant-agentic-chatboot-case-reply-cover',
    );
    expect(coverElement).toHaveStyle('background: rgba(132, 220, 24, 0.15)');
  });

  it('应该使用默认的引用图标颜色', () => {
    const { container } = render(<CaseReply quote="默认图标颜色" />);

    const svgElement = container.querySelector('svg path');
    expect(svgElement).toHaveAttribute('fill', 'rgb(132, 220, 24)');
  });

  it('应该正确渲染 SVG 图标', () => {
    const { container } = render(<CaseReply quote="SVG 测试" />);

    const svgElement = container.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
    expect(svgElement).toHaveAttribute('width', '24');
    expect(svgElement).toHaveAttribute('height', '24');
  });

  it('应该正确处理复杂的引用内容', () => {
    const complexQuote = (
      <div>
        <strong>粗体文本</strong>
        <em>斜体文本</em>
      </div>
    );

    render(<CaseReply quote={complexQuote} title="复杂引用" />);

    expect(screen.getByText('粗体文本')).toBeInTheDocument();
    expect(screen.getByText('斜体文本')).toBeInTheDocument();
  });

  it('应该正确处理复杂的标题内容', () => {
    const complexTitle = (
      <div>
        <span>标题</span>
        <span>副标题</span>
      </div>
    );

    render(<CaseReply quote="简单引用" title={complexTitle} />);

    expect(screen.getByText('标题')).toBeInTheDocument();
    expect(screen.getByText('副标题')).toBeInTheDocument();
  });

  it('应该正确处理复杂的描述内容', () => {
    const complexDescription = (
      <div>
        <span>描述1</span>
        <span>描述2</span>
      </div>
    );

    render(
      <CaseReply
        quote="简单引用"
        title="简单标题"
        description={complexDescription}
      />,
    );

    expect(screen.getByText('描述1')).toBeInTheDocument();
    expect(screen.getByText('描述2')).toBeInTheDocument();
  });

  it('应该正确处理复杂的按钮栏内容', () => {
    const complexButtonBar = (
      <div>
        <button>按钮1</button>
        <button>按钮2</button>
      </div>
    );

    render(
      <CaseReply
        quote="简单引用"
        title="简单标题"
        description="简单描述"
        buttonBar={complexButtonBar}
      />,
    );

    expect(screen.getByText('按钮1')).toBeInTheDocument();
    expect(screen.getByText('按钮2')).toBeInTheDocument();
  });

  it('应该在 ConfigProvider 中正确工作', () => {
    render(
      <ConfigProvider prefixCls="custom">
        <CaseReply quote="配置提供者测试" />
      </ConfigProvider>,
    );

    // 检查组件是否正确渲染
    expect(screen.getByText('配置提供者测试')).toBeInTheDocument();
  });

  it('应该支持所有属性的组合', () => {
    const handleClick = vi.fn();
    const customStyle = { backgroundColor: 'rgb(0, 0, 255)' };

    const { container } = render(
      <CaseReply
        coverBackground="rgba(255, 255, 0, 0.3)"
        quoteIconColor="rgb(255, 0, 255)"
        quote="完整功能测试"
        title="完整标题"
        description="完整描述"
        buttonBar={<TestButton />}
        onClick={handleClick}
        style={customStyle}
        className="custom-class"
        prefixCls="custom-prefix"
      />,
    );

    const mainElement = container.querySelector('.custom-prefix');
    expect(mainElement).toBeInTheDocument();
    expect(mainElement).toHaveClass('custom-class');
    expect(mainElement).toHaveStyle('background-color: rgb(0, 0, 255)');

    expect(screen.getByText('完整功能测试')).toBeInTheDocument();
    expect(screen.getByText('完整标题')).toBeInTheDocument();
    expect(screen.getByText('完整描述')).toBeInTheDocument();
    expect(screen.getByTestId('test-button')).toBeInTheDocument();
  });

  it('应该正确处理默认值', () => {
    const { container } = render(<CaseReply />);

    const mainElement = container.querySelector('.ant-agentic-chatboot-case-reply');
    expect(mainElement).toBeInTheDocument();
  });
});
