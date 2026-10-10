import {
  act,
  cleanup,
  fireEvent,
  render,
  waitFor,
} from '@testing-library/react';
import { Modal } from 'antd';
import React, { Profiler } from 'react';
import { Editor, Element, Node, Transforms } from 'slate';
import { afterEach, describe, expect, it, vi } from 'vitest';
import BaseMarkdownEditorSlate from '../../../../BaseMarkdownEditorSlate';
import type { MediaNode } from '../../../../el';
import type {
  MarkdownEditorInstance,
  MarkdownEditorProps,
} from '../../../../types';
import { EditorStoreTestProvider } from '../../../__tests__/helpers/editorStoreTestContext';
import { EditorUtils } from '../../../utils/editorUtils';
import { ReadonlyMedia } from '../ReadonlyMedia';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

const video: MediaNode = {
  type: 'media',
  mediaType: 'video',
  url: 'https://example.com/clip.mp4',
  alt: 'Clip',
  children: [{ text: '' }],
};

const mountEditor = (props: MarkdownEditorProps = {}) => {
  const editorRef = React.createRef<MarkdownEditorInstance>();
  const initialSchema = (
    props.initSchemaValue ?? [
      video,
      { type: 'paragraph' as const, children: [{ text: 'text' }] },
    ]
  ).map((node) =>
    node.type === 'media' ? EditorUtils.wrapperCardNode(node) : node,
  );
  const renderEditor = (overrides: MarkdownEditorProps = {}) => (
    <BaseMarkdownEditorSlate
      editorRef={editorRef}
      floatBar={{ enable: false }}
      {...props}
      initSchemaValue={initialSchema}
      {...overrides}
    />
  );
  const view = render(renderEditor());
  const editor = editorRef.current!.markdownEditorRef.current!;
  const mediaEntry = () =>
    Array.from(
      Editor.nodes(editor, {
        at: [],
        match: (node) => Element.isElement(node) && node.type === 'media',
      }),
    )[0];
  const update = async (patch: Partial<MediaNode>) => {
    await act(async () => {
      Transforms.setNodes(editor, patch, { at: mediaEntry()[1] });
    });
  };
  return {
    ...view,
    editor,
    mediaEntry,
    update,
    setReadonly: (readonly: boolean) =>
      view.rerender(renderEditor({ readonly })),
  };
};

describe.each([false, true])('Media with readonly=%s', (readonly) => {
  it('uses one mounted player and does not write inferred mediaType on mount', async () => {
    const create = vi.spyOn(document, 'createElement');
    const { editor, getByTestId, mediaEntry } = mountEditor({
      readonly,
      initSchemaValue: [{ ...video, mediaType: undefined }],
    });
    const player = await waitFor(() => getByTestId('video-element'));

    // React development checks may construct an unused tag without a source.
    const requestedPlayers = create.mock.results.filter(
      (result) =>
        result.type === 'return' &&
        result.value instanceof HTMLVideoElement &&
        result.value.hasAttribute('src'),
    );
    expect(requestedPlayers).toHaveLength(1);
    expect(requestedPlayers[0].value).toBe(player);
    expect((mediaEntry()[0] as MediaNode).mediaType).toBeUndefined();
    fireEvent.loadedMetadata(player);
    expect(
      editor.operations.filter((operation) => operation.type === 'set_node'),
    ).toHaveLength(0);
  });

  it('honors an explicit audio type for extensionless CDN URLs', () => {
    const { getByTestId, queryByTestId } = mountEditor({
      readonly,
      initSchemaValue: [
        {
          ...video,
          mediaType: 'audio',
          url: 'https://cdn.example.com/asset?id=123',
        },
      ],
    });
    expect(getByTestId('audio-element')).toHaveAttribute(
      'preload',
      readonly ? 'none' : 'metadata',
    );
    expect(queryByTestId('video-element')).toBeNull();
  });

  it('updates all playback properties without replacing the playing DOM', async () => {
    const { getByTestId, update } = mountEditor({ readonly });
    const player = getByTestId('video-element') as HTMLVideoElement;
    player.currentTime = 12;
    await update({
      width: 480,
      height: 270,
      controls: false,
      autoplay: true,
      loop: true,
      muted: true,
      poster: 'https://example.com/poster.jpg',
      alt: 'Renamed clip',
    });

    expect(getByTestId('video-element')).toBe(player);
    expect(player.currentTime).toBe(12);
    expect(player).toHaveStyle({ width: '480px', height: '270px' });
    expect(player.controls).toBe(false);
    expect(player.autoplay).toBe(true);
    expect(player.loop).toBe(true);
    expect(player.muted).toBe(true);
    expect(player).toHaveAttribute('poster', 'https://example.com/poster.jpg');
  });

  it('recovers on source/type changes and ignores errors from removed players', async () => {
    const { getByTestId, queryByTestId, update } = mountEditor({ readonly });
    const oldPlayer = getByTestId('video-element');
    fireEvent.error(oldPlayer);
    expect(queryByTestId('video-element')).toBeNull();
    await update({ url: 'https://example.com/new.mp3', mediaType: 'audio' });
    const player = getByTestId('audio-element');
    fireEvent.error(oldPlayer);
    expect(getByTestId('audio-element')).toBe(player);
    expect(player).toHaveAttribute('src', 'https://example.com/new.mp3');
  });

  it('retries a failed source after visiting another URL', async () => {
    const { getByTestId, queryByTestId, update } = mountEditor({ readonly });
    const oldPlayer = getByTestId('video-element');
    fireEvent.error(oldPlayer);
    expect(queryByTestId('video-element')).toBeNull();
    await update({ url: 'https://example.com/second.mp4' });
    const secondPlayer = getByTestId('video-element');
    await update({ url: video.url });
    const retriedPlayer = getByTestId('video-element');
    expect(retriedPlayer).not.toBe(oldPlayer);
    expect(retriedPlayer).toHaveAttribute('src', video.url);
    fireEvent.error(secondPlayer);
    expect(getByTestId('video-element')).toBe(retriedPlayer);
  });

  it('does not change the selection or show delete controls when using a player', async () => {
    const { getByTestId, editor, container } = mountEditor({ readonly });
    const paragraphEntry = Array.from(
      Editor.nodes(editor, {
        at: [],
        match: (node) => Element.isElement(node) && node.type === 'paragraph',
      }),
    )[0];
    await act(async () => {
      Transforms.select(editor, Editor.start(editor, paragraphEntry[1]));
    });
    const selection = editor.selection;
    const mouseDown = new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true,
    });
    fireEvent(getByTestId('video-element'), mouseDown);
    fireEvent.click(getByTestId('video-element'));

    expect(editor.selection).toEqual(selection);
    expect(mouseDown.defaultPrevented).toBe(false);
    expect(container.querySelector('.ant-popover-open')).toBeNull();
  });
});

it('keeps rendering local when typing next to many media nodes', async () => {
  const create = vi.spyOn(document, 'createElement');
  const commits = new Set<string>();
  const eleItemRender: MarkdownEditorProps['eleItemRender'] = (props, dom) =>
    props.element.type === 'media' ? (
      <Profiler id={props.element.url!} onRender={(id) => commits.add(id)}>
        {dom}
      </Profiler>
    ) : (
      dom
    );
  const { editor, container } = mountEditor({
    eleItemRender,
    initSchemaValue: [
      ...Array.from({ length: 30 }, (_, index) => ({
        ...video,
        url: `https://example.com/${index}.mp4`,
        children: [{ text: '' }],
      })),
      { type: 'paragraph', children: [{ text: 'text' }] },
    ],
  });
  await waitFor(() =>
    expect(container.querySelectorAll('video')).toHaveLength(30),
  );
  await act(async () => {
    Transforms.select(editor, Editor.start(editor, [30]));
  });
  const requestedPlayers = create.mock.results
    .filter(
      (result) =>
        result.type === 'return' &&
        result.value instanceof HTMLVideoElement &&
        result.value.hasAttribute('src'),
    )
    .map((result) => result.value as HTMLVideoElement);
  expect(requestedPlayers).toHaveLength(30);
  expect(requestedPlayers.every((player) => player.isConnected)).toBe(true);
  commits.clear();
  const players = Array.from(container.querySelectorAll('video'));
  await act(async () => {
    Transforms.insertText(editor, 'X');
  });
  await act(async () => {
    Transforms.select(editor, Editor.start(editor, [30]));
  });

  expect(commits.size).toBe(0);
  expect(Array.from(container.querySelectorAll('video'))).toEqual(players);
});

it('resolves deletion after a sibling moved the media while confirmation was open', async () => {
  let confirmDelete: (() => void) | undefined;
  vi.spyOn(Modal, 'confirm').mockImplementation((options) => {
    confirmDelete = options.onOk as () => void;
    return { destroy: vi.fn(), update: vi.fn() };
  });
  const { editor, container, mediaEntry } = mountEditor();
  const inner = container.querySelector('[data-be="media-container"]')!;
  fireEvent.mouseEnter(inner);
  const deleteButton = await waitFor(() => {
    const button = document.querySelector(
      '[data-testid="media-delete-button"]',
    );
    expect(button).not.toBeNull();
    return button!;
  });
  fireEvent.click(deleteButton);
  expect(confirmDelete).toBeTypeOf('function');
  await act(async () => {
    Transforms.insertNodes(
      editor,
      { type: 'paragraph', children: [{ text: 'new sibling' }] },
      { at: [0] },
    );
  });
  expect(mediaEntry()[1][0]).toBeGreaterThan(0);
  await act(async () => {
    confirmDelete!();
  });

  expect(
    Array.from(
      Editor.nodes(editor, {
        at: [],
        match: (node) => Element.isElement(node) && node.type === 'media',
      }),
    ),
  ).toHaveLength(0);
  expect(Node.string(editor)).toContain('new sibling');
});

it('resets an unfinished source timeout for a new URL', async () => {
  vi.useFakeTimers();
  const attributes = { 'data-slate-node': 'element' as const, ref: () => {} };
  const view = (url: string) => (
    <EditorStoreTestProvider>
      <ReadonlyMedia
        attributes={attributes}
        element={{ ...video, url, finished: false }}
      >
        hidden
      </ReadonlyMedia>
    </EditorStoreTestProvider>
  );
  const { rerender, queryByText, getByText } = render(
    view('https://example.com/first.mp4'),
  );
  await act(async () => vi.advanceTimersByTime(4000));
  rerender(view('https://example.com/second.mp4'));
  await act(async () => vi.advanceTimersByTime(1500));
  expect(queryByText('Clip')).toBeNull();
  await act(async () => vi.advanceTimersByTime(3500));
  expect(getByText('Clip')).toBeInTheDocument();
});

it('does not delete media when an old confirmation finishes after switching to readonly', async () => {
  let confirmDelete: (() => void) | undefined;
  vi.spyOn(Modal, 'confirm').mockImplementation((options) => {
    confirmDelete = options.onOk as () => void;
    return { destroy: vi.fn(), update: vi.fn() };
  });
  const { container, mediaEntry, setReadonly } = mountEditor();
  fireEvent.mouseEnter(container.querySelector('[data-be="media-container"]')!);
  const deleteButton = await waitFor(() => {
    const button = document.querySelector(
      '[data-testid="media-delete-button"]',
    );
    expect(button).not.toBeNull();
    return button!;
  });
  fireEvent.click(deleteButton);
  expect(confirmDelete).toBeTypeOf('function');
  setReadonly(true);
  await act(async () => {
    confirmDelete!();
  });
  expect(mediaEntry()[0]).toMatchObject({ type: 'media', url: video.url });
});
