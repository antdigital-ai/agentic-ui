import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React, { memo, useContext } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AIBubble } from '../AIBubble';
import { Bubble } from '../Bubble';
import { BubbleConfigContext } from '../BubbleConfigProvide';
import { MessagesContext } from '../MessagesContent/BubbleContext';
import type { BubbleProps, MessageBubbleData } from '../type';
import { UserBubble } from '../UserBubble';

const { displayRender } = vi.hoisted(() => ({ displayRender: vi.fn() }));

vi.mock('../schema-editor/useSchemaEditorBridge', () => ({
  useSchemaEditorBridge: (_id: string, content: string) => ({ content }),
}));
vi.mock('../style', () => ({ useStyle: () => ({ hashId: '' }) }));
vi.mock('../MessagesContent', () => ({
  LOADING_FLAT: 'LOADING',
  BubbleMessageDisplay: memo(({ content }: { content: React.ReactNode }) => {
    const context = useContext(BubbleConfigContext);
    displayRender();
    return (
      <span data-testid="body" data-session={context?.sessionId}>
        {content}
      </span>
    );
  }),
}));

const message: MessageBubbleData = {
  id: 'message-1',
  role: 'assistant',
  content: 'hello',
  createAt: 1,
  updateAt: 1,
};

describe('unified Bubble rendering', () => {
  beforeEach(() => displayRender.mockClear());

  it.each([AIBubble, UserBubble])(
    'skips equivalent inline styles through the direct component entry',
    (Component) => {
      const { rerender } = render(
        <Component
          originData={message}
          styles={{ bubbleListItemContentStyle: { color: 'red' } }}
        />,
      );
      displayRender.mockClear();
      rerender(
        <Component
          originData={message}
          styles={{ bubbleListItemContentStyle: { color: 'red' } }}
        />,
      );
      expect(displayRender).not.toHaveBeenCalled();
    },
  );

  it('preserves the pure styling option for user messages', () => {
    const { container } = render(
      <Bubble pure originData={{ ...message, role: 'user' }} />,
    );
    expect(
      container.querySelector('.ant-agentic-bubble-content-pure'),
    ).not.toBeNull();
  });

  it('updates custom message fields consumed by a stable render callback', () => {
    const config: BubbleProps['bubbleRenderConfig'] = {
      contentRender: (props) => <span>{props.originData?.model}</span>,
    };
    const { rerender } = render(
      <Bubble
        originData={{ ...message, model: 'model-a' }}
        bubbleRenderConfig={config}
      />,
    );
    rerender(
      <Bubble
        originData={{ ...message, model: 'model-b' }}
        bubbleRenderConfig={config}
      />,
    );
    expect(screen.getByText('model-b')).toBeInTheDocument();
  });

  it('updates a custom callback when the previous message content changes', () => {
    const config: BubbleProps['bubbleRenderConfig'] = {
      contentRender: (props) => <span>{props.preMessage?.content}</span>,
    };
    const previous = { ...message, id: 'previous' };
    const { rerender } = render(
      <Bubble
        originData={message}
        preMessage={previous}
        bubbleRenderConfig={config}
      />,
    );
    rerender(
      <Bubble
        originData={message}
        preMessage={{ ...previous, content: 'revised previous' }}
        bubbleRenderConfig={config}
      />,
    );
    expect(screen.getByText('revised previous')).toBeInTheDocument();
  });

  it('updates custom metadata consumed by a render callback', () => {
    const config: BubbleProps['bubbleRenderConfig'] = {
      contentRender: (props) => (
        <span>{String(props.originData?.meta?.metadata?.status)}</span>
      ),
    };
    const { rerender } = render(
      <Bubble
        originData={{ ...message, meta: { metadata: { status: 'queued' } } }}
        bubbleRenderConfig={config}
      />,
    );
    rerender(
      <Bubble
        originData={{ ...message, meta: { metadata: { status: 'sent' } } }}
        bubbleRenderConfig={config}
      />,
    );
    expect(screen.getByText('sent')).toBeInTheDocument();
  });

  it('skips a cloned message with equivalent metadata', () => {
    const { rerender } = render(
      <AIBubble
        originData={{ ...message, meta: { metadata: { status: 'sent' } } }}
      />,
    );
    displayRender.mockClear();
    rerender(
      <AIBubble
        originData={{ ...message, meta: { metadata: { status: 'sent' } } }}
      />,
    );
    expect(displayRender).not.toHaveBeenCalled();
  });

  it('updates a quote when using the memoized user component directly', () => {
    const { rerender } = render(
      <UserBubble
        originData={message}
        quote={{ quoteDescription: 'first quote' }}
      />,
    );
    rerender(
      <UserBubble
        originData={message}
        quote={{ quoteDescription: 'second quote' }}
      />,
    );
    expect(screen.getByText('second quote')).toBeInTheDocument();
  });

  it('keeps a single user content container with semantic styles', () => {
    const { container } = render(
      <UserBubble
        originData={message}
        style={{ marginBlock: 6 }}
        classNames={{ bubbleContainerClassName: 'custom-container' }}
      />,
    );
    const content = screen.getByTestId('chat-message');
    expect(
      container.querySelector('.ant-agentic-bubble-user')?.firstElementChild,
    ).toBe(content);
    expect(content).toHaveClass('custom-container');
    expect(content.style.marginBlock).toBe('6px');
    expect(content.style.alignItems).toBe('flex-end');
  });

  it('provides the user title and custom avatar through render slots', () => {
    render(
      <UserBubble
        originData={message}
        avatar={{ avatar: '/user.png' }}
        bubbleRenderConfig={{
          avatarRender: (_props, defaultDom) => (
            <span data-testid="custom-avatar">{defaultDom}</span>
          ),
          titleRender: () => <span>custom user title</span>,
          render: (_props, slots) => slots?.header,
        }}
      />,
    );
    expect(screen.getByText('custom user title')).toBeInTheDocument();
    expect(
      screen.getByTestId('custom-avatar').querySelector('img'),
    ).toHaveAttribute('src', '/user.png');
  });

  it('keeps feedback callbacks and imperative updates in the custom user extra slot', async () => {
    const onLike = vi.fn().mockResolvedValue(undefined);
    const setMessageItem = vi.fn();
    render(
      <UserBubble
        id="message-1"
        originData={message}
        onLike={onLike}
        bubbleRef={{ current: { setMessageItem } }}
        bubbleRenderConfig={{ render: (_props, slots) => slots?.extra }}
      />,
    );
    fireEvent.click(screen.getByTestId('like-button'));
    await waitFor(() =>
      expect(setMessageItem).toHaveBeenCalledWith('message-1', {
        feedback: 'thumbsUp',
      }),
    );
    expect(onLike).toHaveBeenCalledWith(message);
  });

  it.each([AIBubble, UserBubble])(
    'preserves parent configuration in the message subtree',
    (Component) => {
      render(
        <BubbleConfigContext.Provider
          value={{ standalone: false, sessionId: 'session-1' }}
        >
          <Component originData={message} />
        </BubbleConfigContext.Provider>,
      );
      expect(screen.getByTestId('body')).toHaveAttribute(
        'data-session',
        'session-1',
      );
    },
  );

  it('keeps the message configuration stable when only padding state changes', () => {
    const PaddingToggle = () => {
      const { setHidePadding } = useContext(MessagesContext);
      return (
        <button onClick={() => setHidePadding?.(true)}>Hide padding</button>
      );
    };
    const config: BubbleProps['bubbleRenderConfig'] = {
      contentBeforeRender: () => <PaddingToggle />,
    };
    render(<AIBubble originData={message} bubbleRenderConfig={config} />);
    displayRender.mockClear();
    fireEvent.click(screen.getByText('Hide padding'));
    expect(displayRender).not.toHaveBeenCalled();
  });
});
