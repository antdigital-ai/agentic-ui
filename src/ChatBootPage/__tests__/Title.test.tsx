import { render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it } from 'vitest';
import Title from '../Title';

describe('Title 组件', () => {
  it('应该渲染基本的标题', () => {
    render(<Title title="主标题" />);

    expect(screen.getByText('主标题')).toBeInTheDocument();
  });

  it('应该渲染副标题', () => {
    render(<Title subtitle="副标题" />);

    expect(screen.getByText('副标题')).toBeInTheDocument();
  });

  it('应该同时渲染主标题和副标题', () => {
    render(<Title title="主标题" subtitle="副标题" />);

    expect(screen.getByText('主标题')).toBeInTheDocument();
    expect(screen.getByText('副标题')).toBeInTheDocument();
  });

  it('应该在没有标题和副标题时返回 null', () => {
    const { container } = render(<Title />);

    expect(container.firstChild).toBeNull();
  });

  it('应该支持自定义样式', () => {
    const customStyle = { backgroundColor: 'rgb(255, 0, 0)' };

    const { container } = render(
      <Title title="样式测试" style={customStyle} />,
    );

    const titleElement = container.querySelector('.ant-agentic-chatboot-title');
    expect(titleElement).toHaveStyle('background-color: rgb(255, 0, 0)');
  });

  it('应该支持自定义类名', () => {
    const { container } = render(
      <Title title="类名测试" className="custom-class" />,
    );

    const titleElement = container.querySelector('.ant-agentic-chatboot-title');
    expect(titleElement).toHaveClass('custom-class');
  });

  it('应该支持自定义前缀类名', () => {
    const { container } = render(
      <Title title="前缀测试" prefixCls="custom-prefix" />,
    );

    const titleElement = container.querySelector('.custom-prefix');
    expect(titleElement).toBeInTheDocument();
  });

  it('应该为标题添加正确的样式类', () => {
    const { container } = render(<Title title="主标题" subtitle="副标题" />);

    const mainTitle = container.querySelector('.ant-agentic-chatboot-title-main');
    const subtitle = container.querySelector('.ant-agentic-chatboot-title-subtitle');

    expect(mainTitle).toBeInTheDocument();
    expect(subtitle).toBeInTheDocument();
  });

  it('应该正确处理复杂的标题内容', () => {
    const complexTitle = (
      <div>
        <span>标题</span>
        <span>部分</span>
      </div>
    );

    render(<Title title={complexTitle} />);

    expect(screen.getByText('标题')).toBeInTheDocument();
    expect(screen.getByText('部分')).toBeInTheDocument();
  });

  it('应该正确处理复杂的副标题内容', () => {
    const complexSubtitle = (
      <div>
        <span>副标题</span>
        <span>部分</span>
      </div>
    );

    render(<Title subtitle={complexSubtitle} />);

    expect(screen.getByText('副标题')).toBeInTheDocument();
    expect(screen.getByText('部分')).toBeInTheDocument();
  });

  it('应该只渲染有内容的标题', () => {
    const { container } = render(<Title subtitle="只有副标题" />);

    const mainTitle = container.querySelector('.ant-agentic-chatboot-title-main');
    expect(mainTitle).not.toBeInTheDocument();
  });

  it('应该只渲染有内容的副标题', () => {
    const { container } = render(<Title title="只有主标题" />);

    const subtitle = container.querySelector('.ant-agentic-chatboot-title-subtitle');
    expect(subtitle).not.toBeInTheDocument();
  });

  it('应该正确处理空字符串标题', () => {
    const { container } = render(<Title title="" />);

    expect(container.firstChild).toBeNull();
  });

  it('应该正确处理空字符串副标题', () => {
    const { container } = render(<Title subtitle="" />);

    expect(container.firstChild).toBeNull();
  });

  it('应该正确处理 null 标题', () => {
    const { container } = render(<Title title={null} />);

    expect(container.firstChild).toBeNull();
  });

  it('应该正确处理 null 副标题', () => {
    const { container } = render(<Title subtitle={null} />);

    expect(container.firstChild).toBeNull();
  });

  it('应该正确处理 undefined 标题', () => {
    const { container } = render(<Title title={undefined} />);

    expect(container.firstChild).toBeNull();
  });

  it('应该正确处理 undefined 副标题', () => {
    const { container } = render(<Title subtitle={undefined} />);

    expect(container.firstChild).toBeNull();
  });

  it('应该正确处理数字标题', () => {
    render(<Title title={123} />);

    expect(screen.getByText('123')).toBeInTheDocument();
  });

  it('应该正确处理数字副标题', () => {
    render(<Title subtitle={456} />);

    expect(screen.getByText('456')).toBeInTheDocument();
  });

  it('应该在 ConfigProvider 中正确工作', () => {
    render(
      <ConfigProvider prefixCls="custom">
        <Title title="配置提供者测试" />
      </ConfigProvider>,
    );

    expect(screen.getByText('配置提供者测试')).toBeInTheDocument();
  });

  it('应该支持所有属性的组合', () => {
    const customStyle = { backgroundColor: 'rgb(0, 0, 255)' };
    const complexTitle = <div>复杂主标题</div>;
    const complexSubtitle = <div>复杂副标题</div>;

    const { container } = render(
      <Title
        title={complexTitle}
        subtitle={complexSubtitle}
        style={customStyle}
        className="custom-class"
        prefixCls="custom-prefix"
      />,
    );

    const titleElement = container.querySelector('.custom-prefix');
    expect(titleElement).toBeInTheDocument();
    expect(titleElement).toHaveClass('custom-class');
    expect(titleElement).toHaveStyle('background-color: rgb(0, 0, 255)');

    expect(screen.getByText('复杂主标题')).toBeInTheDocument();
    expect(screen.getByText('复杂副标题')).toBeInTheDocument();
  });

  it('应该正确处理默认值', () => {
    const { container } = render(<Title />);

    expect(container.firstChild).toBeNull();
  });

  it('应该正确处理布尔值标题', () => {
    render(<Title title={true} />);

    // React 不会渲染布尔值 true，所以组件应该返回 null
    expect(screen.queryByText('true')).not.toBeInTheDocument();
  });

  it('应该正确处理布尔值副标题', () => {
    render(<Title subtitle={false} />);

    // React 不会渲染布尔值 false，所以组件应该返回 null
    expect(screen.queryByText('false')).not.toBeInTheDocument();
  });

  it('应该正确处理数组标题', () => {
    render(<Title title={['标题1', '标题2']} />);

    // 数组会被连接在一起渲染
    expect(screen.getByText('标题1标题2')).toBeInTheDocument();
  });

  it('应该正确处理数组副标题', () => {
    render(<Title subtitle={['副标题1', '副标题2']} />);

    // 数组会被连接在一起渲染
    expect(screen.getByText('副标题1副标题2')).toBeInTheDocument();
  });
});
