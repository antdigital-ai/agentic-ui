import { act, cleanup, render } from '@testing-library/react';
import React from 'react';
import { Node } from 'slate';
import { afterEach, describe, expect, it } from 'vitest';
import { MarkdownEditor } from '../..';
import { parserMdToSchema } from '../editor/parser/parserMdToSchema';
import { EditorStore } from '../editor/store';
import { createMarkdownSlateEditor } from '../editor/utils/createMarkdownSlateEditor';

const FILLER =
  '这一段文字只是用来把条目撑到接近一百个字符，以便触发按空行切块后的分块解析。';
const item = (index: number) => `**结论${index}**：${FILLER}${FILLER}`;
const LOOSE_LIST = [1, 2, 3, 4]
  .map((index) => `${index}. ${item(index)}`)
  .join('\n\n');

const countOf = (text: string, needle: string) => text.split(needle).length - 1;

describe('MarkdownEditor readonly streaming loose lists', () => {
  afterEach(() => cleanup());

  it('renders every streamed list item once', () => {
    const { container, rerender } = render(
      <MarkdownEditor readonly initValue="" />,
    );

    for (let index = 3; index < LOOSE_LIST.length + 3; index += 3) {
      act(() => {
        rerender(
          <MarkdownEditor readonly initValue={LOOSE_LIST.slice(0, index)} />,
        );
      });
    }

    const text = container.textContent || '';
    expect([1, 2, 3, 4].map((index) => countOf(text, `结论${index}`))).toEqual([
      1, 1, 1, 1,
    ]);
  });

  it('keeps the streaming store tree equal to a one-shot parse', () => {
    const editor = createMarkdownSlateEditor();
    const store = new EditorStore({ current: editor });

    for (let index = 3; index < LOOSE_LIST.length + 3; index += 3) {
      store.updateNodeList(parserMdToSchema(LOOSE_LIST.slice(0, index)).schema);
    }

    const listItems = (nodes: Node[]) =>
      nodes
        .filter((node) => /list$/.test(node.type as string))
        .flatMap((list) =>
          (list.children as Node[]).map((listItem) => Node.string(listItem)),
        );

    expect(listItems(editor.children)).toEqual(
      listItems(parserMdToSchema(LOOSE_LIST).schema),
    );
  });
});
