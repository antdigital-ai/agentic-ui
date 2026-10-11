import { act, render } from '@testing-library/react';
import React from 'react';
import { createEditor, Editor, Point, Range, Transforms } from 'slate';
import type { RenderElementProps } from 'slate-react';
import { Editable, ReactEditor, Slate, withReact } from 'slate-react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { withErrorReporting } from '../../editor/plugins/catchError';
import { useElementSelected } from '../../hooks/editor';

afterEach(() => vi.restoreAllMocks());

describe('element selection subscriptions', () => {
  it('caches paths, renders only changed selection consumers and ignores removed elements', async () => {
    const editor = withErrorReporting(withReact(createEditor()));
    editor.children = [
      { type: 'paragraph', children: [{ text: 'type here' }] },
      ...Array.from({ length: 20 }, (_, index) => ({
        type: 'media' as const,
        url: `https://cdn.example/${index}.png`,
        children: [{ text: '' }],
      })),
    ];
    const renders = vi.fn();
    const Probe = (props: RenderElementProps) => {
      const selected = useElementSelected(props.element);
      if (props.element.type === 'media') renders(props.element);
      return (
        <div
          {...props.attributes}
          data-testid={props.element.url || 'paragraph'}
          data-selected={String(selected)}
        >
          {props.children}
        </div>
      );
    };
    const { getByTestId, queryByTestId } = render(
      <Slate editor={editor} initialValue={editor.children}>
        <Editable renderElement={(props) => <Probe {...props} />} />
      </Slate>,
    );
    await act(async () =>
      Transforms.select(editor, { path: [0, 0], offset: 0 }),
    );
    const findPath = vi.spyOn(ReactEditor, 'findPath');
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    renders.mockClear();

    await act(async () =>
      Transforms.select(editor, { path: [1, 0], offset: 0 }),
    );
    expect(getByTestId('https://cdn.example/0.png')).toHaveAttribute(
      'data-selected',
      'true',
    );
    expect(renders).toHaveBeenCalledTimes(1);
    expect(
      findPath.mock.calls.filter(
        ([, node]) => 'type' in node && node.type === 'media',
      ),
    ).toHaveLength(0);
    await act(async () =>
      Transforms.select(editor, { path: [0, 0], offset: 0 }),
    );
    renders.mockClear();
    findPath.mockClear();
    await act(async () => editor.insertText('x'));
    expect(renders).not.toHaveBeenCalled();
    expect(
      findPath.mock.calls.filter(
        ([, node]) => 'type' in node && node.type === 'media',
      ),
    ).toHaveLength(0);

    // Structural edits refresh the path even without a FloatBar selection subject.
    await act(async () =>
      Transforms.insertNodes(
        editor,
        { type: 'paragraph', children: [{ text: 'new sibling' }] },
        { at: [0] },
      ),
    );
    await act(async () =>
      Transforms.select(editor, { path: [2, 0], offset: 0 }),
    );
    expect(getByTestId('https://cdn.example/0.png')).toHaveAttribute(
      'data-selected',
      'true',
    );
    await act(async () => Transforms.removeNodes(editor, { at: [2] }));
    expect(queryByTestId('https://cdn.example/0.png')).toBeNull();
    expect(Editor.hasPath(editor, editor.selection!.focus.path)).toBe(true);
    expect(error).not.toHaveBeenCalled();
  });

  it('matches nested selection ranges without walking element text boundaries', async () => {
    const editor = withReact(createEditor());
    const initialValue = [
      { type: 'paragraph' as const, children: [{ text: 'before' }] },
      {
        type: 'blockquote' as const,
        children: [
          { type: 'paragraph' as const, children: [{ text: 'first nested' }] },
          { type: 'paragraph' as const, children: [{ text: 'last nested' }] },
        ],
      },
      { type: 'paragraph' as const, children: [{ text: 'after' }] },
    ];
    const range = vi.spyOn(Editor, 'range');
    const Probe = (props: RenderElementProps) => {
      const selected = useElementSelected(props.element);
      return (
        <div
          {...props.attributes}
          data-testid={`selected-${ReactEditor.findPath(editor, props.element).join('-')}`}
          data-selected={String(selected)}
        >
          {props.children}
        </div>
      );
    };
    const view = render(
      <Slate editor={editor} initialValue={initialValue}>
        <Editable renderElement={(props) => <Probe {...props} />} />
      </Slate>,
    );
    const cases: [Point, Point][] = [
      [
        { path: [0, 0], offset: 6 },
        { path: [0, 0], offset: 6 },
      ],
      [
        { path: [1, 0, 0], offset: 0 },
        { path: [1, 0, 0], offset: 0 },
      ],
      [
        { path: [1, 1, 0], offset: 4 },
        { path: [1, 0, 0], offset: 2 },
      ],
      [
        { path: [0, 0], offset: 4 },
        { path: [2, 0], offset: 2 },
      ],
      [
        { path: [2, 0], offset: 0 },
        { path: [2, 0], offset: 0 },
      ],
    ];
    for (const [anchor, focus] of cases) {
      await act(async () => Transforms.select(editor, { anchor, focus }));
      const boundaryReads = range.mock.calls.filter(
        ([, at, to]) => Array.isArray(at) && to === undefined,
      ).length;
      for (const path of [[0], [1], [1, 0], [1, 1], [2]]) {
        const nodeRange = Editor.range(editor, path);
        expect(view.getByTestId(`selected-${path.join('-')}`)).toHaveAttribute(
          'data-selected',
          String(!!Range.intersection(nodeRange, editor.selection!)),
        );
      }
      // Only the reference calculation above may request node boundaries.
      expect(boundaryReads).toBe(0);
      range.mockClear();
    }
  });
});
