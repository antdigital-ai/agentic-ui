import { act, cleanup, render } from '@testing-library/react';
import React from 'react';
import { Node, Text, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { afterEach, describe, expect, it } from 'vitest';
import BaseMarkdownEditorSlate from '../BaseMarkdownEditorSlate';
import { JINJA_DOLLAR_PLACEHOLDER } from '../editor/parser/constants';
import { restoreJinjaDollarInChildren } from '../editor/utils/restoreJinjaDollarInChildren';
import type { Elements } from '../el';
import type { MarkdownEditorInstance } from '../types';

afterEach(cleanup);

describe('Slate leaf DOM performance', () => {
  it('renders 100 bold paragraphs with the same leaf budget as plain text', () => {
    const schema: Elements[] = Array.from({ length: 100 }, (_, index) => ({
      type: 'paragraph',
      children: [{ text: `bold-${index}`, bold: true }],
    }));
    const { container } = render(
      <BaseMarkdownEditorSlate
        initSchemaValue={schema}
        toolBar={{ enable: false }}
        floatBar={{ enable: false }}
      />,
    );
    const editable = container.querySelector('[data-slate-editor]')!;
    expect(editable.querySelectorAll('[data-slate-leaf]')).toHaveLength(100);
    expect(editable.querySelectorAll('[data-slate-string]')).toHaveLength(100);
    expect(editable.querySelectorAll('*').length).toBeLessThanOrEqual(400);
    const bold = editable.querySelectorAll('[data-testid="markdown-bold"]');
    expect(bold).toHaveLength(100);
    bold.forEach((leaf) => {
      expect(leaf).toHaveAttribute('data-slate-leaf');
      expect(leaf).toHaveStyle({ fontWeight: 'bold' });
    });
  });

  it('preserves Slate DOM points, editing, marks, and Markdown serialization', async () => {
    const editorRef = React.createRef<MarkdownEditorInstance>();
    const { container } = render(
      <BaseMarkdownEditorSlate
        initSchemaValue={[
          { type: 'paragraph', children: [{ text: 'bold text', bold: true }] },
        ]}
        editorRef={editorRef}
        toolBar={{ enable: false }}
        floatBar={{ enable: false }}
      />,
    );
    const editor = editorRef.current!.markdownEditorRef.current;
    const point = { path: [0, 0], offset: 4 };
    const [domText, offset] = ReactEditor.toDOMPoint(editor, point);
    expect(domText.textContent).toBe('bold text');
    expect(offset).toBe(4);

    await act(async () => {
      Transforms.select(editor, point);
      Transforms.insertText(editor, '!');
    });
    expect(Node.string(editor)).toBe('bold! text');
    expect(editor.selection?.anchor.offset).toBe(5);
    expect(editorRef.current!.store.getMDContent()).toContain('**bold! text**');

    await act(async () => {
      Transforms.setNodes(
        editor,
        { bold: false },
        { at: [0, 0], match: Text.isText },
      );
    });
    expect(container.querySelector('[data-testid="markdown-bold"]')).toBeNull();
    expect(editorRef.current!.store.getMDContent()).toBe('bold! text');
    expect(ReactEditor.toDOMPoint(editor, { path: [0, 0], offset: 5 })[1]).toBe(
      5,
    );
  });

  it('retains ordinary React child identities instead of cloning each leaf', () => {
    const children = [
      <span key="plain">ordinary text</span>,
      <b key="bold">bold</b>,
    ];
    const nested = <React.Fragment>{children}</React.Fragment>;
    expect(restoreJinjaDollarInChildren(children)).toBe(children);
    expect(restoreJinjaDollarInChildren(nested)).toBe(nested);
  });

  it('restores Jinja dollar placeholders while retaining unchanged siblings and keys', () => {
    const stable = <em key="stable">unchanged</em>;
    const changed = (
      <span key="template">{`price ${JINJA_DOLLAR_PLACEHOLDER}(value)`}</span>
    );
    const result = restoreJinjaDollarInChildren([
      stable,
      changed,
    ]) as React.ReactElement[];
    expect(result[0]).toBe(stable);
    expect(result[1]).not.toBe(changed);
    expect(result[1].key).toBe('template');
    const { container } = render(<>{result}</>);
    expect(container.textContent).toBe('unchangedprice $(value)');
  });

  it('restores iterable children without losing children from a generator', () => {
    const placeholder = (
      <span key="template">{`${JINJA_DOLLAR_PLACEHOLDER}foo`}</span>
    );
    function* generateChildren() {
      yield <em key="stable">plain</em>;
      yield placeholder;
    }
    const { container } = render(
      <>
        {restoreJinjaDollarInChildren(new Set([placeholder]))}
        {restoreJinjaDollarInChildren(generateChildren())}
      </>,
    );
    expect(container.textContent).toBe('$fooplain$foo');
  });
});
