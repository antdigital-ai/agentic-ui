import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { Modal } from 'antd';
import React, { Profiler } from 'react';
import { createEditor, Transforms } from 'slate';
import { withHistory } from 'slate-history';
import { Editable, Slate, withReact } from 'slate-react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { MediaNode } from '../../../../el';
import {
  EditorStore,
  EditorStoreContext,
  type EditorStoreContextType,
} from '../../../store';
import { EditorUtils } from '../../../utils/editorUtils';
import { EditorImage, ReadonlyImage } from '../index';
import { ReadonlyEditorImage } from '../ReadonlyEditorImage';

const resizing = vi.hoisted(() => ({
  props: undefined as unknown,
  renders: 0,
}));
vi.mock('react-rnd', async (importOriginal) => {
  const original = await importOriginal<typeof import('react-rnd')>();
  return {
    ...original,
    Rnd: (props: React.ComponentProps<typeof original.Rnd>) => {
      resizing.props = props;
      resizing.renders++;
      return <original.Rnd data-testid="image-resize-controls" {...props} />;
    },
  };
});

function createImage(index: number): MediaNode {
  return {
    type: 'media',
    url: `https://images.example/${index}.png`,
    alt: `image ${index}`,
    width: 400,
    height: 300,
    children: [{ text: '' }],
  };
}

function setupImages(count = 1) {
  const editor = withReact(withHistory(createEditor()));
  const isVoid = editor.isVoid;
  editor.isVoid = (element) => element.type === 'media' || isVoid(element);
  editor.children = [
    { type: 'paragraph', children: [{ text: 'edit here' }] },
    ...Array.from({ length: count }, (_, index) => createImage(index)),
  ];
  const markdownEditorRef = { current: editor };
  const store = new EditorStore(markdownEditorRef);
  const context = {
    store,
    markdownEditorRef,
    editorProps: {},
    readonly: false,
  } as EditorStoreContextType;
  const commits = new Map<string, number>();
  const view = render(
    <EditorStoreContext.Provider value={context}>
      <Slate editor={editor} initialValue={editor.children}>
        <Editable
          renderElement={(props) =>
            props.element.type === 'media' ? (
              <Profiler
                id={props.element.url!}
                onRender={(id) => commits.set(id, (commits.get(id) ?? 0) + 1)}
              >
                <EditorImage {...props} element={props.element} />
              </Profiler>
            ) : (
              <p {...props.attributes}>{props.children}</p>
            )
          }
        />
      </Slate>
    </EditorStoreContext.Provider>,
  );
  return { ...view, editor, store, context, commits };
}

function loadImage(image: HTMLImageElement, width = 800, height = 600) {
  Object.defineProperties(image, {
    naturalWidth: { configurable: true, value: width },
    naturalHeight: { configurable: true, value: height },
  });
  fireEvent.load(image);
}

function measuredSize(width: number, height: number) {
  const element = document.createElement('div');
  Object.defineProperties(element, {
    clientWidth: { value: width },
    clientHeight: { value: height },
  });
  return element;
}

type ResizeHandlers = {
  onResize: (event: unknown, direction: string, element: HTMLElement) => void;
  onResizeStop: (
    event: unknown,
    direction: string,
    element: HTMLElement,
  ) => void;
};

beforeEach(() => {
  resizing.props = undefined;
  resizing.renders = 0;
});
afterEach(() => vi.restoreAllMocks());

describe('image editing with real Slate', () => {
  it('preserves numeric string dimensions imported from image URL parameters after loading', async () => {
    const { editor } = setupImages(0);
    const imported = EditorUtils.createMediaNode(
      'https://images.example/dimensioned.png?width=280&height=110',
      'image',
      { alt: 'URL dimensions' },
    );
    if (!('children' in imported)) throw new Error('Expected an image card');
    const imageNode = imported.children[1] as MediaNode;
    expect(imageNode.width).toBe('280');
    expect(imageNode.height).toBe('110');
    await act(async () =>
      Transforms.insertNodes(
        editor,
        { ...imageNode, type: 'media' },
        { at: [1] },
      ),
    );
    const image = screen.getByAltText('URL dimensions') as HTMLImageElement;
    loadImage(image, 800, 600);
    expect(image.closest('[data-testid="resize-image-container"]')).toHaveStyle(
      { width: '280px', height: '110px' },
    );
  });

  it('falls back to finite dimensions when imported URL sizes are blank or infinite', async () => {
    const { editor } = setupImages(0);
    const imported = EditorUtils.createMediaNode(
      'https://images.example/dimensioned.png?width=%20&height=Infinity',
      'image',
      { alt: 'invalid dimensions' },
    );
    if (!('children' in imported)) throw new Error('Expected an image card');
    await act(async () =>
      Transforms.insertNodes(
        editor,
        { ...imported.children[1], type: 'media' } as MediaNode,
        { at: [1] },
      ),
    );
    const image = screen.getByAltText('invalid dimensions') as HTMLImageElement;
    loadImage(image, 800, 400);
    expect(image.closest('[data-testid="resize-image-container"]')).toHaveStyle(
      { width: '400px', height: '200px' },
    );
  });

  it('loads each displayed image once, creates no resize controls or Slate edits on mounting', async () => {
    const createElement = vi.spyOn(document, 'createElement');
    const { editor, container, commits } = setupImages(20);
    expect(container.querySelectorAll('img')).toHaveLength(20);
    expect(
      createElement.mock.calls.filter(([tag]) => tag === 'img'),
    ).toHaveLength(20);
    expect(
      screen.queryByTestId('image-resize-controls'),
    ).not.toBeInTheDocument();
    expect(editor.operations).toEqual([]);
    commits.clear();

    await act(async () => {
      Transforms.select(editor, { path: [0, 0], offset: 0 });
      Transforms.insertText(editor, 'x');
    });

    expect(resizing.renders).toBe(0);
    expect([...commits.values()].reduce((sum, value) => sum + value, 0)).toBe(
      0,
    );
    expect(
      createElement.mock.calls.filter(([tag]) => tag === 'img'),
    ).toHaveLength(20);
  });

  it('activates only the selected image and preserves its actual img and loaded state', async () => {
    const { editor, container } = setupImages(2);
    const image = screen.getByAltText('image 0') as HTMLImageElement;
    loadImage(image);
    expect(image.style.visibility).toBe('');

    fireEvent.mouseDown(image.closest('[data-be="image"]')!, { button: 0 });
    await waitFor(() =>
      expect(screen.getAllByTestId('image-resize-controls')).toHaveLength(1),
    );
    expect(screen.getByAltText('image 0')).toBe(image);
    expect(image.style.visibility).toBe('');

    await act(async () =>
      Transforms.select(editor, { path: [0, 0], offset: 0 }),
    );
    expect(
      screen.queryByTestId('image-resize-controls'),
    ).not.toBeInTheDocument();
    expect(screen.getByAltText('image 0')).toBe(image);
    expect(container.querySelectorAll('img')).toHaveLength(2);
  });

  it('persists the final resize immediately once and resolves its path after siblings are inserted', async () => {
    const { editor } = setupImages();
    loadImage(screen.getByAltText('image 0') as HTMLImageElement);
    await act(async () =>
      Transforms.select(editor, { path: [1, 0], offset: 0 }),
    );
    await waitFor(() =>
      expect(screen.getByTestId('image-resize-controls')).toBeInTheDocument(),
    );
    const handlers = resizing.props as ResizeHandlers;
    const finalElement = measuredSize(520, 390);
    const apply = vi.spyOn(editor, 'apply');

    act(() => handlers.onResize({}, 'bottomRight', finalElement));
    expect(apply).not.toHaveBeenCalled();
    expect(editor.children[1]).toMatchObject({ width: 400, height: 300 });
    await act(async () =>
      Transforms.insertNodes(
        editor,
        { type: 'paragraph', children: [{ text: 'inserted above' }] },
        { at: [0] },
      ),
    );
    apply.mockClear();
    await act(async () =>
      handlers.onResizeStop({}, 'bottomRight', finalElement),
    );

    expect(editor.children[2]).toMatchObject({
      url: 'https://images.example/0.png',
      width: 520,
      height: 390,
    });
    expect(editor.children[1]).toMatchObject({ type: 'paragraph' });
    expect(
      apply.mock.calls.filter(([operation]) => operation.type === 'set_node'),
    ).toHaveLength(1);
    await act(async () => editor.undo());
    expect(editor.children[2]).toMatchObject({ width: 400, height: 300 });
  });

  it('ignores pending confirmation and resize callbacks after the editing image unmounts', async () => {
    const confirm = vi.spyOn(Modal, 'confirm').mockReturnValue({
      destroy: vi.fn(),
      update: vi.fn(),
    });
    const { editor, unmount } = setupImages();
    const image = screen.getByAltText('image 0');
    loadImage(image as HTMLImageElement);
    fireEvent.mouseDown(image.closest('[data-be="image"]')!, { button: 0 });
    await waitFor(() =>
      expect(screen.getByTestId('image-resize-controls')).toBeInTheDocument(),
    );
    const handlers = resizing.props as ResizeHandlers;
    fireEvent.mouseEnter(image.closest('[data-be="media-container"]')!);
    fireEvent.click(await screen.findByRole('button', { name: '删除' }));
    const onOk = confirm.mock.calls[0][0].onOk!;
    const before = JSON.stringify(editor.children);
    unmount();
    const apply = vi.spyOn(editor, 'apply');

    await act(async () => {
      onOk();
      handlers.onResizeStop({}, 'bottomRight', measuredSize(520, 390));
    });

    expect(apply).not.toHaveBeenCalled();
    expect(JSON.stringify(editor.children)).toBe(before);
  });

  it('reflects external dimensions and recovers when an upload replaces a failed URL', async () => {
    const { editor } = setupImages();
    fireEvent.error(screen.getByAltText('image 0'));
    expect(
      screen.queryByRole('img', { name: 'image 0' }),
    ).not.toBeInTheDocument();

    await act(async () =>
      Transforms.setNodes(
        editor,
        {
          url: 'https://images.example/replacement.png',
          alt: 'replacement',
          width: 240,
          height: 120,
        },
        { at: [1] },
      ),
    );
    const replacement = screen.getByAltText('replacement') as HTMLImageElement;
    expect(replacement.src).toBe('https://images.example/replacement.png');
    loadImage(replacement, 800, 400);
    expect(
      replacement.closest('[data-testid="resize-image-container"]'),
    ).toHaveStyle({ width: '240px', height: '120px' });

    await act(async () =>
      Transforms.setNodes(editor, { width: 320, height: 160 }, { at: [1] }),
    );
    expect(
      replacement.closest('[data-testid="resize-image-container"]'),
    ).toHaveStyle({ width: '320px', height: '160px' });
    expect(screen.getByAltText('replacement')).toBe(replacement);
  });

  it('ignores the old resize completion after an upload replaces its source', async () => {
    const { editor } = setupImages();
    loadImage(screen.getByAltText('image 0') as HTMLImageElement);
    await act(async () =>
      Transforms.select(editor, { path: [1, 0], offset: 0 }),
    );
    await waitFor(() =>
      expect(screen.getByTestId('image-resize-controls')).toBeInTheDocument(),
    );
    const handlers = resizing.props as ResizeHandlers;
    await act(async () =>
      Transforms.setNodes(
        editor,
        {
          url: 'https://images.example/replacement.png',
          width: 240,
          height: 120,
        },
        { at: [1] },
      ),
    );
    const apply = vi.spyOn(editor, 'apply');
    await act(async () =>
      handlers.onResizeStop({}, 'bottomRight', measuredSize(520, 390)),
    );
    expect(apply).not.toHaveBeenCalled();
    expect(editor.children[1]).toMatchObject({ width: 240, height: 120 });
  });
});

describe('readonly image loading', () => {
  it('creates no extra preloader beyond Ant Design and does not require anonymous CORS', () => {
    const { context } = setupImages(0);
    const createElement = vi.spyOn(document, 'createElement');
    const element = createImage(0);
    const { container } = render(
      <EditorStoreContext.Provider value={context}>
        <ReadonlyEditorImage
          element={element}
          attributes={{ 'data-slate-node': 'element', ref: () => {} }}
        >
          <span>slate leaf</span>
        </ReadonlyEditorImage>
      </EditorStoreContext.Provider>,
    );
    // Ant Design may create its own status probe in addition to the visible img.
    // This component must not add a third image or a CORS-dependent request.
    expect(
      createElement.mock.calls.filter(([tag]) => tag === 'img').length,
    ).toBeLessThanOrEqual(2);
    expect(container.querySelectorAll('img')).toHaveLength(1);
    expect(container.querySelector('img')).not.toHaveAttribute('crossorigin');
    expect(
      screen.queryByTestId('image-resize-controls'),
    ).not.toBeInTheDocument();
  });

  it('keeps image.render and ignores errors from an earlier URL after replacement', () => {
    const { context } = setupImages(0);
    const customRender = vi.fn((props, defaultDom) => defaultDom);
    context.editorProps = { image: { render: customRender } };
    const view = (src: string) => (
      <EditorStoreContext.Provider value={context}>
        <ReadonlyImage src={src} alt="preview" />
      </EditorStoreContext.Provider>
    );
    const { rerender } = render(view('https://images.example/old.png'));
    const oldError = customRender.mock.calls.at(-1)![0].onError;
    fireEvent.error(screen.getByAltText('preview'));
    expect(screen.queryByAltText('preview')).not.toBeInTheDocument();

    rerender(view('https://images.example/new.png'));
    const image = screen.getByAltText('preview');
    const newError = customRender.mock.calls.at(-1)![0].onError;
    act(() => oldError());
    expect(screen.getByAltText('preview')).toBe(image);
    expect(image).toHaveAttribute('src', 'https://images.example/new.png');
    act(() => newError());
    expect(screen.queryByAltText('preview')).not.toBeInTheDocument();
    act(() => oldError());
    expect(screen.queryByAltText('preview')).not.toBeInTheDocument();

    // Returning to the same URL starts a new attempt, independent of its old callback.
    rerender(view('https://images.example/old.png'));
    const retry = screen.getByAltText('preview');
    act(() => oldError());
    expect(screen.getByAltText('preview')).toBe(retry);
    expect(customRender).toHaveBeenCalled();
  });
});
