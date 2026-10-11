import '@testing-library/jest-dom';
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { BubbleProps, MessageBubbleData } from '../../type';
import { BubbleList } from '../index';

const state = vi.hoisted(() => ({
  mounts: 0,
  unmounts: 0,
  props: [] as BubbleProps[],
  observers: [] as {
    callback: IntersectionObserverCallback;
    targets: Set<Element>;
    disconnect: ReturnType<typeof vi.fn>;
  }[],
}));

vi.mock('../../MessagesContent', () => ({ LOADING_FLAT: '...' }));
vi.mock('../style', () => ({ useStyle: () => ({ hashId: '' }) }));
vi.mock('../SkeletonList', () => ({
  default: () => <div data-testid="skeleton">Loading</div>,
}));
vi.mock('../../Bubble', () => ({
  Bubble: (props: BubbleProps) => {
    const { originData, time } = props;
    state.props.push(props);
    React.useEffect(() => {
      state.mounts += 1;
      return () => {
        state.unmounts += 1;
      };
    }, []);
    return (
      <input
        data-testid={`draft-${originData?.id}`}
        data-time={time}
        defaultValue={String(originData?.content ?? '')}
      />
    );
  },
}));

const message = (id: string): MessageBubbleData => ({
  id,
  role: 'assistant',
  content: `Message ${id}`,
  createAt: 100,
});

const reveal = () => {
  act(() => {
    state.observers.forEach(({ callback, targets }) => {
      const entries = [...targets].map(
        (target) =>
          ({ target, isIntersecting: true }) as IntersectionObserverEntry,
      );
      callback(entries, {} as IntersectionObserver);
    });
  });
};

describe('BubbleList committed row and container behavior', () => {
  beforeEach(() => {
    state.mounts = 0;
    state.unmounts = 0;
    state.props = [];
    state.observers = [];
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        targets = new Set<Element>();
        disconnect = vi.fn(() => this.targets.clear());
        unobserve = vi.fn((target: Element) => this.targets.delete(target));
        observe = vi.fn((target: Element) => this.targets.add(target));
        constructor(callback: IntersectionObserverCallback) {
          state.observers.push({
            callback,
            targets: this.targets,
            disconnect: this.disconnect,
          });
        }
      },
    );
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('changing lazy.enable preserves a mounted message and its local draft', () => {
    const messages = [message('one')];
    const { rerender } = render(<BubbleList bubbleList={messages} />);
    const input = screen.getByTestId('draft-one');
    fireEvent.change(input, { target: { value: 'Local draft' } });

    rerender(<BubbleList bubbleList={messages} lazy={{ enable: true }} />);

    expect(screen.getByTestId('draft-one')).toBe(input);
    expect(input).toHaveValue('Local draft');
    expect(state.mounts).toBe(1);
    expect(state.unmounts).toBe(0);
  });

  it('appending a message keeps the previous eager last row mounted', () => {
    const first = message('first');
    const lazy = {
      enable: true,
      shouldLazyLoad: (index: number, total: number) => index < total - 1,
    };
    const { rerender } = render(
      <BubbleList bubbleList={[first]} lazy={lazy} />,
    );
    const input = screen.getByTestId('draft-first');
    fireEvent.change(input, { target: { value: 'Retain this draft' } });

    rerender(
      <BubbleList bubbleList={[first, message('second')]} lazy={lazy} />,
    );

    expect(screen.getByTestId('draft-first')).toBe(input);
    expect(input).toHaveValue('Retain this draft');
    expect(state.mounts).toBe(2);
    expect(state.unmounts).toBe(0);
  });

  it('lazy visibility and the row geometry share one DOM element', () => {
    const { container } = render(
      <BubbleList bubbleList={[message('one')]} lazy={{ enable: true }} />,
    );
    const root = container.querySelector('[data-chat-list]');
    expect(screen.queryByTestId('draft-one')).not.toBeInTheDocument();
    reveal();

    const row = container.querySelector('[data-bubble-list-item]');
    expect(row?.parentElement).toBe(root);
    expect(screen.getByTestId('draft-one').parentElement).toBe(row);
    expect(row).not.toHaveAttribute('aria-hidden');
  });

  it('one observer watches 100 lazy rows and is released after visibility', () => {
    render(
      <BubbleList
        bubbleList={Array.from({ length: 100 }, (_, index) =>
          message(`${index}`),
        )}
        lazy={{ enable: true }}
      />,
    );
    expect(state.observers).toHaveLength(1);
    expect(state.observers[0].targets.size).toBe(100);
    reveal();
    expect(screen.getAllByRole('textbox')).toHaveLength(100);
    expect(state.observers[0].disconnect).toHaveBeenCalledTimes(1);
  });

  it('reuses the lazy policy when only streaming content changes', () => {
    const shouldLazyLoad = vi.fn(
      (index: number, total: number) => index < total - 1,
    );
    const messages = Array.from({ length: 100 }, (_, index) =>
      message(`${index}`),
    );
    const { rerender } = render(
      <BubbleList
        bubbleList={messages}
        lazy={{ enable: true, shouldLazyLoad }}
      />,
    );
    expect(shouldLazyLoad).toHaveBeenCalledTimes(100);
    shouldLazyLoad.mockClear();
    rerender(
      <BubbleList
        bubbleList={messages.map((item, index) =>
          index === 99 ? { ...item, content: 'Streamed' } : item,
        )}
        lazy={{ enable: true, shouldLazyLoad }}
      />,
    );
    expect(shouldLazyLoad).not.toHaveBeenCalled();
    rerender(
      <BubbleList
        bubbleList={[...messages, message('appended')]}
        lazy={{ enable: true, shouldLazyLoad }}
      />,
    );
    expect(shouldLazyLoad).toHaveBeenCalledTimes(101);
  });

  it('loading does not evaluate lazy predicates for hidden messages', () => {
    const shouldLazyLoad = vi.fn(() => true);
    render(
      <BubbleList
        bubbleList={Array.from({ length: 100 }, (_, index) =>
          message(`${index}`),
        )}
        isLoading
        lazy={{ enable: true, shouldLazyLoad }}
      />,
    );
    expect(screen.getByTestId('skeleton')).toBeInTheDocument();
    expect(shouldLazyLoad).not.toHaveBeenCalled();
    expect(state.observers).toHaveLength(0);
  });

  it('loading retains container styles and scroll callbacks', () => {
    const onScroll = vi.fn();
    const onWheel = vi.fn();
    const onTouchMove = vi.fn();
    const { container } = render(
      <BubbleList
        bubbleList={[]}
        isLoading
        style={{ height: 300, padding: 12 }}
        onScroll={onScroll}
        onWheel={onWheel}
        onTouchMove={onTouchMove}
      />,
    );
    const root = container.firstElementChild!;
    expect(root).toHaveStyle({ height: '300px', padding: '12px' });
    fireEvent.scroll(root);
    fireEvent.wheel(root);
    fireEvent.touchMove(root);
    expect(onScroll).toHaveBeenCalledTimes(1);
    expect(onWheel).toHaveBeenCalledWith(expect.anything(), root);
    expect(onTouchMove).toHaveBeenCalledWith(expect.anything(), root);
  });

  it('keeps the same scroll container while entering and leaving loading', () => {
    const messages = [message('one')];
    const ref = React.createRef<HTMLDivElement>();
    const { rerender } = render(
      <BubbleList
        bubbleList={messages}
        bubbleListRef={ref}
        style={{ height: 300 }}
      />,
    );
    const root = ref.current!;
    root.scrollTop = 42;
    rerender(
      <BubbleList
        bubbleList={messages}
        bubbleListRef={ref}
        style={{ height: 300 }}
        isLoading
      />,
    );
    expect(ref.current).toBe(root);
    expect(root.scrollTop).toBe(42);
    rerender(
      <BubbleList
        bubbleList={messages}
        bubbleListRef={ref}
        style={{ height: 300 }}
      />,
    );
    expect(ref.current).toBe(root);
    expect(root.scrollTop).toBe(42);
  });

  it('wheel and touch callbacks receive the actual container without a ref', () => {
    const onWheel = vi.fn();
    const onTouchMove = vi.fn();
    const { container } = render(
      <BubbleList
        bubbleList={[message('one')]}
        onWheel={onWheel}
        onTouchMove={onTouchMove}
      />,
    );
    const root = container.firstElementChild!;
    fireEvent.wheel(screen.getByTestId('draft-one'));
    fireEvent.touchMove(screen.getByTestId('draft-one'));
    expect(onWheel).toHaveBeenCalledWith(expect.anything(), root);
    expect(onTouchMove).toHaveBeenCalledWith(expect.anything(), root);
  });

  it('updates file callbacks and speech configuration without changing messages', () => {
    const messages = [message('one')];
    const onPreview = vi.fn();
    const first = { onPreview, maxDisplayCount: 1 };
    const second = { onPreview: vi.fn(), maxDisplayCount: 5 };
    const useSpeech: NonNullable<BubbleProps['useSpeech']> = () => ({
      isPlaying: false,
      rate: 1,
      setRate: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn(),
    });
    const { rerender } = render(
      <BubbleList bubbleList={messages} fileViewConfig={first} />,
    );
    expect(state.props.at(-1)?.fileViewConfig).toBe(first);
    state.props = [];
    rerender(<BubbleList bubbleList={messages} fileViewConfig={second} />);
    expect(state.props.at(-1)?.fileViewConfig).toBe(second);
    expect(state.props.at(-1)?.fileViewConfig?.onPreview).toBe(
      second.onPreview,
    );

    state.props = [];
    rerender(
      <BubbleList
        bubbleList={messages}
        fileViewConfig={second}
        useSpeech={useSpeech}
      />,
    );
    expect(state.props.at(-1)?.useSpeech).toBe(useSpeech);
    expect(state.mounts).toBe(1);
  });

  it('renders eagerly if IntersectionObserver is unavailable', () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    render(
      <BubbleList bubbleList={[message('one')]} lazy={{ enable: true }} />,
    );
    expect(screen.getByTestId('draft-one')).toBeInTheDocument();
  });

  it('releases observers on removal and ignores their queued callbacks', () => {
    const { rerender } = render(
      <BubbleList bubbleList={[message('one')]} lazy={{ enable: true }} />,
    );
    const { callback, targets, disconnect } = state.observers[0];
    const target = [...targets][0];
    rerender(<BubbleList bubbleList={[]} lazy={{ enable: true }} />);
    expect(disconnect).toHaveBeenCalledOnce();
    act(() =>
      callback(
        [{ target, isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      ),
    );
    expect(state.mounts).toBe(0);
  });

  it('applies the latest placeholder callback and metadata without new observers', () => {
    const firstPlaceholder = vi.fn(() => <p>Initial placeholder</p>);
    const secondPlaceholder = vi.fn(({ elementInfo }) => (
      <p>Latest placeholder {elementInfo?.total}</p>
    ));
    const { rerender } = render(
      <BubbleList
        bubbleList={[message('one')]}
        lazy={{ enable: true, renderPlaceholder: firstPlaceholder }}
      />,
    );
    rerender(
      <BubbleList
        bubbleList={[message('one'), message('two')]}
        lazy={{ enable: true, renderPlaceholder: secondPlaceholder }}
      />,
    );
    expect(screen.queryByText('Initial placeholder')).not.toBeInTheDocument();
    expect(screen.getAllByText('Latest placeholder 2')).toHaveLength(2);
    expect(secondPlaceholder).toHaveBeenCalledWith(
      expect.objectContaining({
        elementInfo: { type: 'bubble', index: 1, total: 2, role: 'assistant' },
      }),
    );
    expect(state.observers).toHaveLength(1);
  });

  it('preserves a valid epoch update timestamp', () => {
    render(<BubbleList bubbleList={[{ ...message('one'), updateAt: 0 }]} />);
    expect(screen.getByTestId('draft-one')).toHaveAttribute('data-time', '0');
  });
});
