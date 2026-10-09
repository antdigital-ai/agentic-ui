import { render } from '@testing-library/react';
import React from 'react';
import type { NodeEntry } from 'slate';
import { describe, expect, it, vi } from 'vitest';
import BaseMarkdownEditorSlate from '../BaseMarkdownEditorSlate';
import type { EditorEditableProps } from '../editor/components/EditorEditable';

const captured = vi.hoisted(() => ({
  props: null as EditorEditableProps | null,
}));
vi.mock('../editor/components/EditorEditable', async (importOriginal) => {
  const original =
    await importOriginal<
      typeof import('../editor/components/EditorEditable')
    >();
  return {
    ...original,
    EditorEditable: (props: EditorEditableProps) => {
      captured.props = props;
      return <original.EditorEditable {...props} />;
    },
  };
});

describe('editor decoration configuration', () => {
  it('keeps decoration stable for unrelated props and refreshes Jinja/comment switches', () => {
    const schema = [
      { type: 'paragraph' as const, children: [{ text: '{{ name }}' }] },
    ];
    const { rerender } = render(
      <BaseMarkdownEditorSlate
        initSchemaValue={schema}
        floatBar={{ enable: false }}
      />,
    );
    const initial = captured.props!.decorate!;
    expect(initial([schema[0], [0]] as NodeEntry)).toHaveLength(0);

    rerender(
      <BaseMarkdownEditorSlate
        initSchemaValue={schema}
        placeholder="Updated placeholder"
        floatBar={{ enable: false }}
      />,
    );
    expect(captured.props!.decorate).toBe(initial);

    rerender(
      <BaseMarkdownEditorSlate
        initSchemaValue={schema}
        jinja={{ enable: true }}
        floatBar={{ enable: false }}
      />,
    );
    const jinja = captured.props!.decorate!;
    expect(jinja).not.toBe(initial);
    expect(jinja([schema[0], [0]] as NodeEntry)).toHaveLength(3);

    rerender(
      <BaseMarkdownEditorSlate
        initSchemaValue={schema}
        jinja={{ enable: false }}
        comment={{ enable: true }}
        floatBar={{ enable: false }}
      />,
    );
    const commented = captured.props!.decorate!;
    expect(commented).not.toBe(jinja);
    expect(commented([schema[0], [0]] as NodeEntry)).toHaveLength(0);

    rerender(
      <BaseMarkdownEditorSlate
        initSchemaValue={schema}
        comment={{ enable: false }}
        floatBar={{ enable: false }}
      />,
    );
    expect(captured.props!.decorate).not.toBe(commented);
  });
});
