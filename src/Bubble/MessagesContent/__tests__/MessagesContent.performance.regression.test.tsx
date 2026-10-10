import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { BubbleConfigContext } from '../../BubbleConfigProvide';
import type { MessageBubbleData } from '../../type';
import { BubbleMessageDisplay } from '../index';
import { MarkdownPreview } from '../MarkdownPreview';

const { editorRender } = vi.hoisted(() => ({ editorRender: vi.fn() }));

vi.mock('../../../MarkdownEditor', () => ({
  MarkdownEditor: (props: { initValue: string; readonly: boolean }) => {
    editorRender(props);
    return (
      <p data-testid="markdown-editor" data-readonly={String(props.readonly)}>
        {props.initValue}
      </p>
    );
  },
}));

vi.mock('../../../MarkdownRenderer', () => ({
  MarkdownRenderer: ({ content }: { content: string }) => <p>{content}</p>,
}));

vi.mock('../BubbleExtra', () => ({
  BubbleExtra: ({ readonly }: { readonly: boolean }) => (
    <span data-testid="actions-readonly">{String(readonly)}</span>
  ),
}));

vi.mock('../DocInfo', () => ({ DocInfoList: () => null }));
vi.mock('../EXCEPTION', () => ({ EXCEPTION: () => null }));

const originData: MessageBubbleData = {
  id: 'message',
  role: 'assistant',
  content: 'same body',
  createAt: 1,
  updateAt: 1,
  isFinished: true,
};

describe('message content updates without reparsing unchanged Markdown', () => {
  it('updates readonly actions when the body and message identity are unchanged', () => {
    const content = <span>custom body</span>;
    const { rerender } = render(
      <BubbleMessageDisplay
        content={content}
        originData={originData}
        readonly={false}
      />,
    );
    expect(screen.getByTestId('actions-readonly')).toHaveTextContent('false');

    rerender(
      <BubbleMessageDisplay
        content={content}
        originData={originData}
        readonly
      />,
    );
    expect(screen.getByTestId('actions-readonly')).toHaveTextContent('true');
  });

  it('uses the latest double-click handler for unchanged custom content', () => {
    const content = <span>custom body</span>;
    const first = vi.fn();
    const latest = vi.fn();
    const { rerender } = render(
      <BubbleMessageDisplay
        content={content}
        originData={originData}
        onDoubleClick={first}
      />,
    );
    rerender(
      <BubbleMessageDisplay
        content={content}
        originData={originData}
        onDoubleClick={latest}
      />,
    );
    fireEvent.doubleClick(screen.getByTestId('message-box-content'));
    expect(latest).toHaveBeenCalledTimes(1);
    expect(first).not.toHaveBeenCalled();
  });

  it('updates the loading layout when the shared compact setting changes', () => {
    const loadingData = { ...originData, isFinished: false };
    const body = (
      <BubbleMessageDisplay content="..." originData={loadingData} />
    );
    const { rerender } = render(
      <BubbleConfigContext.Provider
        value={{ standalone: false, compact: false }}
      >
        {body}
      </BubbleConfigContext.Provider>,
    );
    rerender(
      <BubbleConfigContext.Provider
        value={{ standalone: false, compact: true }}
      >
        {body}
      </BubbleConfigContext.Provider>,
    );
    expect(screen.getByTestId('message-content')).toHaveClass(
      'ant-agentic-ui-display-messages-content-loading-compact',
    );
  });

  it('keeps the same Markdown editor when only feedback changes', () => {
    editorRender.mockClear();
    const config = { extraRender: false as const };
    const { rerender } = render(
      <BubbleMessageDisplay
        content="same body"
        placement="right"
        originData={originData}
        bubbleRenderConfig={config}
      />,
    );
    expect(editorRender).toHaveBeenCalledTimes(1);
    rerender(
      <BubbleMessageDisplay
        content="same body"
        placement="right"
        originData={{ ...originData, feedback: 'thumbsUp' }}
        bubbleRenderConfig={config}
      />,
    );
    expect(editorRender).toHaveBeenCalledTimes(1);
    expect(screen.getByText('same body')).toBeInTheDocument();
  });

  it('preserves an explicit initValue from the Markdown configuration', () => {
    render(
      <MarkdownPreview
        content="original body"
        beforeContent={null}
        afterContent={null}
        markdownRenderConfig={{ initValue: 'configured body' }}
      />,
    );
    expect(screen.getByTestId('markdown-editor')).toHaveTextContent(
      'configured body',
    );
    expect(screen.queryByText('original body')).not.toBeInTheDocument();
  });

  it.each(['renderMode', 'renderType'] as const)(
    'resolves the standalone %s shortcut ahead of the nested configuration',
    (name) => {
      render(
        <BubbleMessageDisplay
          content="renderer body"
          placement="right"
          originData={originData}
          bubbleRenderConfig={{ extraRender: false }}
          markdownRenderConfig={{ renderMode: 'slate' }}
          {...{ [name]: 'markdown' as const }}
        />,
      );
      expect(screen.queryByTestId('markdown-editor')).not.toBeInTheDocument();
      expect(screen.getByText('renderer body')).toBeInTheDocument();
    },
  );

  it.each([
    { readonly: undefined, configReadonly: undefined, expected: true },
    { readonly: undefined, configReadonly: false, expected: false },
    { readonly: true, configReadonly: false, expected: true },
    { readonly: false, configReadonly: true, expected: false },
  ])(
    'resolves body readonly precedence: %j',
    ({ readonly, configReadonly, expected }) => {
      render(
        <MarkdownPreview
          content="body"
          beforeContent={null}
          afterContent={null}
          readonly={readonly}
          markdownRenderConfig={{ readonly: configReadonly }}
        />,
      );
      expect(screen.getByTestId('markdown-editor')).toHaveAttribute(
        'data-readonly',
        String(expected),
      );
    },
  );

  it('keeps an explicitly editable Markdown message in Slate mode', () => {
    render(
      <MarkdownPreview
        content="editable body"
        beforeContent={null}
        afterContent={null}
        readonly={false}
        markdownRenderConfig={{ renderMode: 'markdown' }}
      />,
    );
    expect(screen.getByTestId('markdown-editor')).toHaveAttribute(
      'data-readonly',
      'false',
    );
  });
});
