import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import React from 'react';
import { createEditor, Transforms } from 'slate';
import { Editable, ReactEditor, Slate, withReact } from 'slate-react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Suggestion } from '../../../../../MarkdownInputField/Suggestion';
import { TagPopup } from '../../../../editor/elements/TagPopup';

vi.mock('antd', async () => {
  const actual = await vi.importActual<typeof import('antd')>('antd');
  return {
    ...actual,
    Dropdown: ({ children, open, onOpenChange, menu, placement }: any) => (
      <div>
        <button
          type="button"
          onClick={() => onOpenChange?.(!open)}
          aria-label={placement === 'top' ? 'shared popup' : 'tag popup'}
        />
        {open &&
          menu?.items?.map((item: any) => (
            <button
              type="button"
              key={item.key}
              onClick={() => {
                item.onClick?.();
                menu.onClick?.({ key: item.key });
              }}
            >
              {item.label}
            </button>
          ))}
        {children}
      </div>
    ),
  };
});

afterEach(() => vi.restoreAllMocks());

const initialValue = [{ type: 'paragraph', children: [{ text: 'hello' }] }];

function renderTags(items?: React.ComponentProps<typeof TagPopup>['items']) {
  const editor = withReact(createEditor());
  const tagRender = vi.fn((_props, dom) => dom);
  const toSlateNode = vi
    .spyOn(ReactEditor, 'toSlateNode')
    .mockImplementation(() => editor.children[0]);
  const findPath = vi.spyOn(ReactEditor, 'findPath').mockReturnValue([0, 0]);
  const view = (currentItems = items) => (
    <Suggestion tagInputProps={{ items: currentItems }}>
      <Slate editor={editor} initialValue={initialValue}>
        {[0, 1, 2].map((index) => (
          <TagPopup
            key={index}
            type="dropdown"
            text={`$tag${index}`}
            items={currentItems}
            tagRender={tagRender}
          >
            <span>{`$tag${index}`}</span>
          </TagPopup>
        ))}
      </Slate>
    </Suggestion>
  );
  return { ...render(view()), editor, tagRender, toSlateNode, findPath, view };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolver) => {
    resolve = resolver;
  });
  return { promise, resolve };
}

describe('TagPopup performance regressions', () => {
  it('does not rerender unrelated tags or resolve their paths on text and selection changes', async () => {
    const { editor, tagRender, toSlateNode, findPath } = renderTags();
    await act(async () => {});
    tagRender.mockClear();
    toSlateNode.mockClear();
    findPath.mockClear();

    await act(async () => {
      Transforms.insertText(editor, 'x', { at: { path: [0, 0], offset: 0 } });
      await Promise.resolve();
    });
    await act(async () => {
      Transforms.select(editor, { path: [0, 0], offset: 1 });
      await Promise.resolve();
    });

    expect(tagRender).not.toHaveBeenCalled();
    expect(toSlateNode).not.toHaveBeenCalled();
    expect(findPath).not.toHaveBeenCalled();
  });

  it('loads only the opened tag, including when loader identity changes while closed', async () => {
    const items = vi.fn(async () => [{ label: 'choice', key: 'choice' }]);
    const { rerender, view } = renderTags(items);
    await act(async () => {});
    expect(items).not.toHaveBeenCalled();

    const nextItems = vi.fn(async () => [{ label: 'choice', key: 'choice' }]);
    rerender(view(nextItems));
    await act(async () => {});
    expect(nextItems).not.toHaveBeenCalled();

    fireEvent.click(screen.getAllByRole('button', { name: 'tag popup' })[0]);
    await waitFor(() => expect(nextItems).toHaveBeenCalledTimes(1));
    expect(screen.getByRole('button', { name: 'choice' })).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button', { name: 'tag popup' })[0]);
    await act(async () => {});
    expect(nextItems).toHaveBeenCalledTimes(1);
  });

  it('loads panel candidates once through the shared Suggestion', async () => {
    const editor = withReact(createEditor());
    const items = vi.fn(async () => [{ label: 'panel choice', key: 'choice' }]);
    vi.spyOn(ReactEditor, 'toSlateNode').mockImplementation(
      () => editor.children[0],
    );
    vi.spyOn(ReactEditor, 'findPath').mockReturnValue([0, 0]);
    render(
      <Suggestion tagInputProps={{ items, type: 'panel' }}>
        <Slate editor={editor} initialValue={initialValue}>
          {[0, 1, 2].map((index) => (
            <TagPopup
              key={index}
              type="panel"
              text={`$tag${index}`}
              items={items}
            >
              <span>{`$tag${index}`}</span>
            </TagPopup>
          ))}
        </Slate>
      </Suggestion>,
    );
    expect(items).not.toHaveBeenCalled();
    fireEvent.click(screen.getByText('$tag0'));
    await waitFor(() => expect(items).toHaveBeenCalledTimes(1));
    expect(items).toHaveBeenCalledWith(
      expect.objectContaining({ text: '$tag0' }),
    );
  });

  it('ignores stale dropdown responses after the tag text changes', async () => {
    const editor = withReact(createEditor());
    const oldRequest = deferred<{ label: string; key: string }[]>();
    const newRequest = deferred<{ label: string; key: string }[]>();
    const items = vi
      .fn()
      .mockReturnValueOnce(oldRequest.promise)
      .mockReturnValueOnce(newRequest.promise);
    const view = (text: string) => (
      <Slate editor={editor} initialValue={initialValue}>
        <TagPopup type="dropdown" open text={text} items={items}>
          <span>{text}</span>
        </TagPopup>
      </Slate>
    );
    const { rerender } = render(view('$old'));
    rerender(view('$new'));
    await act(async () =>
      newRequest.resolve([{ label: 'new choice', key: 'new' }]),
    );
    expect(
      screen.getByRole('button', { name: 'new choice' }),
    ).toBeInTheDocument();
    await act(async () =>
      oldRequest.resolve([{ label: 'old choice', key: 'old' }]),
    );
    expect(
      screen.queryByRole('button', { name: 'old choice' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'new choice' }),
    ).toBeInTheDocument();
  });

  it('resolves the current Slate path when selecting after preceding nodes are inserted', async () => {
    const editor = withReact(createEditor());
    const onSelect = vi.fn();
    render(
      <Slate
        editor={editor}
        initialValue={[
          { type: 'paragraph', children: [{ text: '$tag', tag: true }] },
        ]}
      >
        <Editable
          renderLeaf={(props) => (
            <span {...props.attributes}>
              {props.leaf.tag ? (
                <TagPopup
                  type="dropdown"
                  text={props.leaf.text}
                  onSelect={onSelect}
                  tagRender={(tagProps, dom) => (
                    <>
                      {dom}
                      <button
                        type="button"
                        contentEditable={false}
                        onClick={() => tagProps.onSelect('selected')}
                      >
                        select tag
                      </button>
                    </>
                  )}
                >
                  {props.children}
                </TagPopup>
              ) : (
                props.children
              )}
            </span>
          )}
        />
      </Slate>,
    );
    await act(async () => {
      Transforms.insertNodes(
        editor,
        { type: 'paragraph', children: [{ text: 'before' }] },
        { at: [0] },
      );
      await Promise.resolve();
    });
    fireEvent.click(screen.getByRole('button', { name: 'select tag' }));
    expect(onSelect).toHaveBeenCalledWith('selected', [1, 0], undefined);
  });
});
