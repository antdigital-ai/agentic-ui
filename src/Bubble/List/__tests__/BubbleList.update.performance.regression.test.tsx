import '@testing-library/jest-dom';
import { act, cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Bubble } from '../../Bubble';
import { BubbleConfigContext } from '../../BubbleConfigProvide';
import type { BubbleProps, MessageBubbleData } from '../../type';
import { BubbleListItem } from '../BubbleListItem';
import { BubbleList } from '../index';

const state = vi.hoisted(() => ({
  bubbles: [] as BubbleProps[],
  rows: 0,
}));

vi.mock('../../MessagesContent', () => ({ LOADING_FLAT: '...' }));
vi.mock('../style', () => ({ useStyle: () => ({ hashId: '' }) }));
vi.mock('../../Bubble', () => ({
  // Deliberately omit memo: the list should reuse the entire historical row.
  Bubble: (props: BubbleProps) => {
    state.bubbles.push(props);
    const context = React.useContext(BubbleConfigContext);
    return (
      <p data-testid={`message-${props.id}`}>
        {props.bubbleRenderConfig?.contentRender
          ? props.bubbleRenderConfig.contentRender(props, null)
          : props.originData?.content}
        {context?.extraShowOnHover ? 'hover' : ''}
      </p>
    );
  },
}));
vi.mock('../BubbleListItem', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../BubbleListItem')>();
  return {
    BubbleListItem: (
      props: React.ComponentProps<typeof actual.BubbleListItem>,
    ) => {
      state.rows += 1;
      return <actual.BubbleListItem {...props} />;
    },
  };
});

const makeMessages = (): MessageBubbleData[] =>
  Array.from({ length: 100 }, (_, index) => ({
    id: `${index}`,
    role: 'assistant',
    content: `Message ${index}`,
    isFinished: index < 99,
  }));

describe('BubbleList committed update hot path', () => {
  beforeEach(() => {
    state.bubbles = [];
    state.rows = 0;
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('builds and renders only one row for each streamed update among 100 messages', () => {
    const messages = makeMessages();
    const { rerender } = render(<BubbleList bubbleList={messages} />);
    expect(state.rows).toBe(100);
    const createElement = vi.spyOn(React, 'createElement');
    state.bubbles = [];
    state.rows = 0;

    for (let frame = 1; frame <= 6; frame += 1) {
      rerender(
        <BubbleList
          bubbleList={messages.map((message, index) =>
            index === 99 ? { ...message, content: `Token ${frame}` } : message,
          )}
        />,
      );
    }

    expect(state.rows).toBe(6);
    expect(state.bubbles.map((props) => props.id)).toEqual(Array(6).fill('99'));
    expect(
      createElement.mock.calls.filter(([type]) => type === Bubble),
    ).toHaveLength(6);
    expect(
      createElement.mock.calls.filter(([type]) => type === BubbleListItem),
    ).toHaveLength(6);
    expect(screen.getByText('Message 0')).toBeInTheDocument();
    expect(screen.getByText('Token 6')).toBeInTheDocument();
  });

  it('also reuses rows when a store copies all messages with equal fields', () => {
    const messages = makeMessages();
    const { rerender } = render(<BubbleList bubbleList={messages} />);
    state.bubbles = [];
    state.rows = 0;
    rerender(
      <BubbleList
        bubbleList={messages.map((message, index) => ({
          ...message,
          ...(index === 99 ? { content: 'Latest token' } : {}),
        }))}
      />,
    );
    expect(state.rows).toBe(1);
    expect(state.bubbles.map((props) => props.id)).toEqual(['99']);
  });

  it('appending updates only the former last row and the new message', () => {
    const messages = makeMessages();
    const { rerender } = render(<BubbleList bubbleList={messages} />);
    const first = screen.getByTestId('message-0');
    state.bubbles = [];
    state.rows = 0;
    rerender(
      <BubbleList
        bubbleList={[
          ...messages,
          { id: '100', role: 'assistant', content: 'Next message' },
        ]}
      />,
    );
    expect(state.rows).toBe(2);
    expect(state.bubbles.map((props) => props.id)).toEqual(['99', '100']);
    expect(state.bubbles[0].originData?.isLast).toBe(false);
    expect(state.bubbles[1].originData?.isLast).toBe(true);
    expect(screen.getByTestId('message-0')).toBe(first);
  });

  it('keeps index and total current for custom lazy placeholders', () => {
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
    const messages = makeMessages().slice(0, 2);
    const lazy = {
      enable: true,
      renderPlaceholder: ({
        elementInfo,
      }: {
        elementInfo?: { index: number; total: number };
      }) => <p>{`${elementInfo?.index}/${elementInfo?.total}`}</p>,
    };
    const { rerender } = render(
      <BubbleList bubbleList={messages} lazy={lazy} />,
    );
    expect(screen.getByText('0/2')).toBeInTheDocument();
    rerender(
      <BubbleList
        bubbleList={[...messages, { id: '2', role: 'assistant', content: '' }]}
        lazy={lazy}
      />,
    );
    expect(screen.getByText('0/3')).toBeInTheDocument();
    expect(screen.getByText('1/3')).toBeInTheDocument();
    expect(screen.getByText('2/3')).toBeInTheDocument();
    expect(state.bubbles).toHaveLength(0);
  });

  it('updates the modified message and the following preMessage consumer', () => {
    const messages = makeMessages();
    const contentRender = (props: BubbleProps) =>
      `${props.originData?.content}:${props.originData?.customStatus ?? ''}:${props.preMessage?.customStatus ?? ''}`;
    const config = { contentRender };
    const { rerender } = render(
      <BubbleList bubbleList={messages} bubbleRenderConfig={config} />,
    );
    state.bubbles = [];
    rerender(
      <BubbleList
        bubbleList={messages.map((message, index) =>
          index === 20 ? { ...message, customStatus: 'saved' } : message,
        )}
        bubbleRenderConfig={config}
      />,
    );
    expect(state.bubbles.map((props) => props.id)).toEqual(['20', '21']);
    expect(screen.getByTestId('message-20')).toHaveTextContent(
      'Message 20:saved:',
    );
    expect(screen.getByTestId('message-21')).toHaveTextContent(
      'Message 21::saved',
    );
  });

  it('compares shared options once while still applying updated callbacks and classes', () => {
    const messages = makeMessages();
    const firstRender = (props: BubbleProps) => props.originData?.content;
    const { rerender } = render(
      <BubbleList
        bubbleList={messages}
        bubbleRenderConfig={{ contentRender: firstRender }}
        styles={{ content: { color: 'red' } }}
        classNames={{ bubbleListItemClassName: 'first' }}
      />,
    );
    state.bubbles = [];
    state.rows = 0;
    rerender(
      <BubbleList
        bubbleList={[...messages]}
        bubbleRenderConfig={{ contentRender: firstRender }}
        styles={{ content: { color: 'red' } }}
        classNames={{ bubbleListItemClassName: 'first' }}
      />,
    );
    expect(state.rows).toBe(0);
    expect(state.bubbles).toHaveLength(0);

    rerender(
      <BubbleList
        bubbleList={messages}
        bubbleRenderConfig={{ contentRender: () => 'Updated callback' }}
        styles={{ content: { color: 'blue' } }}
        classNames={{ bubbleListItemClassName: 'second' }}
      />,
    );
    expect(state.rows).toBe(100);
    expect(screen.getAllByText('Updated callback')).toHaveLength(100);
    expect(screen.getByTestId('message-0').parentElement).toHaveClass('second');
    expect(state.bubbles[0].styles?.content).toEqual({ color: 'blue' });
  });

  it('keeps context consumers live even when their row elements are reused', () => {
    const messages = makeMessages();
    const { rerender } = render(
      <BubbleList bubbleList={messages} extraShowOnHover={false} />,
    );
    state.rows = 0;
    rerender(<BubbleList bubbleList={messages} extraShowOnHover />);
    expect(state.rows).toBe(0);
    expect(screen.getByTestId('message-0')).toHaveTextContent('Message 0hover');
  });

  it('does not publish row elements from an abandoned suspended update', () => {
    const messages = makeMessages();
    const pending = new Promise<void>(() => {});
    let update: React.Dispatch<
      React.SetStateAction<{
        messages: MessageBubbleData[];
        suspend: boolean;
      }>
    >;
    const Suspend = ({ active }: { active: boolean }) => {
      if (active) throw pending;
      return null;
    };
    const App = () => {
      const [value, setValue] = React.useState({ messages, suspend: false });
      update = setValue;
      return (
        <React.Suspense fallback={<p>Suspended</p>}>
          <BubbleList bubbleList={value.messages} />
          <Suspend active={value.suspend} />
        </React.Suspense>
      );
    };
    render(<App />);
    act(() => {
      React.startTransition(() =>
        update({
          messages: messages.map((message, index) =>
            index === 0 ? { ...message, content: 'Uncommitted' } : message,
          ),
          suspend: true,
        }),
      );
    });
    expect(screen.getByTestId('message-0')).toHaveTextContent('Message 0');
    state.bubbles = [];
    state.rows = 0;
    act(() =>
      update({
        messages: messages.map((message, index) =>
          index === 99 ? { ...message, content: 'Committed token' } : message,
        ),
        suspend: false,
      }),
    );
    expect(state.rows).toBe(1);
    expect(screen.getByTestId('message-0')).toHaveTextContent('Message 0');
    expect(screen.getByText('Committed token')).toBeInTheDocument();
    expect(screen.queryByText('Uncommitted')).not.toBeInTheDocument();
  });
});
