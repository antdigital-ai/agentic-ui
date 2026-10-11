import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import React, {
  startTransition,
  StrictMode,
  Suspense,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import * as shared from '../../markdownReactShared';
import { createHastProcessor } from '../../processor';
import type { RendererBlockProps } from '../../types';
import { MarkdownBlockPiece } from '../MarkdownBlockPiece';
import { useStreamingMarkdownReact } from '../useStreamingMarkdownReact';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

it('does not retain all historical parsed sources for one block position', () => {
  const parse = vi.spyOn(shared, 'renderMarkdownBlock');
  const processor = createHastProcessor();
  const components = {};
  const block = (source: string) => (
    <MarkdownBlockPiece
      variant="sealed"
      blockSource={source}
      processor={processor}
      components={components}
      streaming={false}
    />
  );
  const { rerender } = render(block('First answer'));
  for (let index = 0; index < 100; index++) {
    rerender(block(`Branched answer ${index}`));
  }
  const before = parse.mock.calls.length;
  rerender(block('First answer'));
  expect(parse.mock.calls.length).toBe(before + 1);
  expect(screen.getByText('First answer')).toBeTruthy();
});

it('releases old branch caches when a stream rolls back and grows again', () => {
  const parse = vi.spyOn(shared, 'renderMarkdownBlock');
  const Harness = ({ content }: { content: string }) => (
    <div>{useStreamingMarkdownReact(content, { streaming: true })}</div>
  );
  const content = (branch: number) => `Answer branch ${branch}\n\nTail`;
  const { rerender } = render(<Harness content={content(0)} />);
  for (let index = 1; index <= 30; index++) {
    rerender(<Harness content="Answer" />);
    rerender(<Harness content={content(index)} />);
  }
  rerender(<Harness content="Answer" />);
  rerender(<Harness content={content(0)} />);
  expect(
    parse.mock.calls.filter(([source]) => source === 'Answer branch 0'),
  ).toHaveLength(2);
});

it('compacts promotion and completion without reparsing or resetting custom state', () => {
  const parse = vi.spyOn(shared, 'renderMarkdownBlock');
  const processor = createHastProcessor(
    undefined,
    undefined,
    undefined,
    undefined,
    { enabled: true },
  );
  const Paragraph = ({ children }: RendererBlockProps) => {
    const [count, setCount] = useState(0);
    return (
      <div>
        <button type="button" onClick={() => setCount(count + 1)}>
          {count}
        </button>
        {children}
      </div>
    );
  };
  const Span = ({ children, className }: RendererBlockProps) => (
    <span className={className}>{children}</span>
  );
  const components = { p: Paragraph, span: Span };
  const block = (variant: 'tail' | 'sealed', streaming: boolean) => (
    <MarkdownBlockPiece
      variant={variant}
      blockSource="Hello streamed words"
      processor={processor}
      components={components}
      streaming={streaming}
    />
  );
  const { container, rerender } = render(block('tail', true));
  expect(container.querySelectorAll('.stream-token').length).toBeGreaterThan(0);
  fireEvent.click(screen.getByRole('button', { name: '0' }));
  const before = parse.mock.calls.length;
  rerender(block('sealed', true));
  rerender(block('sealed', false));
  expect(parse.mock.calls.length).toBe(before);
  expect(container.querySelectorAll('.stream-token')).toHaveLength(0);
  expect(screen.getByRole('button', { name: '1' })).toBeTruthy();
});

it('does not reuse a parsed source from an abandoned Suspense render', async () => {
  const parse = vi.spyOn(shared, 'renderMarkdownBlock');
  const processor = createHastProcessor();
  const pending = new Promise<void>(() => {});
  let suspend = true;
  let update: (source: string, variant: 'tail' | 'sealed') => void = () => {};
  const Paragraph = ({ children }: RendererBlockProps) => {
    const [count, setCount] = useState(0);
    if (suspend && children === 'Abandoned answer') throw pending;
    return (
      <div>
        <video data-testid="suspense-cache-media" />
        <button type="button" onClick={() => setCount(count + 1)}>
          {count}
        </button>
        {children}
      </div>
    );
  };
  const components = { p: Paragraph };
  const Harness = () => {
    const [state, setState] = useState<{
      source: string;
      variant: 'tail' | 'sealed';
    }>({ source: 'Committed answer', variant: 'tail' });
    update = (source, variant) => setState({ source, variant });
    return (
      <Suspense fallback={<span>Waiting for answer</span>}>
        <MarkdownBlockPiece
          variant={state.variant}
          blockSource={state.source}
          processor={processor}
          components={components}
          streaming
        />
      </Suspense>
    );
  };
  render(<Harness />);
  const media = screen.getByTestId('suspense-cache-media');
  fireEvent.click(screen.getByRole('button', { name: '0' }));
  const committedParses = parse.mock.calls.filter(
    ([source]) => source === 'Committed answer',
  ).length;
  await act(async () => {
    startTransition(() => update('Abandoned answer', 'tail'));
  });
  const abandonedParses = parse.mock.calls.filter(
    ([source]) => source === 'Abandoned answer',
  ).length;
  expect(abandonedParses).toBeGreaterThan(0);
  expect(screen.queryByText('Waiting for answer')).toBeNull();
  expect(screen.getByTestId('suspense-cache-media')).toBe(media);

  await act(async () => update('Committed answer', 'sealed'));
  expect(
    parse.mock.calls.filter(([source]) => source === 'Committed answer'),
  ).toHaveLength(committedParses);
  expect(screen.getByTestId('suspense-cache-media')).toBe(media);
  expect(screen.getByRole('button', { name: '1' })).toBeTruthy();

  suspend = false;
  await act(async () => update('Abandoned answer', 'tail'));
  expect(
    parse.mock.calls.filter(([source]) => source === 'Abandoned answer').length,
  ).toBeGreaterThan(abandonedParses);
  expect(screen.getByTestId('suspense-cache-media')).toBe(media);
  expect(screen.getByRole('button', { name: '1' })).toBeTruthy();
});

it('keeps custom code state and media through promotion and finish in StrictMode', () => {
  const parse = vi.spyOn(shared, 'renderMarkdownBlock');
  const mounts = vi.fn();
  const unmounts = vi.fn();
  const Code = ({ children }: RendererBlockProps) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
      mounts();
      return unmounts;
    }, []);
    return (
      <div>
        <video data-testid="strict-cache-media" />
        <button type="button" onClick={() => setCount(count + 1)}>
          {count}
        </button>
        {children}
      </div>
    );
  };
  const components = { __codeBlock: Code };
  const code = '```ts\nconst value = 1;\n```';
  const Harness = ({
    content,
    streaming,
  }: {
    content: string;
    streaming: boolean;
  }) => (
    <div>
      {useStreamingMarkdownReact(content, {
        streaming,
        components,
        fadeTokens: streaming,
      })}
    </div>
  );
  const { rerender } = render(
    <StrictMode>
      <Harness content={code} streaming />
    </StrictMode>,
  );
  const media = screen.getByTestId('strict-cache-media');
  fireEvent.click(screen.getByRole('button', { name: '0' }));
  const initialMounts = mounts.mock.calls.length;
  const initialUnmounts = unmounts.mock.calls.length;
  const initialCodeParses = parse.mock.calls.filter(
    ([source]) => source === code,
  ).length;
  rerender(
    <StrictMode>
      <Harness content={`${code}\n\nTail`} streaming />
    </StrictMode>,
  );
  rerender(
    <StrictMode>
      <Harness content={`${code}\n\nTail grows`} streaming />
    </StrictMode>,
  );
  rerender(
    <StrictMode>
      <Harness content={`${code}\n\nTail grows`} streaming={false} />
    </StrictMode>,
  );
  expect(parse.mock.calls.filter(([source]) => source === code)).toHaveLength(
    initialCodeParses,
  );
  expect(mounts).toHaveBeenCalledTimes(initialMounts);
  expect(unmounts).toHaveBeenCalledTimes(initialUnmounts);
  expect(screen.getByTestId('strict-cache-media')).toBe(media);
  expect(screen.getByRole('button', { name: '1' })).toBeTruthy();
});

it('publishes caches before a parent layout effect synchronously appends blocks', () => {
  const parse = vi.spyOn(shared, 'renderMarkdownBlock');
  const mounts = vi.fn();
  const mediaNodes: HTMLVideoElement[] = [];
  const Code = () => {
    const [count, setCount] = useState(0);
    useLayoutEffect(() => {
      setCount(7);
    }, []);
    useEffect(() => {
      mounts();
    }, []);
    return (
      <div>
        <video
          data-testid="layout-cache-media"
          ref={(node) => {
            if (node && !mediaNodes.includes(node)) mediaNodes.push(node);
          }}
        />
        <button type="button" onClick={() => setCount(count + 1)}>
          {count}
        </button>
      </div>
    );
  };
  const components = { __codeBlock: Code };
  const code = '```ts\nconst value = 1;\n```';
  const Harness = () => {
    const [content, setContent] = useState(code);
    const children = useStreamingMarkdownReact(content, {
      streaming: true,
      components,
    });
    useLayoutEffect(() => {
      setContent(`${code}\n\nAppended in layout`);
    }, []);
    return <div>{children}</div>;
  };
  render(<Harness />);
  expect(parse.mock.calls.filter(([source]) => source === code)).toHaveLength(
    1,
  );
  expect(mounts).toHaveBeenCalledTimes(1);
  expect(mediaNodes).toHaveLength(1);
  expect(screen.getByTestId('layout-cache-media')).toBe(mediaNodes[0]);
  expect(screen.getByRole('button', { name: '7' })).toBeTruthy();
  expect(screen.getByText('Appended in layout')).toBeTruthy();
});
