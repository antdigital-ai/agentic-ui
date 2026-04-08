import { fireEvent, render, screen } from '@testing-library/react';
import React, { useContext } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ConfigProvider } from 'antd';
import { UserBubble } from '../../src/Bubble/UserBubble';
import { BubbleConfigContext } from '../../src/Bubble/BubbleConfigProvide';
import { MessagesContext } from '../../src/Bubble/MessagesContent/BubbleContext';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

const Wrap: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ConfigProvider>
    <BubbleConfigContext.Provider
      value={{ standalone: false, compact: false, locale: {} as any }}
    >
      {children}
    </BubbleConfigContext.Provider>
  </ConfigProvider>
);

describe('UserBubble', () => {
  const defaultProps = {
    placement: 'right' as const,
    avatar: { name: 'User', avatar: 'user.jpg' },
    time: 1716537600000,
    originData: {
      content: 'User message',
      createAt: 1716537600000,
      id: 'u1',
      role: 'user' as const,
      updateAt: 1716537600000,
    },
  };

  it('returns null when bubbleRenderConfig.render is false', () => {
    render(
      <Wrap>
        <UserBubble
          {...defaultProps}
          bubbleRenderConfig={{ render: false }}
        />
      </Wrap>,
    );
    expect(screen.queryByText('User message')).not.toBeInTheDocument();
  });

  it('renders extra when extraRender is not false', () => {
    render(
      <Wrap>
        <UserBubble {...defaultProps} />
      </Wrap>,
    );
    expect(screen.getByText('User message')).toBeInTheDocument();
    expect(screen.getByTestId('chat-message')).toBeInTheDocument();
  });

  it('calls bubbleRef.current.setMessageItem when setMessage from context is invoked', () => {
    const setMessageItem = vi.fn();
    const mockBubbleRef = { current: { setMessageItem } };

    const Trigger = () => {
      const { setMessage } = useContext(MessagesContext);
      return (
        <button
          data-testid="trigger-set-message"
          onClick={() => setMessage?.({ content: 'updated' })}
        >
          Update
        </button>
      );
    };

    const renderFn = (_props: any, slots: any) => (
      <>
        <Trigger />
        {slots?.messageContent}
      </>
    );

    render(
      <Wrap>
        <UserBubble
          {...defaultProps}
          id="user-1"
          bubbleRef={mockBubbleRef as any}
          bubbleRenderConfig={{ render: renderFn }}
        />
      </Wrap>,
    );

    fireEvent.click(screen.getByTestId('trigger-set-message'));
    expect(setMessageItem).toHaveBeenCalledWith('user-1', { content: 'updated' });
  });

  it('passes extra as null to render when extraRender is false', () => {
    const renderFn = vi.fn((_props: any, slots: any) => (
      <div data-testid="custom-user-render">{slots?.messageContent}</div>
    ));

    render(
      <Wrap>
        <UserBubble
          {...defaultProps}
          bubbleRenderConfig={{ render: renderFn, extraRender: false }}
        />
      </Wrap>,
    );

    expect(screen.getByTestId('custom-user-render')).toBeInTheDocument();
    expect(renderFn).toHaveBeenCalled();
    const slots = renderFn.mock.calls[0][1];
    expect(slots.extra).toBeNull();
  });
});
