/**
 * Bubble 分发器残留：非 string content、placement/role、aiBubbleProps 兼容。
 */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Bubble } from '../Bubble';

vi.mock('../schema-editor', () => ({
  useSchemaEditorBridge: (_id: string, content: string) => ({ content }),
}));

vi.mock('../AIBubble', () => ({
  AIBubble: (props: any) => (
    <div data-testid="ai-bubble" data-placement={props.placement}>
      {String(props.originData?.content ?? '')}
      {props.fromAi ? 'from-ai' : ''}
    </div>
  ),
}));

vi.mock('../UserBubble', () => ({
  UserBubble: (props: any) => (
    <div data-testid="user-bubble" data-placement={props.placement}>
      {String(props.originData?.content ?? '')}
    </div>
  ),
}));

describe('Bubble residual branches', () => {
  it('role=user 走 UserBubble，默认 placement=right', () => {
    render(
      <Bubble
        originData={
          {
            id: '1',
            role: 'user',
            content: 'hi',
            createAt: 1,
            updateAt: 1,
          } as any
        }
      />,
    );
    expect(screen.getByTestId('user-bubble')).toHaveAttribute(
      'data-placement',
      'right',
    );
  });

  it('placement=right 覆盖角色判定为用户', () => {
    render(
      <Bubble
        placement="right"
        originData={
          {
            id: '2',
            role: 'assistant',
            content: 'x',
            createAt: 1,
            updateAt: 1,
          } as any
        }
      />,
    );
    expect(screen.getByTestId('user-bubble')).toBeInTheDocument();
  });

  it('非 string content 传空串给 bridge，仍渲染 AIBubble', () => {
    render(
      <Bubble
        originData={
          {
            id: '3',
            role: 'assistant',
            content: { nested: true } as any,
            createAt: 1,
            updateAt: 1,
          } as any
        }
      />,
    );
    expect(screen.getByTestId('ai-bubble')).toBeInTheDocument();
  });

  it('aiBubbleProps 优先于废弃 aIBubbleProps', () => {
    render(
      <Bubble
        originData={
          {
            id: '4',
            role: 'assistant',
            content: 'a',
            createAt: 1,
            updateAt: 1,
          } as any
        }
        aiBubbleProps={{ fromAi: true } as any}
        aIBubbleProps={{ fromAi: false } as any}
      />,
    );
    expect(screen.getByTestId('ai-bubble')).toHaveTextContent('from-ai');
  });

  it('仅 aIBubbleProps 时仍合并', () => {
    render(
      <Bubble
        originData={
          {
            id: '5',
            role: 'assistant',
            content: 'b',
            createAt: 1,
            updateAt: 1,
          } as any
        }
        aIBubbleProps={{ fromAi: true } as any}
      />,
    );
    expect(screen.getByTestId('ai-bubble')).toHaveTextContent('from-ai');
  });

  it('无 originData 仍可渲染 AI 路径', () => {
    render(<Bubble placement="left" />);
    expect(screen.getByTestId('ai-bubble')).toBeInTheDocument();
  });
});
