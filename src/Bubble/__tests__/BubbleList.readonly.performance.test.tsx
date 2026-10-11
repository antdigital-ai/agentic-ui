import '@testing-library/jest-dom';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { Editor, Node, Transforms } from 'slate';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type {
  MarkdownEditorInstance,
  MarkdownEditorProps,
} from '../../MarkdownEditor/types';
import { installRafStub } from '../../MarkdownRenderer/__tests__/installRafStub';
import { BubbleList } from '../List';
import { BubbleMessageDisplay } from '../MessagesContent';
import { MarkdownPreview } from '../MessagesContent/MarkdownPreview';
import type { MessageBubbleData } from '../type';

const { renderBody } = vi.hoisted(() => ({ renderBody: vi.fn() }));
const { editorInstance } = vi.hoisted(() => ({
  editorInstance: { current: undefined as MarkdownEditorInstance | undefined },
}));

vi.mock('../../MarkdownEditor', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../MarkdownEditor')>();
  return {
    ...actual,
    MarkdownEditor: (props: MarkdownEditorProps) => (
      <actual.MarkdownEditor {...props} editorRef={editorInstance} />
    ),
  };
});

describe('Bubble stream termination', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    installRafStub();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('shows all buffered paragraphs immediately on completion', async () => {
    const content = Array.from(
      { length: 20 },
      (_, index) => `Paragraph ${index}`,
    ).join('\n\n');
    const preview = (isFinished: boolean) => (
      <MarkdownPreview
        content={content}
        beforeContent={null}
        afterContent={null}
        originData={{ isLast: true, isFinished }}
        markdownRenderConfig={{
          streaming: true,
          throttleOptions: { charsPerFrame: 1 },
        }}
      />
    );
    const { container, rerender } = render(preview(false));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(16);
    });
    expect(container.textContent).toBe('P');

    rerender(preview(true));

    expect(container.querySelectorAll('[data-be="paragraph"]')).toHaveLength(
      20,
    );
    expect(container.textContent).toContain('Paragraph 19');
  });

  it.each(['finished', 'aborted'] as const)(
    'immediately shows the buffered tail and incomplete Markdown when %s',
    async (state) => {
      const content = 'Hello [unfinished';
      const preview = (terminal: boolean) => (
        <MarkdownPreview
          content={content}
          beforeContent={null}
          afterContent={null}
          typing={!terminal}
          originData={{
            isLast: true,
            isFinished: terminal && state === 'finished',
            isAborted: terminal && state === 'aborted',
          }}
          markdownRenderConfig={{
            streaming: true,
            throttleOptions: { charsPerFrame: 1 },
          }}
        />
      );
      const { container, rerender } = render(preview(false));
      await act(async () => {
        await vi.advanceTimersByTimeAsync(16);
      });
      expect(container.textContent).toBe('H');

      rerender(preview(true));

      expect(container.textContent).toBe(content);
      expect(container.querySelector('.stream-token')).toBeNull();
      expect(container.querySelector('[data-slate-editor]')).toBeNull();
    },
  );
});

vi.mock('../../MarkdownRenderer', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('../../MarkdownRenderer')>();
  return {
    ...actual,
    MarkdownRenderer: (
      props: React.ComponentProps<typeof actual.MarkdownRenderer>,
    ) => {
      renderBody(props.content);
      return <actual.MarkdownRenderer {...props} />;
    },
  };
});

describe('BubbleList readonly Markdown runtime', () => {
  it('preserves the actual Slate document when an edited message becomes readonly', () => {
    const body = (readonly: boolean) => (
      <MarkdownPreview
        content="original"
        readonly={readonly}
        beforeContent={null}
        afterContent={null}
      />
    );
    const { rerender } = render(body(false));
    const editor = editorInstance.current!.markdownEditorRef.current!;
    act(() => {
      Transforms.select(editor, Editor.range(editor, []));
      Transforms.insertText(editor, 'edited draft');
    });
    expect(Node.string(editor)).toBe('edited draft');
    rerender(body(true));
    expect(screen.getByText('edited draft')).toBeInTheDocument();
    expect(document.querySelector('[data-slate-editor]')).toBeInTheDocument();
    expect(screen.queryByTestId('markdown-renderer')).not.toBeInTheDocument();
    expect(
      Node.string(editorInstance.current!.markdownEditorRef.current!),
    ).toBe('edited draft');
  });

  it('flushes configured completed streaming messages immediately', () => {
    render(
      <MarkdownPreview
        content="The full finished answer"
        beforeContent={null}
        afterContent={null}
        markdownRenderConfig={{
          streaming: true,
          isFinished: true,
          throttleOptions: { charsPerFrame: 1, fade: false },
        }}
      />,
    );
    expect(screen.getByTestId('markdown-renderer')).toHaveTextContent(
      'The full finished answer',
    );
  });

  it('mounts 100 messages without Slate and updates only the streaming message body', () => {
    renderBody.mockClear();
    const messages: MessageBubbleData[] = Array.from(
      { length: 100 },
      (_, index) => ({
        id: `message-${index}`,
        role: 'assistant',
        content: `Message **${index}**`,
        isFinished: index < 99,
      }),
    );
    const bubbleRenderConfig = { extraRender: false as const };
    const markdownRenderConfig = {
      throttleOptions: { enabled: false, fade: false },
    };
    const { container, rerender } = render(
      <BubbleList
        bubbleList={messages}
        bubbleRenderConfig={bubbleRenderConfig}
        markdownRenderConfig={markdownRenderConfig}
      />,
    );
    expect(container.querySelectorAll('[data-slate-editor]')).toHaveLength(0);
    expect(screen.getAllByTestId('markdown-renderer')).toHaveLength(100);
    expect(renderBody).toHaveBeenCalledTimes(100);
    const firstBody = screen.getAllByTestId('markdown-renderer')[0];
    renderBody.mockClear();
    const next = messages.map((message, index) =>
      index === 99 ? { ...message, content: 'Streamed **answer**' } : message,
    );
    rerender(
      <BubbleList
        bubbleList={next}
        bubbleRenderConfig={bubbleRenderConfig}
        markdownRenderConfig={markdownRenderConfig}
      />,
    );
    expect(renderBody).toHaveBeenCalledExactlyOnceWith('Streamed **answer**');
    expect(screen.getAllByTestId('markdown-renderer')[0]).toBe(firstBody);
    expect(screen.getByText('answer')).toBeInTheDocument();
    expect(container.querySelectorAll('[data-slate-editor]')).toHaveLength(0);
  });

  it('shows extracted footnotes and mounts their readonly preview only while open', async () => {
    const user = userEvent.setup();
    const content = 'Answer[^Source]\n\n[^Source]: Reference **details**';
    const onFootnoteDefinitionChange = vi.fn();
    render(
      <BubbleMessageDisplay
        content={content}
        placement="left"
        originData={{
          id: 'footnote',
          role: 'assistant',
          content,
          isFinished: true,
        }}
        bubbleRenderConfig={{ extraRender: false }}
        markdownRenderConfig={{ fncProps: { onFootnoteDefinitionChange } }}
      />,
    );
    const footnote = await waitFor(() => {
      const node = document.querySelector('[data-fnc="fnc"]');
      expect(node).toBeInTheDocument();
      return node!;
    });
    expect(screen.getAllByTestId('markdown-renderer')).toHaveLength(1);
    expect(onFootnoteDefinitionChange).toHaveBeenCalledWith([
      expect.objectContaining({
        id: 'source',
        origin_text: 'Reference details',
      }),
    ]);
    expect(
      document.querySelector('[data-slate-editor]'),
    ).not.toBeInTheDocument();
    await user.hover(footnote);
    await waitFor(() =>
      expect(screen.getAllByTestId('markdown-renderer')).toHaveLength(2),
    );
    expect(document.querySelector('.ant-popover')).toHaveTextContent(
      'Reference details',
    );
    expect(
      document.querySelector('[data-slate-editor]'),
    ).not.toBeInTheDocument();
    await user.unhover(footnote);
    const popup = document.querySelector('.ant-popover')!;
    await waitFor(() => expect(popup.className).toContain('leave-active'));
    fireEvent.animationEnd(popup);
    fireEvent.transitionEnd(popup);
    await waitFor(() =>
      expect(screen.getAllByTestId('markdown-renderer')).toHaveLength(1),
    );
  });
});
