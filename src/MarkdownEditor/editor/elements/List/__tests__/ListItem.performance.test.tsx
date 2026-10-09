import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import React from 'react';
import { createEditor, Editor, Transforms, type Descendant } from 'slate';
import {
  Editable,
  Slate,
  withReact,
  type RenderElementProps,
} from 'slate-react';
import { describe, expect, it, vi } from 'vitest';
import { EditorStoreContext } from '../../../store';
import { ListItem } from '../ListItem';

vi.mock('antd', async (importOriginal) => {
  const original = await importOriginal<typeof import('antd')>();
  return {
    ...original,
    Dropdown: ({
      children,
      open,
      onOpenChange,
      menu,
    }: React.ComponentProps<typeof original.Dropdown>) => (
      <div>
        <button
          type="button"
          onClick={() => onOpenChange?.(!open, { source: 'trigger' })}
        >
          Choose assignee
        </button>
        {children}
        {open &&
          menu?.items?.map((item) =>
            item && 'label' in item ? (
              <button
                key={item.key}
                type="button"
                onClick={() =>
                  menu.onClick?.({ key: String(item.key) } as Parameters<
                    NonNullable<typeof menu.onClick>
                  >[0])
                }
              >
                {item.label}
              </button>
            ) : null,
          )}
      </div>
    ),
  };
});

const createTasks = (count: number): Descendant[] => [
  {
    type: 'bulleted-list',
    children: Array.from({ length: count }, (_, index) => ({
      type: 'list-item',
      id: String(index),
      checked: false,
      mentions: [],
      children: [{ type: 'paragraph', children: [{ text: `Task ${index}` }] }],
    })),
  },
];

const renderElement = (props: RenderElementProps) => {
  if (props.element.type === 'list-item')
    return (
      <ListItem
        {...props}
        element={props.element as Parameters<typeof ListItem>[0]['element']}
      />
    );
  if (props.element.type === 'bulleted-list')
    return <ul {...props.attributes}>{props.children}</ul>;
  return <p {...props.attributes}>{props.children}</p>;
};

describe('task assignee loading with real Slate', () => {
  it('does not load or mutate any of 50 task nodes on mount; loads only the opened item', async () => {
    const editor = withReact(createEditor());
    const loadMentions = vi.fn(async () => [{ name: 'Alice', id: 'alice' }]);
    const setNodes = vi.spyOn(Transforms, 'setNodes');
    try {
      render(
        <EditorStoreContext.Provider
          value={
            {
              store: { dragStart: vi.fn() },
              editorProps: { comment: { loadMentions } },
              readonly: false,
            } as unknown as React.ContextType<typeof EditorStoreContext>
          }
        >
          <Slate editor={editor} initialValue={createTasks(50)}>
            <Editable renderElement={renderElement} />
          </Slate>
        </EditorStoreContext.Provider>,
      );
      await act(async () => {
        await Promise.resolve();
      });
      expect(loadMentions).not.toHaveBeenCalled();
      expect(setNodes).not.toHaveBeenCalled();

      fireEvent.click(
        screen.getAllByRole('button', { name: 'Choose assignee' })[0],
      );
      await waitFor(() =>
        expect(
          screen.getByRole('button', { name: 'Alice' }),
        ).toBeInTheDocument(),
      );
      expect(loadMentions).toHaveBeenCalledTimes(1);
      fireEvent.click(screen.getByRole('button', { name: 'Alice' }));
      await waitFor(() => expect(setNodes).toHaveBeenCalledTimes(1));
      expect(Editor.node(editor, [0, 0])[0]).toMatchObject({
        mentions: [{ name: 'Alice', id: 'alice' }],
      });
      expect(Editor.node(editor, [0, 1])[0]).toMatchObject({ mentions: [] });
    } finally {
      setNodes.mockRestore();
    }
  });

  it('never requests candidates in readonly mode', async () => {
    const editor = withReact(createEditor());
    const loadMentions = vi.fn(async () => []);
    render(
      <EditorStoreContext.Provider
        value={
          {
            store: {},
            editorProps: { comment: { loadMentions } },
            readonly: true,
          } as React.ContextType<typeof EditorStoreContext>
        }
      >
        <Slate editor={editor} initialValue={createTasks(3)}>
          <Editable readOnly renderElement={renderElement} />
        </Slate>
      </EditorStoreContext.Provider>,
    );
    await act(async () => {
      await Promise.resolve();
    });
    expect(loadMentions).not.toHaveBeenCalled();
    expect(
      screen.queryByRole('button', { name: 'Choose assignee' }),
    ).toBeNull();
  });

  it('clears loading when closed and ignores the old request before reopening', async () => {
    const editor = withReact(createEditor());
    let resolveOld: (users: { name: string; id: string }[]) => void = () => {};
    const pending = new Promise<{ name: string; id: string }[]>((resolve) => {
      resolveOld = resolve;
    });
    const loadMentions = vi
      .fn()
      .mockReturnValueOnce(pending)
      .mockResolvedValue([{ name: 'New user', id: 'new' }]);
    const { container } = render(
      <EditorStoreContext.Provider
        value={
          {
            store: {},
            editorProps: { comment: { loadMentions } },
            readonly: false,
          } as unknown as React.ContextType<typeof EditorStoreContext>
        }
      >
        <Slate editor={editor} initialValue={createTasks(1)}>
          <Editable renderElement={renderElement} />
        </Slate>
      </EditorStoreContext.Provider>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Choose assignee' }));
    await waitFor(() => expect(loadMentions).toHaveBeenCalledTimes(1));
    expect(container.querySelector('.anticon-loading')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Choose assignee' }));
    expect(container.querySelector('.anticon-loading')).toBeNull();
    await act(async () => {
      resolveOld([{ name: 'Old user', id: 'old' }]);
      await pending;
    });

    fireEvent.click(screen.getByRole('button', { name: 'Choose assignee' }));
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'New user' }),
      ).toBeInTheDocument(),
    );
    expect(loadMentions).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole('button', { name: 'Old user' })).toBeNull();
    expect(Editor.node(editor, [0, 0])[0]).toMatchObject({ mentions: [] });
  });
});
