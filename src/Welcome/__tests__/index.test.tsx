import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { WelcomeMessage } from '../../WelcomeMessage';

// Mock 动画组件
beforeAll(() => {
  vi.mock('../../components/TypingAnimation', () => ({
    TypingAnimation: ({ children, className, as: Component = 'div' }: any) => (
      React.createElement(Component, { className }, children)
    ),
  }));
  
  vi.mock('../../components/TextAnimate', () => ({
    TextAnimate: ({ children, className, as: Component = 'div' }: any) => (
      React.createElement(Component, { className }, children)
    ),
  }));
});

// 禁用动画以加快测试
const renderWelcomeMessage = (props: any) => {
  return render(
    <WelcomeMessage
      {...props}
      titleAnimateProps={{ 
        duration: 1, 
        typeSpeed: 1, 
        delay: 0,
        showCursor: false,
      }}
      descriptionAnimateProps={{ duration: 1, delay: 0 }}
    />,
  );
};

describe('WelcomeMessage 组件', () => {
  it('应该渲染基本的欢迎组件', () => {
    renderWelcomeMessage({ title: '欢迎使用' });
    expect(screen.getByText('欢迎使用')).toBeInTheDocument();
  });

  it('应该渲染标题和描述', () => {
    const { container } = renderWelcomeMessage({
      title: '欢迎使用',
      description: '这是一个测试描述',
    });

    expect(screen.getByText('欢迎使用')).toBeInTheDocument();
    const description = container.querySelector('.ant-agentic-welcome-description');
    expect(description).toBeInTheDocument();
  });

  it('应该只渲染标题当没有描述时', () => {
    const { container } = renderWelcomeMessage({ title: '只有标题' });

    expect(screen.getByText('只有标题')).toBeInTheDocument();
    const description = container.querySelector('.ant-agentic-welcome-description');
    expect(description).not.toBeInTheDocument();
  });

  it('应该只渲染描述当没有标题时', () => {
    const { container } = renderWelcomeMessage({ description: '只有描述' });

    const title = container.querySelector('.ant-agentic-welcome-title');
    expect(title).not.toBeInTheDocument();
    const description = container.querySelector('.ant-agentic-welcome-description');
    expect(description).toBeInTheDocument();
  });

  it('应该支持自定义样式类名', () => {
    const { container } = renderWelcomeMessage({
      title: '自定义类名',
      classNames: {
        title: 'custom-title-class',
        description: 'custom-description-class',
      },
    });

    const titleElement = container.querySelector('.custom-title-class');
    expect(titleElement).toBeInTheDocument();
  });

  it('应该支持自定义根节点样式类名', () => {
    const { container } = renderWelcomeMessage({
      title: '根节点类名',
      rootClassName: 'custom-root-class',
    });

    const rootElement = container.querySelector('.custom-root-class');
    expect(rootElement).toBeInTheDocument();
  });

  it('应该支持自定义样式', () => {
    const customStyle = { backgroundColor: 'red', color: 'white' };
    const { container } = renderWelcomeMessage({
      title: '自定义样式',
      style: customStyle,
    });

    const rootElement = container.querySelector('.ant-agentic-welcome');
    expect(rootElement).toHaveStyle('background-color: rgb(255, 0, 0)');
    expect(rootElement).toHaveStyle('color: rgb(255, 255, 255)');
  });

  it('应该支持 React 节点作为标题', () => {
    const titleNode = (
      <div>
        <span>React</span> <strong>节点</strong>
      </div>
    );

    renderWelcomeMessage({ title: titleNode });

    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('节点')).toBeInTheDocument();
  });

  it('应该支持 React 节点作为描述', () => {
    const descriptionNode = (
      <div>
        <em>斜体</em> 和 <code>代码</code>
      </div>
    );

    const { container } = renderWelcomeMessage({
      title: '标题',
      description: descriptionNode,
    });

    const description = container.querySelector('.ant-agentic-welcome-description');
    expect(description).toBeInTheDocument();
  });

  it('应该支持数字作为标题', () => {
    renderWelcomeMessage({ title: 123 });
    expect(screen.getByText('123')).toBeInTheDocument();
  });

  it('应该支持数字作为描述', () => {
    const { container } = renderWelcomeMessage({
      title: '标题',
      description: 456,
    });

    const description = container.querySelector('.ant-agentic-welcome-description');
    expect(description).toBeInTheDocument();
  });

  it('应该支持布尔值作为标题', () => {
    const { container } = renderWelcomeMessage({ title: true });

    // 布尔值 true 不会被渲染为文本
    const titleElement = container.querySelector('.ant-agentic-welcome-title');
    expect(titleElement).toBeInTheDocument();
    // Mock 后不会有光标
  });

  it('应该支持布尔值作为描述', () => {
    const { container } = renderWelcomeMessage({
      title: '标题',
      description: false,
    });

    // 布尔值 false 不会被渲染为文本
    const descriptionElement = container.querySelector(
      '.ant-agentic-welcome-description',
    );
    expect(descriptionElement).not.toBeInTheDocument();
  });

  it('应该支持数组作为标题', () => {
    const { container } = renderWelcomeMessage({ title: ['数组', '标题'] });

    const titleElement = container.querySelector('.ant-agentic-welcome-title');
    expect(titleElement).toBeInTheDocument();
    expect(titleElement?.textContent).toContain('数组');
    expect(titleElement?.textContent).toContain('标题');
  });

  it('应该支持数组作为描述', () => {
    const { container } = renderWelcomeMessage({
      title: '标题',
      description: ['数组', '描述'],
    });

    const description = container.querySelector('.ant-agentic-welcome-description');
    expect(description).toBeInTheDocument();
  });

  it('应该支持复杂的嵌套内容', () => {
    const complexTitle = (
      <div>
        <h1>主标题</h1>
        <p>副标题</p>
      </div>
    );

    renderWelcomeMessage({ title: complexTitle });

    expect(screen.getByText('主标题')).toBeInTheDocument();
    expect(screen.getByText('副标题')).toBeInTheDocument();
  });

  it('应该正确处理事件处理', () => {
    const handleClick = vi.fn();

    const { container } = renderWelcomeMessage({
      title: (
        <button data-testid="clickable-title" onClick={handleClick}>
          点击标题
        </button>
      ),
    });

    const clickableTitle = screen.getByTestId('clickable-title');
    expect(clickableTitle).toBeInTheDocument();

    fireEvent.click(clickableTitle);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('应该支持条件渲染', () => {
    const showTitle = true;
    const { container } = renderWelcomeMessage({
      title: showTitle ? '条件标题' : '',
    });

    expect(screen.getByText('条件标题')).toBeInTheDocument();
    const descriptionElement = container.querySelector(
      '.ant-agentic-welcome-description',
    );
    expect(descriptionElement).not.toBeInTheDocument();
  });
});
