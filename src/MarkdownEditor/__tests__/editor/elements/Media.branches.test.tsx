import { act, fireEvent, render, screen } from '@testing-library/react';
import { Modal } from 'antd';
import React from 'react';
import { createEditor, Editor, Node, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Media } from '../../../editor/elements/Media';
import type { MediaNode } from '../../../el';

const state = vi.hoisted(() => ({
  selected: true,
  readonly: false,
  editor: null as ReturnType<typeof createEditor> | null,
}));
vi.mock('../../../editor/store', () => ({
  useEditorStore: () => ({
    readonly: state.readonly,
    editorProps: {},
    markdownEditorRef: { current: state.editor },
  }),
}));
vi.mock('../../../hooks/editor', () => ({
  useElementSelected: () => state.selected,
}));
vi.mock('slate-react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('slate-react')>()),
  useSelected: () => state.selected,
}));
vi.mock('antd', async (importOriginal) => ({
  ...(await importOriginal<typeof import('antd')>()),
  Popover: ({
    children,
    content,
    open,
    onOpenChange,
  }: {
    children: React.ReactNode;
    content: React.ReactNode;
    open?: boolean;
    onOpenChange: (open: boolean) => void;
  }) => (
    <div onMouseEnter={() => onOpenChange(true)}>
      {children}
      {open && content}
    </div>
  ),
}));
vi.mock('react-rnd', () => ({
  Rnd: ({
    onResizeStart,
    onResizeStop,
    onResize,
  }: {
    onResizeStart?: () => void;
    onResizeStop?: (
      event: Event,
      direction: string,
      element: HTMLElement,
    ) => void;
    onResize?: (event: Event, direction: string, element: HTMLElement) => void;
  }) => {
    const box = { clientWidth: 350, clientHeight: 175 } as HTMLElement;
    return (
      <div data-testid="resize-controls">
        <button onClick={() => onResizeStart?.()}>Start resize</button>
        <button onClick={() => onResize?.(new Event('resize'), 'right', box)}>
          Resize
        </button>
        <button
          onClick={() => onResizeStop?.(new Event('resize'), 'right', box)}
        >
          Finish resize
        </button>
      </div>
    );
  },
}));

const makeNode = (type = 'image'): MediaNode => ({
  type: 'media',
  mediaType: type,
  url: `https://example.com/${type}`,
  alt: 'Media',
  children: [{ text: '' }],
});
function mount(type = 'image') {
  const node = makeNode(type);
  const editor = createEditor();
  editor.children = [node];
  state.editor = editor;
  const view = () => (
    <Media
      element={editor.children[0] as MediaNode}
      attributes={{ 'data-slate-node': 'element', ref: () => {} }}
    >
      <span />
    </Media>
  );
  const result = render(view());
  return { ...result, editor, node, refresh: () => result.rerender(view()) };
}
beforeEach(() => {
  state.selected = true;
  state.readonly = false;
  vi.spyOn(ReactEditor, 'findPath').mockImplementation((editor, node) => {
    const index = editor.children.indexOf(node as MediaNode);
    if (index < 0) throw new Error('removed');
    return [index];
  });
  vi.spyOn(ReactEditor, 'focus').mockImplementation(() => {});
  vi.spyOn(Modal, 'confirm').mockReturnValue({
    destroy: vi.fn(),
    update: vi.fn(),
  });
});
afterEach(() => vi.restoreAllMocks());

const openToolbar = () =>
  fireEvent.click(document.querySelector('[data-be="media-container"]')!);

describe('Media editing interactions', () => {
  it('selects the media when its noninteractive wrapper is pressed', () => {
    const { editor } = mount();
    const wrapper = screen.getByTestId('media-container');
    expect(fireEvent.mouseDown(wrapper)).toBe(false);
    expect(editor.selection).toEqual(Editor.range(editor, [0]));
    expect(ReactEditor.focus).toHaveBeenCalledWith(editor);
  });
  it.each(['video', 'audio'])(
    'leaves native %s mouse handling available',
    (type) => {
      const { editor } = mount(type);
      expect(fireEvent.mouseDown(screen.getByTestId(`${type}-element`))).toBe(
        true,
      );
      expect(editor.selection).toBeNull();
      expect(ReactEditor.focus).not.toHaveBeenCalled();
    },
  );
  it('preserves native attachment link clicks and mouse handling', () => {
    const { editor } = mount('attachment');
    expect(
      fireEvent.mouseDown(screen.getByRole('link', { name: 'Media' })),
    ).toBe(true);
    expect(editor.selection).toBeNull();
  });
  it('stops context menu events from bubbling to the editor', () => {
    const outer = vi.fn();
    state.editor = createEditor();
    state.editor.children = [makeNode()];
    render(
      <div onContextMenu={outer}>
        <Media
          element={state.editor.children[0] as MediaNode}
          attributes={{ 'data-slate-node': 'element', ref: () => {} }}
        >
          <span />
        </Media>
      </div>,
    );
    fireEvent.contextMenu(screen.getByTestId('media-container'));
    expect(outer).not.toHaveBeenCalled();
  });
  it('prevents dragging the media wrapper', () => {
    mount();
    expect(fireEvent.dragStart(screen.getByTestId('media-container'))).toBe(
      false,
    );
  });
  it('uses a confirmation before removing the current node', async () => {
    const { editor, node } = mount();
    openToolbar();
    fireEvent.click(screen.getByTestId('media-delete-button'));
    expect(editor.children).toContain(node);
    const onOk = vi.mocked(Modal.confirm).mock.calls[0][0].onOk;
    await act(async () => {
      await onOk?.();
    });
    expect(editor.children).not.toContain(node);
  });
  it('keeps the document unchanged when deletion is not confirmed', () => {
    const { editor, node } = mount();
    openToolbar();
    fireEvent.click(screen.getByTestId('media-delete-button'));
    expect(Modal.confirm).toHaveBeenCalledTimes(1);
    expect(editor.children).toEqual([node]);
  });
  it('resolves the latest node path after siblings move', async () => {
    const { editor, node } = mount();
    openToolbar();
    fireEvent.click(screen.getByTestId('media-delete-button'));
    act(() =>
      Transforms.insertNodes(
        editor,
        { type: 'paragraph', children: [{ text: 'before' }] },
        { at: [0] },
      ),
    );
    const onOk = vi.mocked(Modal.confirm).mock.calls[0][0].onOk;
    await act(async () => {
      await onOk?.();
    });
    expect(editor.children).not.toContain(node);
    expect(Node.string(editor)).toBe('before');
  });
  it('ignores a deletion confirmation after the target has been removed', async () => {
    const { editor } = mount();
    openToolbar();
    fireEvent.click(screen.getByTestId('media-delete-button'));
    act(() => Transforms.removeNodes(editor, { at: [0] }));
    const before = JSON.stringify(editor.children);
    const onOk = vi.mocked(Modal.confirm).mock.calls[0][0].onOk;
    await act(async () => {
      await onOk?.();
    });
    expect(JSON.stringify(editor.children)).toBe(before);
  });
  it('persists the final resize dimensions immediately', () => {
    const { editor } = mount();
    fireEvent.click(screen.getByRole('button', { name: 'Resize' }));
    expect(editor.children[0]).not.toHaveProperty('width');
    fireEvent.click(screen.getByRole('button', { name: 'Finish resize' }));
    expect(editor.children[0]).toMatchObject({ width: 350, height: 175 });
  });
  it('updates the visible box locally while resizing', () => {
    mount();
    fireEvent.click(screen.getByRole('button', { name: 'Start resize' }));
    fireEvent.click(screen.getByRole('button', { name: 'Resize' }));
    expect(screen.getByTestId('resize-image-container')).toHaveStyle({
      width: '350px',
      height: '175px',
    });
  });
  it('does not mount resize handles for an unselected image', () => {
    state.selected = false;
    mount();
    expect(screen.queryByTestId('resize-controls')).toBeNull();
  });
  it('preserves the actual image DOM when selection changes', () => {
    const { refresh } = mount();
    const image = screen.getByAltText('Media');
    fireEvent.load(image);
    state.selected = false;
    refresh();
    expect(screen.getByAltText('Media')).toBe(image);
    expect(screen.queryByTestId('resize-controls')).toBeNull();
    state.selected = true;
    refresh();
    expect(screen.getByAltText('Media')).toBe(image);
    expect(screen.getByTestId('resize-controls')).toBeInTheDocument();
  });
  it('preserves the video DOM when selection changes', () => {
    const { refresh } = mount('video');
    const player = screen.getByTestId('video-element');
    state.selected = false;
    refresh();
    expect(screen.getByTestId('video-element')).toBe(player);
    state.selected = true;
    refresh();
    expect(screen.getByTestId('video-element')).toBe(player);
  });
  it('prevents selecting or deleting readonly media', () => {
    state.readonly = true;
    const { editor } = mount('video');
    expect(fireEvent.mouseDown(screen.getByTestId('media-container'))).toBe(
      true,
    );
    openToolbar();
    expect(screen.queryByTestId('media-delete-button')).toBeNull();
    expect(editor.selection).toBeNull();
    expect(Modal.confirm).not.toHaveBeenCalled();
  });
});
