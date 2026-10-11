import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import enUS from 'antd/locale/en_US';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { I18nContext } from '../../I18n';
import type { MarkdownEditorPlugin } from '../../MarkdownEditor/plugin';
import type { MarkdownEditorProps } from '../../MarkdownEditor/types';
import { BubbleConfigContext } from '../BubbleConfigProvide';
import { MarkdownPreview } from '../MessagesContent/MarkdownPreview';
import { ReadonlyMarkdownContent } from '../MessagesContent/ReadonlyMarkdownContent';

const { editorRender, rendererRender } = vi.hoisted(() => ({
  editorRender: vi.fn(),
  rendererRender: vi.fn(),
}));

vi.mock('../../MarkdownEditor', () => ({
  MarkdownEditor: (props: MarkdownEditorProps) => {
    const [draft, setDraft] = React.useState(props.initValue);
    editorRender(props);
    return (
      <p data-testid="slate-editor">
        {draft}
        {props.readonly === false && (
          <input
            aria-label="Edit draft"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
        )}
      </p>
    );
  },
}));

vi.mock('../../MarkdownRenderer', () => ({
  MarkdownRenderer: (props: { content: string }) => {
    const { language } = React.useContext(I18nContext);
    rendererRender(props);
    return (
      <p data-testid="markdown-renderer" data-language={language}>
        {props.content}
      </p>
    );
  },
}));

const preview = (config?: MarkdownEditorProps, readonly?: boolean) => (
  <MarkdownPreview
    content="message body"
    beforeContent={null}
    afterContent={null}
    markdownRenderConfig={config}
    readonly={readonly}
  />
);

describe('Bubble readonly renderer selection', () => {
  beforeEach(() => {
    editorRender.mockClear();
    rendererRender.mockClear();
  });

  it('uses the lightweight renderer for ordinary readonly Markdown', () => {
    render(preview());
    expect(screen.getByTestId('markdown-renderer')).toHaveTextContent(
      'message body',
    );
    expect(editorRender).not.toHaveBeenCalled();
  });

  it('flushes a stopped response even when its finished flag is still false', () => {
    const renderPreview = (isAborted: boolean) => (
      <MarkdownPreview
        content="Partial response"
        beforeContent={null}
        afterContent={null}
        typing={!isAborted}
        originData={{ isFinished: false, isAborted, isLast: true }}
        markdownRenderConfig={{ streaming: true }}
      />
    );
    const { rerender } = render(renderPreview(false));
    expect(rendererRender.mock.lastCall?.[0].isFinished).toBe(false);

    rerender(renderPreview(true));

    expect(rendererRender.mock.lastCall?.[0].isFinished).toBe(true);
    expect(rendererRender.mock.lastCall?.[0].streaming).toBe(false);
    expect(screen.getByTestId('markdown-renderer')).toHaveTextContent(
      'Partial response',
    );
  });

  it.each([
    { renderMode: 'slate' as const },
    { renderType: 'slate' as const },
    { editorRef: React.createRef() },
    {
      initSchemaValue: [
        { type: 'paragraph' as const, children: [{ text: 'schema' }] },
      ],
    },
    { eleItemRender: () => null },
    { leafRender: () => null },
    { comment: { enable: true } },
    { onSelectionChange: vi.fn() },
    { image: { render: () => null } },
    { tableConfig: { pure: true } },
    { tableConfig: { actions: { copy: 'csv' } } },
    { codeProps: { render: () => null } },
    { codeProps: { hideToolBar: true } },
    { apaasify: { enable: true, render: () => null } },
  ] satisfies MarkdownEditorProps[])(
    'preserves Slate-specific configuration: %j',
    (config) => {
      render(preview(config));
      expect(screen.getByTestId('slate-editor')).toBeInTheDocument();
      expect(rendererRender).not.toHaveBeenCalled();
    },
  );

  it('keeps editable messages in Slate even when markdown mode is requested', () => {
    render(preview({ renderMode: 'markdown' }, false));
    expect(screen.getByTestId('slate-editor')).toBeInTheDocument();
    expect(editorRender.mock.lastCall?.[0].readonly).toBe(false);
  });

  it('retains an edited draft when automatic readonly mode is enabled', () => {
    const { rerender } = render(preview(undefined, false));
    fireEvent.change(screen.getByLabelText('Edit draft'), {
      target: { value: 'Edited draft' },
    });
    rerender(preview(undefined, true));
    expect(screen.getByTestId('slate-editor')).toHaveTextContent(
      'Edited draft',
    );
    expect(screen.queryByTestId('markdown-renderer')).not.toBeInTheDocument();
  });

  it('retains the editor when hover actions appear, disappear or finish typing', () => {
    const renderPreview = (
      extraVisible: boolean,
      typing = false,
      extra: React.ReactNode = <button>Actions</button>,
    ) => (
      <BubbleConfigContext.Provider
        value={{ standalone: false, extraShowOnHover: true }}
      >
        <MarkdownPreview
          content="message body"
          beforeContent={null}
          afterContent={null}
          readonly={false}
          extra={extra}
          extraVisible={extraVisible}
          typing={typing}
        />
      </BubbleConfigContext.Provider>
    );
    const { rerender } = render(renderPreview(false));
    const editor = screen.getByTestId('slate-editor');
    fireEvent.change(screen.getByLabelText('Edit draft'), {
      target: { value: 'Unsaved draft' },
    });
    for (const next of [
      renderPreview(true),
      renderPreview(true, true),
      renderPreview(true),
      renderPreview(true, false, null),
      renderPreview(false),
    ]) {
      rerender(next);
      expect(screen.getByTestId('slate-editor')).toBe(editor);
      expect(screen.getByLabelText('Edit draft')).toHaveValue('Unsaved draft');
    }
  });

  it('retains edited drafts when switching between inline and hover actions', () => {
    const renderPreview = (hover: boolean, readonly = false) => (
      <BubbleConfigContext.Provider
        value={{ standalone: false, extraShowOnHover: hover }}
      >
        <MarkdownPreview
          content="message body"
          beforeContent={null}
          afterContent={null}
          readonly={readonly}
          extra={<button>Actions</button>}
        />
      </BubbleConfigContext.Provider>
    );
    const { rerender } = render(renderPreview(false));
    const editor = screen.getByTestId('slate-editor');
    fireEvent.change(screen.getByLabelText('Edit draft'), {
      target: { value: 'Unsaved draft' },
    });
    for (const next of [
      renderPreview(true),
      renderPreview(false),
      renderPreview(true, true),
      renderPreview(false, true),
    ]) {
      rerender(next);
      expect(screen.getByTestId('slate-editor')).toBe(editor);
      expect(editor).toHaveTextContent('Unsaved draft');
    }
  });

  it('releases hidden hover actions while retaining the editor draft', async () => {
    const { container } = render(
      <BubbleConfigContext.Provider
        value={{ standalone: false, extraShowOnHover: true }}
      >
        <MarkdownPreview
          content="message body"
          beforeContent={null}
          afterContent={null}
          readonly={false}
          extra={<button>Hover actions</button>}
        />
      </BubbleConfigContext.Provider>,
    );
    const editor = screen.getByTestId('slate-editor');
    fireEvent.change(screen.getByLabelText('Edit draft'), {
      target: { value: 'Unsaved draft' },
    });
    const trigger = container.firstElementChild!;
    expect(screen.queryByRole('button', { name: 'Hover actions' })).toBeNull();
    fireEvent.mouseEnter(trigger);
    const action = await screen.findByRole('button', { name: 'Hover actions' });
    const popup = action.closest('.ant-popover')!;
    fireEvent.mouseLeave(trigger);
    await waitFor(() => expect(popup.className).toContain('-leave-active'));
    fireEvent.animationEnd(popup);
    await waitFor(() =>
      expect(
        screen.queryByRole('button', { name: 'Hover actions', hidden: true }),
      ).toBeNull(),
    );
    expect(screen.getByTestId('slate-editor')).toBe(editor);
    expect(screen.getByLabelText('Edit draft')).toHaveValue('Unsaved draft');
  });

  it('keeps table full-screen actions on the lightweight path', () => {
    render(preview({ tableConfig: { actions: { fullScreen: 'drawer' } } }));
    expect(rendererRender.mock.lastCall?.[0]).toMatchObject({
      tableConfig: { actions: { fullScreen: 'drawer' } },
    });
    expect(editorRender).not.toHaveBeenCalled();
  });

  it.each([undefined, {}])(
    'preserves custom Slate nodes when no renderer implementation is provided: %j',
    (renderer) => {
      const plugins: MarkdownEditorPlugin[] = [
        { elements: { custom: () => null }, renderer },
      ];
      render(preview({ plugins }));
      expect(screen.getByTestId('slate-editor')).toBeInTheDocument();
    },
  );

  it('preserves parser-only custom nodes', () => {
    render(
      preview({
        plugins: [
          { parseMarkdown: [{ match: () => true, convert: () => null }] },
        ],
      }),
    );
    expect(screen.getByTestId('slate-editor')).toBeInTheDocument();
  });

  it('preserves Slate plugin semantics even when a renderer is also provided', () => {
    render(
      preview({
        plugins: [
          {
            elements: { custom: () => null },
            renderer: { rendererComponents: { custom: () => null } },
          },
        ],
      }),
    );
    expect(screen.getByTestId('slate-editor')).toBeInTheDocument();
  });

  it('accepts renderer-only plugins automatically', () => {
    const plugins: MarkdownEditorPlugin[] = [
      {
        renderer: { rendererComponents: { custom: () => null } },
      },
    ];
    const eleRender = vi.fn();
    const formula = { enable: false };
    render(preview({ plugins, eleRender, className: 'custom-body', formula }));
    expect(rendererRender.mock.lastCall?.[0]).toMatchObject({
      plugins,
      eleRender,
      className: 'custom-body',
      formula,
    });
    expect(editorRender).not.toHaveBeenCalled();
  });

  it('respects an explicit markdown request for existing renderer integrations', () => {
    render(preview({ renderMode: 'markdown', editorRef: React.createRef() }));
    expect(screen.getByTestId('markdown-renderer')).toBeInTheDocument();
  });

  it('inherits the Ant Design English locale on the lightweight path', () => {
    render(<ConfigProvider locale={enUS}>{preview()}</ConfigProvider>);
    expect(screen.getByTestId('markdown-renderer')).toHaveAttribute(
      'data-language',
      'en-US',
    );
  });

  it.each([
    '<!-- {"type":"card","url":"https://example.com"} -->\n[Card](https://example.com)',
    '<!-- {"chartType":"line"} -->\n| Name | Value |\n| --- | --- |\n| A | 1 |',
  ])(
    'preserves editor configuration comments in messages and reference previews: %s',
    (content) => {
      const { rerender } = render(
        <MarkdownPreview
          content={content}
          beforeContent={null}
          afterContent={null}
        />,
      );
      expect(screen.getByTestId('slate-editor')).toBeInTheDocument();
      rerender(<ReadonlyMarkdownContent content={content} />);
      expect(screen.getByTestId('slate-editor')).toBeInTheDocument();
      rerender(
        <MarkdownPreview
          content={content}
          beforeContent={null}
          afterContent={null}
          markdownRenderConfig={{ renderMode: 'markdown' }}
        />,
      );
      expect(screen.getByTestId('markdown-renderer')).toBeInTheDocument();
    },
  );
});
