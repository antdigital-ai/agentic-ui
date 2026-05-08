import { fireEvent, render } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Quote } from '../index';

// 在ConfigProvider中包装组件来提供完整的样式上下文
const renderWithProvider = (ui: React.ReactElement) => {
  return render(<ConfigProvider prefixCls="ant">{ui}</ConfigProvider>);
};

describe('Quote 组件', () => {
  it('应该正确渲染基本内容', () => {
    const { getByText, queryByText } = renderWithProvider(
      <Quote fileName="test.ts" quoteDescription="测试内容" />,
    );

    // 主视图中只显示quoteDescription，不显示fileName
    expect(getByText('测试内容')).toBeInTheDocument();

    // 文件名不在主视图中显示（无 popupDetail 时不渲染 popup）
    expect(queryByText('test.ts')).not.toBeInTheDocument();
  });

  it('应该在有popupDetail时显示弹出层文件信息', () => {
    const { container, getByText } = renderWithProvider(
      <Quote
        fileName="example.ts"
        lineRange="10-20"
        quoteDescription="示例内容"
        popupDetail="详细信息"
      />,
    );

    // 主视图中显示quoteDescription
    expect(getByText('示例内容')).toBeInTheDocument();

    // 弹出层中应该显示文件名和行号
    const popup = container.querySelector('[data-testid="quote-popup"]');
    expect(popup).toBeInTheDocument();
    expect(popup).toHaveTextContent('example.ts');
    expect(popup).toHaveTextContent('(10-20)');
  });

  it('应该在closable为true时显示关闭按钮', () => {
    const handleClose = vi.fn();
    const { container } = renderWithProvider(
      <Quote
        fileName="test.ts"
        quoteDescription="测试内容"
        closable={true}
        onClose={handleClose}
      />,
    );

    const closeButton = container.querySelector(
      '[data-testid="quote-close-button"]',
    );
    expect(closeButton).toBeInTheDocument();

    fireEvent.click(closeButton!);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('应该在hover时显示详情弹框', () => {
    const { container } = renderWithProvider(
      <Quote
        fileName="test.ts"
        quoteDescription="测试内容"
        popupDetail="详细信息"
      />,
    );

    // 弹框应该存在但默认隐藏
    const popup = container.querySelector('[data-testid="quote-popup"]');
    expect(popup).toBeInTheDocument();

    // hover容器后通过CSS控制显示，这里验证弹框内容存在
    expect(popup).toHaveTextContent('详细信息');
  });

  it('应该在点击弹框header时触发onFileClick', () => {
    const handleFileClick = vi.fn();
    const { container } = renderWithProvider(
      <Quote
        fileName="test.ts"
        lineRange="1-5"
        quoteDescription="测试内容"
        popupDetail="详细信息"
        onFileClick={handleFileClick}
      />,
    );

    // 点击弹出层的header
    const popupHeader = container.querySelector(
      '[data-testid="quote-popup-header"]',
    );
    expect(popupHeader).toBeInTheDocument();

    fireEvent.click(popupHeader!);
    expect(handleFileClick).toHaveBeenCalledWith('test.ts', '1-5');
  });

  it('应该在点击弹框标题时触发onFileClick', () => {
    const handleFileClick = vi.fn();
    const { container } = renderWithProvider(
      <Quote
        fileName="example.ts"
        quoteDescription="测试内容"
        popupDetail="详细信息"
        onFileClick={handleFileClick}
      />,
    );

    const popupHeader = container.querySelector(
      '[data-testid="quote-popup-header"]',
    );
    expect(popupHeader).toBeInTheDocument();

    fireEvent.click(popupHeader!);
    expect(handleFileClick).toHaveBeenCalledWith('example.ts', undefined);
  });

  it('应该支持自定义样式', () => {
    const customStyle = { backgroundColor: 'red' };
    const { container } = renderWithProvider(
      <Quote
        fileName="test.ts"
        quoteDescription="测试内容"
        style={customStyle}
      />,
    );

    const quoteContainer = container.querySelector(
      '[data-testid="quote-container"]',
    );
    expect(quoteContainer).toHaveStyle({ backgroundColor: 'red' });
  });

  it('应该支持不传文件名', () => {
    const { getByText } = renderWithProvider(
      <Quote quoteDescription="无文件来源的内容" />,
    );

    expect(getByText('无文件来源的内容')).toBeInTheDocument();
  });

  it('应该支持只有fileName没有popupDetail的情况', () => {
    const { getByText, container } = renderWithProvider(
      <Quote fileName="test.ts" quoteDescription="测试内容" />,
    );

    // 主视图显示quoteDescription
    expect(getByText('测试内容')).toBeInTheDocument();

    // 没有popupDetail时不应该有弹出层
    const popup = container.querySelector('.quote-popup');
    expect(popup).not.toBeInTheDocument();
  });

  it('应该正确处理没有onFileClick时的弹框点击', () => {
    const { container } = renderWithProvider(
      <Quote
        fileName="test.ts"
        quoteDescription="测试内容"
        popupDetail="详细信息"
      />,
    );

    const popupHeader = container.querySelector(
      '[data-testid="quote-popup-header"]',
    );
    expect(popupHeader).toBeInTheDocument();

    // 应该不会抛出错误
    expect(() => {
      fireEvent.click(popupHeader!);
    }).not.toThrow();
  });
});
