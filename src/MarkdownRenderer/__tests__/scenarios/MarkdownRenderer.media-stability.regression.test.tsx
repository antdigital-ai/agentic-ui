import { act, cleanup, fireEvent, render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MarkdownRenderer } from '../../index';
import * as markdownReactShared from '../../markdownReactShared';
import { useStreamingMarkdownReact } from '../../streaming/useStreamingMarkdownReact';
import type { MarkdownRendererProps } from '../../types';
import { installRafStub } from '../installRafStub';

const throttleOptions = { enabled: false, fade: false };

describe.each(['video', 'audio'] as const)('%s renderer stability', (type) => {
  const content = `<${type} src="https://example.com/clip.mp4" controls></${type}>`;

  it('exits streaming and removes token DOM on completion without replacing the player', () => {
    const source = `${content}\n\nA streaming paragraph with several words`;
    const { container, rerender } = render(
      <MarkdownRenderer
        content={source}
        streaming
        throttleOptions={{ enabled: false }}
      />,
    );
    const player = container.querySelector(type)!;
    player.currentTime = 19;
    expect(container.querySelector('.stream-token')).not.toBeNull();

    rerender(
      <MarkdownRenderer
        content={source}
        streaming
        isFinished
        throttleOptions={{ enabled: false }}
      />,
    );

    expect(container.querySelector('.stream-token')).toBeNull();
    expect(container.querySelector('[class*="-content-streaming"]')).toBeNull();
    expect(container.querySelector(type)).toBe(player);
    expect(player.currentTime).toBe(19);
  });

  it.each(['fncProps', 'linkConfig', 'tableConfig'] as const)(
    'retains the playing DOM when %s changes before stream completion',
    (configKey) => {
      const { container, rerender } = render(
        <MarkdownRenderer
          content={content}
          streaming
          throttleOptions={throttleOptions}
        />,
      );
      const player = container.querySelector(type)!;
      player.currentTime = 19;
      const configuration: Pick<MarkdownRendererProps, typeof configKey> =
        configKey === 'fncProps'
          ? { fncProps: { onOriginUrlClick: vi.fn() } }
          : configKey === 'linkConfig'
            ? { linkConfig: { onClick: vi.fn() } }
            : { tableConfig: { actions: { fullScreen: 'modal' } } };

      rerender(
        <MarkdownRenderer
          content={content}
          streaming={false}
          throttleOptions={throttleOptions}
          {...configuration}
        />,
      );

      expect(container.querySelector(type)).toBe(player);
      expect(player.currentTime).toBe(19);
    },
  );

  it('keeps the player while appending within its active HTML block', () => {
    const { container, rerender } = render(
      <MarkdownRenderer
        content={content}
        streaming
        throttleOptions={throttleOptions}
      />,
    );
    const player = container.querySelector(type)!;
    player.currentTime = 19;

    rerender(
      <MarkdownRenderer
        content={`${content}\nEnough following text to trigger the active block parser`}
        streaming
        throttleOptions={throttleOptions}
        linkConfig={{ onClick: vi.fn() }}
      />,
    );

    expect(container.querySelector(type)).toBe(player);
    expect(player.currentTime).toBe(19);
  });
});

it('refreshes a sealed link callback without reparsing its media block', () => {
  const previous = vi.fn(() => false);
  const current = vi.fn(() => false);
  const content =
    '<video src="https://example.com/clip.mp4"></video>\n<a href="https://example.com/link">Open link</a>\n\n\nTail';
  const { container, rerender, getByText } = render(
    <MarkdownRenderer
      content={content}
      streaming
      throttleOptions={throttleOptions}
      linkConfig={{ onClick: previous }}
    />,
  );
  const player = container.querySelector('video')!;
  player.currentTime = 19;

  rerender(
    <MarkdownRenderer
      content={content}
      streaming
      throttleOptions={throttleOptions}
      linkConfig={{ onClick: current }}
    />,
  );
  fireEvent.click(getByText('Open link'));

  expect(current).toHaveBeenCalledTimes(1);
  expect(previous).not.toHaveBeenCalled();
  expect(container.querySelector('video')).toBe(player);
  expect(player.currentTime).toBe(19);
});

it('refreshes a cached footnote badge without reparsing unchanged blocks', () => {
  const parse = vi.spyOn(markdownReactShared, 'renderMarkdownBlock');
  const content = 'A citation[^source]\n\n[^source]: Reference content';
  const { rerender, getByText, queryByText } = render(
    <MarkdownRenderer
      content={content}
      fncProps={{ render: () => <span>Original badge</span> }}
    />,
  );
  expect(getByText('Original badge')).toBeInTheDocument();
  parse.mockClear();

  rerender(
    <MarkdownRenderer
      content={content}
      fncProps={{ render: () => <span>Updated badge</span> }}
    />,
  );

  expect(getByText('Updated badge')).toBeInTheDocument();
  expect(queryByText('Original badge')).toBeNull();
  expect(parse).not.toHaveBeenCalled();
  parse.mockRestore();
});

it('reparses cached blocks when formula settings actually change', () => {
  const content = '$$x^2$$';
  const { container, rerender } = render(
    <MarkdownRenderer content={content} formula={{ enable: false }} />,
  );
  expect(container.querySelector('.katex')).toBeNull();

  rerender(<MarkdownRenderer content={content} formula={{ enable: true }} />);

  expect(container.querySelector('.katex')).toBeInTheDocument();
});

it('keeps user component hooks and local state across configuration updates', () => {
  const CustomParagraph = ({ children }: { children?: React.ReactNode }) => {
    const [count, setCount] = React.useState(0);
    return (
      <div>
        <button onClick={() => setCount(count + 1)}>Count {count}</button>
        {children}
      </div>
    );
  };
  const components = { p: CustomParagraph };
  const Harness = ({ onClick }: { onClick: () => boolean }) => {
    const node = useStreamingMarkdownReact('[Link](https://example.com)', {
      components,
      linkConfig: { onClick },
    });
    return <>{node}</>;
  };
  const previous = vi.fn(() => false);
  const current = vi.fn(() => false);
  const { rerender, getByText } = render(<Harness onClick={previous} />);
  fireEvent.click(getByText('Count 0'));

  rerender(<Harness onClick={current} />);
  fireEvent.click(getByText('Link'));

  expect(getByText('Count 1')).toBeInTheDocument();
  expect(current).toHaveBeenCalledTimes(1);
  expect(previous).not.toHaveBeenCalled();
});

describe('small streaming updates', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    installRafStub();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it.each([false, true])(
    'shows the final one-character update when throttling is %s',
    async (enabled) => {
      const options = { enabled, charsPerFrame: 2, fade: false };
      const { container, rerender } = render(
        <MarkdownRenderer
          content="Hello"
          streaming
          throttleOptions={options}
        />,
      );
      await act(async () => {
        await vi.advanceTimersByTimeAsync(64);
      });
      expect(container.textContent).toBe('Hello');

      rerender(
        <MarkdownRenderer
          content="HelloX"
          streaming
          throttleOptions={options}
        />,
      );
      if (enabled) {
        expect(container.textContent).toBe('Hello');
        await act(async () => {
          await vi.advanceTimersByTimeAsync(16);
        });
      }

      expect(container.textContent).toBe('HelloX');
    },
  );

  it('flushes a short remaining tail immediately when streaming finishes', async () => {
    const options = { charsPerFrame: 1, fade: false };
    const { container, rerender } = render(
      <MarkdownRenderer content="Hello" streaming throttleOptions={options} />,
    );
    await act(async () => {
      await vi.advanceTimersByTimeAsync(16);
    });
    expect(container.textContent).toBe('H');

    rerender(
      <MarkdownRenderer
        content="HelloX"
        streaming
        isFinished
        throttleOptions={options}
      />,
    );

    expect(container.textContent).toBe('HelloX');
  });
});
