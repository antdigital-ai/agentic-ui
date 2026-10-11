import { fireEvent, render, screen } from '@testing-library/react';
import React, { Suspense, useLayoutEffect } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AttachmentFile } from '../../MarkdownInputField/AttachmentButton/types';
import { AIBubble } from '../AIBubble';
import { BubbleBeforeNode } from '../BubbleBeforeNode';
import { BubbleConfigContext } from '../BubbleConfigProvide';
import { ContentFilemapView } from '../ContentFilemapView';
import { extractFilemapBlocks } from '../extractFilemapBlocks';
import type { BubbleProps, MessageBubbleData } from '../type';
import {
  extractStableFilemapBlocks,
  useFilemapBlocks,
} from '../useFilemapBlocks';
import { UserBubble } from '../UserBubble';

const { thoughtRender, fileRender } = vi.hoisted(() => ({
  thoughtRender: vi.fn(),
  fileRender: vi.fn(),
}));

vi.mock('../MessagesContent', () => ({
  LOADING_FLAT: '...',
  BubbleMessageDisplay: ({ content }: { content: React.ReactNode }) => (
    <p data-testid="body">{content}</p>
  ),
}));
vi.mock('../../ThoughtChainList', async () => {
  const { memo } = await import('react');
  return {
    ThoughtChainList: memo((props: Record<string, unknown>) => {
      thoughtRender(props);
      return <span>Thoughts</span>;
    }),
  };
});
vi.mock('../../MarkdownInputField/FileMapView', () => ({
  FileMapView: (props: {
    fileMap: Map<string, unknown>;
    onPreview?: (file: unknown) => void;
  }) => {
    fileRender(props);
    return (
      <button
        data-testid="file-preview"
        onClick={() => props.onPreview?.(props.fileMap.values().next().value)}
      >
        Preview
      </button>
    );
  },
}));

const body =
  '{"fileList":[{"name":"a.png","url":"/a.png","type":"image/png"}]}';
const filemap = `\`\`\`agentic-ui-filemap\n${body}\n\`\`\``;
const message: MessageBubbleData = {
  id: 'message',
  role: 'assistant',
  content: `${filemap}\nTail`,
  isFinished: false,
  extra: { white_box_process: [{ info: 'Think' }] },
};

beforeEach(() => vi.clearAllMocks());

describe('streaming filemap extraction', () => {
  it.each([
    `${filemap}\nTail`,
    `${filemap}suffix\n\`\`\`\nTail`,
    `Before\n${filemap}\nMiddle\n${filemap}\nAfter`,
    '```agentic-ui-filemap \r\n{}\r\n``` \r\nTail',
    '```agentic-ui-filemap\n{}\n```\u2028Tail',
    '```agentic-ui-filemap\n{}\n```\rTail\n```agentic-ui-filemap\r\n{}\n```',
    'Other\r```agentic-ui-filemap\r\n{}\n```',
    '```agentic-ui-filemap\n```',
    '```agentic-ui-filemap\n{}\n````\n```',
    '```agentic-ui-filemap\n{}'.padEnd(200, 'x'),
  ])(
    'matches the original extractor at every chunk boundary: %s',
    (content) => {
      let snapshot: ReturnType<typeof extractStableFilemapBlocks> | undefined;
      for (let index = 0; index <= content.length; index++) {
        const value = content.slice(0, index);
        snapshot = extractStableFilemapBlocks(value, snapshot);
        expect({
          blocks: snapshot.blocks,
          stripped: snapshot.stripped,
        }).toEqual(extractFilemapBlocks(value));
      }
    },
  );

  it('reuses completed attachment blocks and invalidates them on replacements or deletion', () => {
    const first = extractStableFilemapBlocks(`${filemap}\nTail`);
    const appended = extractStableFilemapBlocks(
      `${filemap}\nTail continued`,
      first,
    );
    expect(appended.blocks).toBe(first.blocks);
    const replacement = extractStableFilemapBlocks(
      filemap.replace('a.png', 'b.png'),
      appended,
    );
    expect(replacement.blocks[0].body).toContain('b.png');
    expect(replacement.blocks).not.toBe(first.blocks);
    expect(extractStableFilemapBlocks('', replacement).blocks).toEqual([]);
    const reopened = extractStableFilemapBlocks(
      filemap.slice(0, -1),
      replacement,
    );
    expect(reopened.blocks).toEqual([]);
  });

  it('keeps committed attachment references after a suspended render is abandoned', () => {
    const committed: ReturnType<typeof useFilemapBlocks>[] = [];
    const never = new Promise<never>(() => {});
    const Harness = ({
      content,
      suspend = false,
    }: {
      content: string;
      suspend?: boolean;
    }) => {
      const result = useFilemapBlocks(content);
      useLayoutEffect(() => {
        committed.push(result);
      }, [result]);
      if (suspend) throw never;
      return <span>{result.stripped}</span>;
    };
    const { rerender } = render(
      <React.StrictMode>
        <Suspense fallback="Pending">
          <Harness content={`${filemap}\nTail`} />
        </Suspense>
      </React.StrictMode>,
    );
    const initial = committed.at(-1)!;
    rerender(
      <React.StrictMode>
        <Suspense fallback="Pending">
          <Harness content={`${filemap}\nTail\n${filemap}`} suspend />
        </Suspense>
      </React.StrictMode>,
    );
    rerender(
      <React.StrictMode>
        <Suspense fallback="Pending">
          <Harness content={`${filemap}\nTail continued`} />
        </Suspense>
      </React.StrictMode>,
    );
    expect(committed.at(-1)?.blocks).toBe(initial.blocks);
    expect(screen.getByText('Tail continued')).toBeInTheDocument();
  });
});

describe('Bubble streaming shell boundaries', () => {
  it.each([AIBubble, UserBubble])(
    'keeps native file cards out of body updates while refreshing configuration and files',
    (Component) => {
      const file = {
        name: 'native.png',
        uuid: 'native',
        url: '/native.png',
      } as AttachmentFile;
      const nativeMessage = {
        ...message,
        content: 'Body',
        fileMap: new Map([['native', file]]),
      };
      const onPreview = vi.fn();
      const fileViewEvents = vi.fn(() => ({ onPreview }));
      const fileViewConfig = { maxDisplayCount: 2 };
      const { rerender } = render(
        <Component
          originData={nativeMessage}
          fileViewConfig={fileViewConfig}
          fileViewEvents={fileViewEvents}
        />,
      );
      const card = screen.getByTestId('file-preview');
      fileRender.mockClear();
      fileViewEvents.mockClear();
      for (let index = 1; index <= 20; index++) {
        rerender(
          <Component
            originData={{
              ...nativeMessage,
              content: `Body${'x'.repeat(index)}`,
            }}
            fileViewConfig={fileViewConfig}
            fileViewEvents={fileViewEvents}
          />,
        );
      }
      expect(fileRender).not.toHaveBeenCalled();
      expect(fileViewEvents).not.toHaveBeenCalled();
      expect(screen.getByTestId('file-preview')).toBe(card);
      const nextPreview = vi.fn();
      const nextEvents = () => ({ onPreview: nextPreview });
      const itemRender = vi.fn();
      const latestBody = 'Latest body';
      const nextConfig = {
        maxDisplayCount: 5,
        itemRender,
        renderFileMoreAction: () => latestBody,
      };
      const nextFiles = new Map([
        ...nativeMessage.fileMap,
        ['another', { ...file, uuid: 'another' }],
      ]);
      rerender(
        <Component
          originData={{
            ...nativeMessage,
            content: latestBody,
            fileMap: nextFiles,
          }}
          fileViewConfig={nextConfig}
          fileViewEvents={nextEvents}
        />,
      );
      expect(fileRender).toHaveBeenCalledTimes(1);
      const props = fileRender.mock.calls.at(-1)![0];
      expect(props.fileMap).toBe(nextFiles);
      expect(props.maxDisplayCount).toBe(5);
      expect(props.itemRender).toBe(itemRender);
      expect(props.renderMoreAction(file)).toBe(latestBody);
      fireEvent.click(card);
      expect(nextPreview).toHaveBeenCalledWith(file);
      expect(onPreview).not.toHaveBeenCalled();
      const topLevelMore = () => 'Top-level latest action';
      rerender(
        <Component
          originData={nativeMessage}
          renderFileMoreAction={topLevelMore}
        />,
      );
      expect(fileRender.mock.calls.at(-1)?.[0].renderMoreAction(file)).toBe(
        'Top-level latest action',
      );
    },
  );

  it.each([AIBubble, UserBubble])(
    'keeps completed file cards out of body updates and applies new event callbacks',
    (Component) => {
      const initialPreview = vi.fn();
      const nextPreview = vi.fn();
      const initialEvents = vi.fn(() => ({ onPreview: initialPreview }));
      const { rerender } = render(
        <Component originData={message} fileViewEvents={initialEvents} />,
      );
      fileRender.mockClear();
      initialEvents.mockClear();
      for (let index = 1; index <= 20; index++) {
        rerender(
          <Component
            originData={{
              ...message,
              content: `${message.content}${'x'.repeat(index)}`,
            }}
            fileViewEvents={initialEvents}
          />,
        );
      }
      expect(fileRender).not.toHaveBeenCalled();
      expect(initialEvents).not.toHaveBeenCalled();
      fireEvent.click(screen.getByTestId('file-preview'));
      expect(initialPreview).toHaveBeenCalledTimes(1);
      const nextEvents = () => ({ onPreview: nextPreview });
      rerender(<Component originData={message} fileViewEvents={nextEvents} />);
      fireEvent.click(screen.getByTestId('file-preview'));
      expect(nextPreview).toHaveBeenCalledTimes(1);
    },
  );

  it('keeps unchanged filemap items mounted when another block changes', () => {
    const first = { raw: filemap, body };
    const { rerender } = render(<ContentFilemapView blocks={[first]} />);
    fileRender.mockClear();
    rerender(
      <ContentFilemapView
        blocks={[
          first,
          { raw: filemap, body: body.replaceAll('a.png', 'b.png') },
        ]}
      />,
    );
    expect(fileRender).toHaveBeenCalledTimes(1);
  });

  it('skips default thought rendering during body tokens but refreshes finish, abort and timing', () => {
    const { rerender } = render(<AIBubble originData={message} />);
    thoughtRender.mockClear();
    for (let index = 1; index <= 20; index++) {
      rerender(
        <AIBubble
          originData={{
            ...message,
            content: `${message.content}${'x'.repeat(index)}`,
          }}
        />,
      );
    }
    expect(thoughtRender).not.toHaveBeenCalled();
    rerender(
      <AIBubble originData={{ ...message, isAborted: true, endTime: 100 }} />,
    );
    expect(thoughtRender.mock.calls.at(-1)?.[0].bubble).toMatchObject({
      isFinished: true,
      isAborted: true,
      endTime: 100,
    });
    rerender(
      <AIBubble
        originData={{ ...message, isFinished: true, createAt: 0, endTime: 200 }}
      />,
    );
    expect(thoughtRender.mock.calls.at(-1)?.[0].bubble).toMatchObject({
      isFinished: true,
      createAt: 0,
      endTime: 200,
    });
  });

  it('keeps custom thought renderers and title renderers supplied with the latest full message', () => {
    const custom = vi.fn(() => <span>Custom</span>);
    const bubble: BubbleProps = { placement: 'left', originData: message };
    const { rerender } = render(
      <BubbleConfigContext.Provider
        value={{
          standalone: false,
          thoughtChain: { thoughtChainList: [], render: custom },
        }}
      >
        <BubbleBeforeNode bubble={bubble} />
      </BubbleConfigContext.Provider>,
    );
    const updated = {
      ...message,
      content: 'Latest body',
      customMetadata: 'Latest metadata',
    };
    rerender(
      <BubbleConfigContext.Provider
        value={{
          standalone: false,
          thoughtChain: { thoughtChainList: [], render: custom },
        }}
      >
        <BubbleBeforeNode bubble={{ ...bubble, originData: updated }} />
      </BubbleConfigContext.Provider>,
    );
    expect(custom.mock.calls.at(-1)?.[0].originData).toBe(updated);
    const titleRender = vi.fn();
    rerender(
      <BubbleConfigContext.Provider
        value={{
          standalone: false,
          thoughtChain: { thoughtChainList: [], titleRender },
        }}
      >
        <BubbleBeforeNode bubble={{ ...bubble, originData: updated }} />
      </BubbleConfigContext.Provider>,
    );
    expect(thoughtRender.mock.calls.at(-1)?.[0].bubble).toMatchObject({
      content: 'Latest body',
      customMetadata: 'Latest metadata',
    });
  });
});
