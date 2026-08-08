/**
 * PureBubble 残留：无 avatar、extra、bubbleRenderConfig、standalone context。
 */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { BubbleConfigContext } from '../BubbleConfigProvide';
import { PureBubble } from '../PureBubble';

vi.mock('../../MarkdownEditor/BaseMarkdownEditor', () => ({
  BaseMarkdownEditor: ({ initValue }: any) => (
    <div data-testid="md">{String(initValue ?? '')}</div>
  ),
}));

vi.mock('../style', () => ({
  useStyle: () => ({ wrapSSR: (n: any) => n, hashId: 'h' }),
}));

vi.mock('../Avatar', () => ({
  BubbleAvatar: () => <div data-testid="avatar" />,
}));

vi.mock('../Title', () => ({
  BubbleTitle: ({ title }: any) => <div data-testid="title">{title}</div>,
}));

vi.mock('../MessagesContent/BubbleExtra', () => ({
  BubbleExtra: () => <div data-testid="extra" />,
}));

const origin = {
  id: '1',
  role: 'assistant' as const,
  content: 'hello bubble',
  createAt: 1,
  updateAt: 1,
  isFinished: true,
};

describe('PureBubble residual branches', () => {
  it('渲染内容；className/style/pure', () => {
    render(
      <ConfigProvider>
        <BubbleConfigContext.Provider
          value={{ compact: true, standalone: true } as any}
        >
          <PureBubble
            pure
            className="pb"
            style={{ padding: 4 }}
            originData={origin}
          />
        </BubbleConfigContext.Provider>
      </ConfigProvider>,
    );
    expect(screen.getByTestId('md')).toHaveTextContent('hello bubble');
  });

  it('bubbleRenderConfig.contentRender 自定义', () => {
    render(
      <ConfigProvider>
        <PureBubble
          originData={origin}
          bubbleRenderConfig={{
            contentRender: () => <div data-testid="custom-content">X</div>,
          }}
        />
      </ConfigProvider>,
    );
    expect(screen.getByTestId('custom-content')).toBeInTheDocument();
  });

  it('无 originData.content 空串', () => {
    render(
      <ConfigProvider>
        <PureBubble
          originData={{ ...origin, content: undefined as any }}
        />
      </ConfigProvider>,
    );
    expect(screen.getByTestId('md')).toBeInTheDocument();
  });

  it('placement 默认 left；非 string content → 空 initValue', () => {
    render(
      <ConfigProvider>
        <PureBubble
          originData={{ ...origin, content: { obj: true } as any }}
        />
      </ConfigProvider>,
    );
    expect(screen.getByTestId('md')).toHaveTextContent('');
  });

  it('placement=right 与 markdownRenderConfig initValue/readonly', () => {
    render(
      <ConfigProvider>
        <PureBubble
          placement="right"
          originData={origin}
          markdownRenderConfig={{ initValue: 'from-cfg', readonly: true }}
          readonly={undefined}
        />
      </ConfigProvider>,
    );
    expect(screen.getByTestId('md')).toHaveTextContent('from-cfg');
  });

  it('无 meta 时用 props.avatar；props.time 回退', () => {
    render(
      <ConfigProvider>
        <PureBubble
          time={42}
          avatar={{ title: 'A', name: 'N' }}
          originData={{ ...origin, meta: undefined, createAt: undefined as any }}
        />
      </ConfigProvider>,
    );
    expect(screen.getByTestId('title')).toBeInTheDocument();
  });

  it('bubbleRenderConfig.render=false 返回 null', () => {
    const { container } = render(
      <ConfigProvider>
        <PureBubble
          originData={origin}
          bubbleRenderConfig={{ render: false }}
        />
      </ConfigProvider>,
    );
    expect(container.firstChild).toBeNull();
  });

  it('无 context 时 compact/standalone 安全回退', () => {
    render(
      <ConfigProvider>
        <PureBubble originData={origin} />
      </ConfigProvider>,
    );
    expect(screen.getByTestId('md')).toHaveTextContent('hello bubble');
  });
});
