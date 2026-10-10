import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import { createPortal } from 'react-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AIBubble } from '../AIBubble';
import { Bubble } from '../Bubble';
import { BubbleTitle } from '../Title';
import type { BubbleProps, MessageBubbleData } from '../type';
import { UserBubble } from '../UserBubble';
import {
  normalizeBubbleClassNames,
  normalizeBubbleStyles,
} from '../utils/normalizeBubbleStyles';

const { display, thoughtChain, formatTime } = vi.hoisted(() => ({
  display: vi.fn(),
  thoughtChain: vi.fn(),
  formatTime: vi.fn(() => 'Formatted time'),
}));

vi.mock('../../Utils/formatTime', () => ({ formatTime }));
vi.mock('../schema-editor/useSchemaEditorBridge', () => ({
  useSchemaEditorBridge: (_id: string, content: string) => ({ content }),
}));
vi.mock('../MessagesContent', () => ({
  LOADING_FLAT: '...',
  BubbleMessageDisplay: (
    props: BubbleProps & { content?: React.ReactNode },
  ) => {
    display(props);
    return <span data-testid="body">{props.content}</span>;
  },
}));
vi.mock('../../ThoughtChainList', () => ({
  ThoughtChainList: (props: { thoughtChainList: unknown[] }) => {
    thoughtChain(props);
    return <span>Thoughts</span>;
  },
}));

const message: MessageBubbleData = {
  id: 'message',
  role: 'assistant',
  content: 'Hello',
  createAt: 1,
  updateAt: 1,
  meta: { title: 'Assistant', avatar: '/assistant.png' },
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Bubble shell DOM and slots', () => {
  it('omits empty user titles and their header wrappers', () => {
    const config: BubbleProps['bubbleRenderConfig'] = {
      contentRender: () => <p>Message</p>,
    };
    const { container } = render(
      <>
        {Array.from({ length: 100 }, (_, index) => (
          <UserBubble key={index} bubbleRenderConfig={config} />
        ))}
      </>,
    );

    expect(
      container.querySelectorAll('[data-testid="bubble-title"]'),
    ).toHaveLength(0);
    expect(
      container.querySelectorAll('[data-testid="bubble-avatar-title"]'),
    ).toHaveLength(0);
    expect(container.querySelectorAll('*')).toHaveLength(400);
  });

  it('keeps one AI container per message and preserves content interaction', () => {
    const onDoubleClick = vi.fn();
    const config: BubbleProps['bubbleRenderConfig'] = {
      titleRender: false,
      avatarRender: false,
      contentRender: () => <p>Message</p>,
    };
    const { container, getAllByTestId } = render(
      <>
        {Array.from({ length: 100 }, (_, index) => (
          <AIBubble
            key={index}
            bubbleRenderConfig={config}
            onDoubleClick={onDoubleClick}
          />
        ))}
      </>,
    );

    expect(
      container.querySelectorAll('.ant-agentic-bubble-container'),
    ).toHaveLength(100);
    expect(container.querySelectorAll('*')).toHaveLength(400);
    fireEvent.doubleClick(getAllByTestId('message-content')[0]);
    expect(onDoubleClick).toHaveBeenCalledTimes(1);
  });

  it.each([AIBubble, UserBubble])(
    'does not evaluate render callbacks for hidden messages',
    (Component) => {
      const titleRender = vi.fn(() => <span>Title</span>);
      const avatarRender = vi.fn(() => <span>Avatar</span>);
      const contentRender = vi.fn(() => <span>Body</span>);
      const contentBeforeRender = vi.fn(() => <span>Before</span>);
      const contentAfterRender = vi.fn(() => <span>After</span>);
      const config = {
        titleRender,
        avatarRender,
        contentRender,
        contentBeforeRender,
        contentAfterRender,
      };
      const { container, rerender } = render(
        <Component
          originData={message}
          bubbleRenderConfig={{ ...config, render: false }}
        />,
      );

      expect(container).toBeEmptyDOMElement();
      for (const renderSlot of Object.values(config))
        expect(renderSlot).not.toHaveBeenCalled();

      rerender(<Component originData={message} bubbleRenderConfig={config} />);
      expect(contentRender).toHaveBeenCalledTimes(1);
    },
  );

  it.each([AIBubble, UserBubble])(
    'omits empty fragments and preserves zero-valued slots',
    (Component) => {
      const { queryByTestId, rerender, getByTestId } = render(
        <Component
          bubbleRenderConfig={{
            titleRender: () => <></>,
            avatarRender: false,
            contentBeforeRender: () => <>{false}</>,
            contentRender: () => <></>,
          }}
        />,
      );
      expect(queryByTestId('bubble-avatar-title')).toBeNull();
      expect(queryByTestId('message-before')).toBeNull();
      expect(queryByTestId('message-content')).toBeNull();

      rerender(
        <Component
          bubbleRenderConfig={{
            avatarRender: false,
            titleRender: () => 0,
            contentBeforeRender: () => 0,
            contentRender: () => 0,
          }}
        />,
      );
      expect(getByTestId('bubble-avatar-title')).toHaveTextContent('0');
      expect(getByTestId('message-before')).toHaveTextContent('0');
      expect(getByTestId('message-content')).toHaveTextContent('0');
    },
  );

  it('preserves non-string AI message content for the display component', () => {
    const { getByTestId, rerender } = render(
      <AIBubble originData={{ ...message, content: 0 }} />,
    );
    expect(getByTestId('body')).toHaveTextContent('0');
    rerender(
      <AIBubble
        originData={{ ...message, content: <strong>Rich body</strong> }}
      />,
    );
    expect(getByTestId('body').querySelector('strong')).toHaveTextContent(
      'Rich body',
    );
  });

  it.each([AIBubble, UserBubble])(
    'preserves valid React nodes while ignoring malformed message objects',
    (Component) => {
      const { getByTestId, getByText, rerender } = render(
        <Component
          originData={{ ...message, content: { text: 'Invalid' } as never }}
        />,
      );
      expect(getByTestId('body')).toBeEmptyDOMElement();

      const nodes = [0, <strong key="text">Array body</strong>];
      rerender(<Component originData={{ ...message, content: nodes }} />);
      expect(getByTestId('body')).toHaveTextContent('0Array body');
      expect(display.mock.calls.at(-1)?.[0].content).toBe(nodes);

      const iterable = new Set([<em key="iterable">Iterable body</em>]);
      rerender(<Component originData={{ ...message, content: iterable }} />);
      expect(getByTestId('body')).toHaveTextContent('Iterable body');
      expect(display.mock.calls.at(-1)?.[0].content).toBe(iterable);

      const portal = createPortal(<span>Portal body</span>, document.body);
      rerender(<Component originData={{ ...message, content: portal }} />);
      expect(getByText('Portal body')).toBeInTheDocument();
      expect(display.mock.calls.at(-1)?.[0].content).toBe(portal);
    },
  );

  it.each([AIBubble, UserBubble])(
    'merges message metadata with avatar defaults and retains them during body updates',
    (Component) => {
      const avatar = {
        avatar: 'XY',
        title: 'Default title',
        backgroundColor: 'red',
      };
      const meta = { title: 'Message title' };
      const originData = { ...message, meta };
      const config: BubbleProps['bubbleRenderConfig'] = {
        avatarRender: (_props, defaultDom) => defaultDom,
      };
      const { getByTestId, rerender } = render(
        <Component
          avatar={avatar}
          originData={originData}
          bubbleRenderConfig={config}
        />,
      );

      expect(getByTestId('bubble-avatar')).toHaveTextContent('XY');
      expect(getByTestId('bubble-avatar')).toHaveStyle({
        backgroundColor: 'red',
      });
      const mergedAvatar = display.mock.calls.at(-1)?.[0].avatar;
      expect(mergedAvatar).toEqual({ ...avatar, ...meta });

      rerender(
        <Component
          avatar={avatar}
          originData={{ ...originData, content: 'Updated body' }}
          bubbleRenderConfig={config}
        />,
      );
      expect(display.mock.calls.at(-1)?.[0].avatar).toBe(mergedAvatar);
    },
  );

  it.each([AIBubble, UserBubble])(
    'forwards epoch updates and falls back to the configured time',
    (Component) => {
      const { rerender } = render(
        <Component originData={{ ...message, updateAt: 0 }} time={123} />,
      );
      expect(display.mock.calls.at(-1)?.[0].time).toBe(0);

      rerender(
        <Component
          originData={{
            ...message,
            createAt: undefined,
            updateAt: undefined,
          }}
          time={123}
        />,
      );
      expect(display.mock.calls.at(-1)?.[0].time).toBe(123);
    },
  );

  it('preserves an explicitly empty assistant title without falling back to its name', () => {
    const { queryByText } = render(
      <AIBubble
        originData={{
          ...message,
          meta: { title: '', name: 'Hidden alias' },
        }}
      />,
    );
    expect(queryByText('Hidden alias')).toBeNull();
  });

  it.each([AIBubble, UserBubble])(
    'applies short slots ahead of legacy keys through direct entries',
    (Component) => {
      const styleSlots: NonNullable<BubbleProps['styles']> = {
        root: { padding: 2 },
        bubbleStyle: { padding: 1 },
        container: { margin: 3 },
        avatarTitle: { opacity: 0.8 },
        title: { opacity: 0.7 },
        avatar: { opacity: 0.6 },
        content: { color: 'red' },
        before: { color: 'blue' },
        after: { color: 'green' },
        loadingIcon: { opacity: 0.5 },
        extra: { opacity: 0.4 },
      };
      const classNameSlots: NonNullable<BubbleProps['classNames']> = {
        root: 'slot-root',
        bubbleClassName: 'legacy-root',
        container: 'slot-container',
        avatarTitle: 'slot-header',
        title: 'slot-title',
        avatar: 'slot-avatar',
        content: 'slot-content',
        before: 'slot-before',
        after: 'slot-after',
        loadingIcon: 'slot-loading',
        extra: 'slot-extra',
      };
      const config: BubbleProps['bubbleRenderConfig'] = {
        avatarRender: (_props, defaultDom) => defaultDom,
        contentBeforeRender: () => <span>Before</span>,
        contentAfterRender: () => <span>After</span>,
      };
      const { container, rerender, getByTestId } = render(
        <Component
          originData={message}
          bubbleRenderConfig={config}
          styles={styleSlots}
          classNames={classNameSlots}
        />,
      );

      expect(container.firstElementChild).toHaveClass('slot-root');
      expect(container.firstElementChild).not.toHaveClass('legacy-root');
      expect(container.firstElementChild).toHaveStyle({ padding: '2px' });
      expect(getByTestId('chat-message')).toHaveClass('slot-container');
      expect(getByTestId('chat-message')).toHaveStyle({ margin: '3px' });
      expect(getByTestId('bubble-avatar-title')).toHaveClass('slot-header');
      expect(getByTestId('bubble-avatar-title')).toHaveStyle({ opacity: 0.8 });
      expect(getByTestId('bubble-title')).toHaveClass('slot-title');
      expect(getByTestId('bubble-title')).toHaveStyle({ opacity: 0.7 });
      expect(getByTestId('bubble-avatar')).toHaveClass('slot-avatar');
      expect(getByTestId('bubble-avatar')).toHaveStyle({ opacity: 0.6 });
      expect(getByTestId('message-content')).toHaveClass('slot-content');
      expect(getByTestId('message-content')).toHaveStyle({ color: 'red' });
      expect(getByTestId('message-before')).toHaveClass('slot-before');
      expect(getByTestId('message-before')).toHaveStyle({ color: 'blue' });
      expect(getByTestId('message-custom-after')).toHaveClass('slot-after');
      expect(getByTestId('message-custom-after')).toHaveStyle({
        color: 'green',
      });
      const forwarded = display.mock.calls.at(-1)?.[0] as BubbleProps;
      expect(forwarded.styles?.bubbleLoadingIconStyle).toBe(
        styleSlots.loadingIcon,
      );
      expect(forwarded.classNames?.bubbleLoadingIconClassName).toBe(
        'slot-loading',
      );
      expect(forwarded.styles?.bubbleListItemExtraStyle).toBe(styleSlots.extra);
      expect(forwarded.classNames?.bubbleListItemExtraClassName).toBe(
        'slot-extra',
      );

      rerender(
        <Component
          originData={message}
          bubbleRenderConfig={config}
          styles={{ ...styleSlots, content: { color: 'purple' } }}
          classNames={{ ...classNameSlots, content: 'updated-content' }}
        />,
      );
      expect(getByTestId('message-content')).toHaveStyle({ color: 'purple' });
      expect(getByTestId('message-content')).toHaveClass('updated-content');
    },
  );

  it('shares normalized thought tasks across streaming body updates', () => {
    const tasks = [{ info: 'Think' }];
    const originData = { ...message, extra: { white_box_process: tasks } };
    const { rerender } = render(<AIBubble originData={originData} />);
    const first = thoughtChain.mock.calls[0][0].thoughtChainList;
    rerender(
      <AIBubble originData={{ ...originData, content: 'Continued body' }} />,
    );
    expect(thoughtChain.mock.calls.at(-1)?.[0].thoughtChainList).toBe(first);
  });

  it('refreshes quote changes through the memoized Bubble dispatcher', () => {
    const user = { ...message, role: 'user' as const };
    const { getByText, rerender, queryByText } = render(
      <Bubble originData={user} quote={{ quoteDescription: 'First quote' }} />,
    );
    expect(getByText('First quote')).toBeInTheDocument();

    rerender(
      <Bubble
        originData={user}
        quote={{ quoteDescription: 'Updated quote' }}
      />,
    );

    expect(getByText('Updated quote')).toBeInTheDocument();
    expect(queryByText('First quote')).toBeNull();
  });
});

describe('Bubble title', () => {
  it('renders numeric zero titles and epoch timestamps', () => {
    const { getByTestId, getByText } = render(
      <BubbleTitle title={0} time={0} />,
    );
    expect(getByText('0')).toBeInTheDocument();
    expect(getByTestId('bubble-time')).toBeInTheDocument();
    expect(formatTime).toHaveBeenCalledWith(0);
  });

  it('renders quote-only content without an empty title wrapper', () => {
    const { container, queryByTestId } = render(
      <BubbleTitle title={null} quote={<span>Quote</span>} />,
    );
    expect(queryByTestId('bubble-title')).toBeNull();
    expect(container.children).toHaveLength(1);
    expect(container.firstElementChild).toHaveTextContent('Quote');
  });

  it('keeps title formatting out of ordinary AI body updates', () => {
    const { rerender } = render(<AIBubble originData={message} />);
    formatTime.mockClear();
    rerender(<AIBubble originData={{ ...message, content: 'Updated body' }} />);
    expect(formatTime).not.toHaveBeenCalled();
  });

  it('applies custom name styles while sharing the semantic name class', () => {
    const { getByText, rerender } = render(
      <AIBubble
        originData={message}
        styles={{ name: { color: 'red' } }}
        classNames={{ name: 'name-a' }}
      />,
    );
    expect(getByText('Assistant')).toHaveClass(
      'ant-agentic-bubble-title-name',
      'name-a',
    );
    expect(getByText('Assistant')).toHaveStyle({ color: 'red' });
    rerender(
      <AIBubble
        originData={message}
        styles={{ name: { color: 'blue' } }}
        classNames={{ name: 'name-b' }}
      />,
    );
    expect(getByText('Assistant')).toHaveClass('name-b');
    expect(getByText('Assistant')).not.toHaveClass('name-a');
    expect(getByText('Assistant')).toHaveStyle({ color: 'blue' });
  });
});

describe('slot normalization', () => {
  it('preserves legacy object identity and all unmapped legacy fields', () => {
    const styles = {
      bubbleListItemContentStyle: { color: 'red' },
      bubbleListItemStyle: { padding: 4 },
    };
    const classNames = {
      bubbleClassName: 'legacy',
      bubbleListItemClassName: 'item',
    };
    expect(normalizeBubbleStyles(styles)).toBe(styles);
    expect(normalizeBubbleClassNames(classNames)).toBe(classNames);
    expect(
      normalizeBubbleStyles({ ...styles, content: { color: 'blue' } })
        ?.bubbleListItemStyle,
    ).toBe(styles.bubbleListItemStyle);
    expect(
      normalizeBubbleClassNames({ ...classNames, root: '' })?.bubbleClassName,
    ).toBe('');
  });
});
