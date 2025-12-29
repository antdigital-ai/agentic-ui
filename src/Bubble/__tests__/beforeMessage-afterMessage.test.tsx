import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { Bubble } from '../@ant-design/agentic-ui/Bubble';
import { MessageBubbleData } from '../@ant-design/agentic-ui/Bubble/type';

describe('Bubble beforeMessageRender and afterMessageRender', () => {
  const mockMessageData: MessageBubbleData = {
    id: 'test-message-1',
    content: '这是一个测试消息',
    role: 'assistant',
    createAt: 1703123456789,
    updateAt: 1703123456789,
    isFinished: true,
  };

  it('应该渲染 beforeMessageRender 的内容', () => {
    const beforeMessageRender = () => (
      <div data-testid="before-message">消息前置内容</div>
    );

    render(
      <Bubble
        originData={mockMessageData}
        bubbleRenderConfig={{
          beforeMessageRender: beforeMessageRender,
        }}
      />,
    );

    expect(screen.getByTestId('before-message')).toBeInTheDocument();
    expect(screen.getByText('消息前置内容')).toBeInTheDocument();
  });

  it('应该渲染 afterMessageRender 的内容', () => {
    const afterMessageRender = () => (
      <div data-testid="after-message">消息后置内容</div>
    );

    render(
      <Bubble
        originData={mockMessageData}
        bubbleRenderConfig={{
          afterMessageRender: afterMessageRender,
        }}
      />,
    );

    expect(screen.getByTestId('after-message')).toBeInTheDocument();
    expect(screen.getByText('消息后置内容')).toBeInTheDocument();
  });

  it('应该同时渲染 beforeMessageRender 和 afterMessageRender 的内容', () => {
    const beforeMessageRender = () => (
      <div data-testid="before-message">消息前置内容</div>
    );

    const afterMessageRender = () => (
      <div data-testid="after-message">消息后置内容</div>
    );

    render(
      <Bubble
        originData={mockMessageData}
        bubbleRenderConfig={{
          beforeMessageRender: beforeMessageRender,
          afterMessageRender: afterMessageRender,
        }}
      />,
    );

    expect(screen.getByTestId('before-message')).toBeInTheDocument();
    expect(screen.getByTestId('after-message')).toBeInTheDocument();
    expect(screen.getByText('消息前置内容')).toBeInTheDocument();
    expect(screen.getByText('消息后置内容')).toBeInTheDocument();
  });

  it('当 beforeMessageRender 为 false 时，不应该渲染前置内容', () => {
    const afterMessageRender = () => (
      <div data-testid="after-message">消息后置内容</div>
    );

    render(
      <Bubble
        originData={mockMessageData}
        bubbleRenderConfig={{
          beforeMessageRender: false,
          afterMessageRender: afterMessageRender,
        }}
      />,
    );

    expect(screen.queryByTestId('before-message')).not.toBeInTheDocument();
    expect(screen.getByTestId('after-message')).toBeInTheDocument();
  });

  it('当 afterMessageRender 为 false 时，不应该渲染后置内容', () => {
    const beforeMessageRender = () => (
      <div data-testid="before-message">消息前置内容</div>
    );

    render(
      <Bubble
        originData={mockMessageData}
        bubbleRenderConfig={{
          beforeMessageRender: beforeMessageRender,
          afterMessageRender: false,
        }}
      />,
    );

    expect(screen.getByTestId('before-message')).toBeInTheDocument();
    expect(screen.queryByTestId('after-message')).not.toBeInTheDocument();
  });

  it('render 函数应该能访问到正确的 props', () => {
    const beforeMessageRender = (props: any) => {
      expect(props.originData).toEqual(mockMessageData);
      expect(props.originData.id).toBe('test-message-1');
      return <div data-testid="before-message">消息前置内容</div>;
    };

    const afterMessageRender = (props: any) => {
      expect(props.originData).toEqual(mockMessageData);
      expect(props.originData.role).toBe('assistant');
      return <div data-testid="after-message">消息后置内容</div>;
    };

    render(
      <Bubble
        originData={mockMessageData}
        bubbleRenderConfig={{
          beforeMessageRender: beforeMessageRender,
          afterMessageRender: afterMessageRender,
        }}
      />,
    );

    expect(screen.getByTestId('before-message')).toBeInTheDocument();
    expect(screen.getByTestId('after-message')).toBeInTheDocument();
  });

  it('应该在用户消息和 AI 消息中都生效', () => {
    const userMessageData: MessageBubbleData = {
      ...mockMessageData,
      role: 'user',
    };

    const beforeMessageRender = () => (
      <div data-testid="before-message">消息前置内容</div>
    );

    const afterMessageRender = () => (
      <div data-testid="after-message">消息后置内容</div>
    );

    // 测试 AI 消息
    const { rerender } = render(
      <Bubble
        originData={mockMessageData}
        placement="left"
        bubbleRenderConfig={{
          beforeMessageRender: beforeMessageRender,
          afterMessageRender: afterMessageRender,
        }}
      />,
    );

    expect(screen.getByTestId('before-message')).toBeInTheDocument();
    expect(screen.getByTestId('after-message')).toBeInTheDocument();

    // 测试用户消息
    rerender(
      <Bubble
        originData={userMessageData}
        placement="right"
        bubbleRenderConfig={{
          beforeMessageRender: beforeMessageRender,
          afterMessageRender: afterMessageRender,
        }}
      />,
    );

    expect(screen.getByTestId('before-message')).toBeInTheDocument();
    expect(screen.getByTestId('after-message')).toBeInTheDocument();
  });

  it('应该能正确处理复杂的渲染内容', () => {
    const beforeMessageRender = (props: any) => (
      <div data-testid="before-message">
        <span>创建时间: 2023-12-21 10:30:56</span>
        <span>角色: {props.originData?.role}</span>
      </div>
    );

    const afterMessageRender = (props: any) => (
      <div data-testid="after-message">
        <span>状态: {props.originData?.isFinished ? '已完成' : '生成中'}</span>
        <span>ID: {props.originData?.id}</span>
      </div>
    );

    render(
      <Bubble
        originData={mockMessageData}
        bubbleRenderConfig={{
          beforeMessageRender: beforeMessageRender,
          afterMessageRender: afterMessageRender,
        }}
      />,
    );

    expect(screen.getByTestId('before-message')).toBeInTheDocument();
    expect(screen.getByTestId('after-message')).toBeInTheDocument();
    expect(screen.getByText(/创建时间:/)).toBeInTheDocument();
    expect(screen.getByText(/状态: 已完成/)).toBeInTheDocument();
  });
});
