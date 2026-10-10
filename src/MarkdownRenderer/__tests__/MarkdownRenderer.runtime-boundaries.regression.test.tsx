import { cleanup, render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MarkdownRenderer } from '../index';
import type { MarkdownRendererProps } from '../types';

const { codeRender, tableRender } = vi.hoisted(() => ({
  codeRender: vi.fn(),
  tableRender: vi.fn(),
}));

vi.mock('../DefaultCodeRouter', () => ({
  DefaultCodeRouter: (props: { children?: React.ReactNode }) => {
    codeRender(props);
    return <pre>{props.children}</pre>;
  },
}));

vi.mock('../renderers/MarkdownTable', () => ({
  MarkdownTable: (props: { children?: React.ReactNode }) => {
    tableRender(props);
    return <table>{props.children}</table>;
  },
}));

const content = '```text\nCode\n```\n\n| A |\n| --- |\n| B |';

afterEach(cleanup);
beforeEach(() => vi.clearAllMocks());

describe('Markdown runtime update boundaries', () => {
  it('updates table configuration without refreshing unrelated code blocks', () => {
    const { rerender } = render(
      <MarkdownRenderer
        content={content}
        tableConfig={{
          actions: { fullScreen: 'modal' },
          previewTitle: 'First',
        }}
      />,
    );
    codeRender.mockClear();
    tableRender.mockClear();

    rerender(
      <MarkdownRenderer
        content={content}
        tableConfig={{
          actions: { fullScreen: 'drawer' },
          previewTitle: 'Next',
        }}
      />,
    );

    expect(tableRender).toHaveBeenCalledTimes(1);
    expect(tableRender.mock.lastCall?.[0].config.previewTitle).toBe('Next');
    expect(codeRender).not.toHaveBeenCalled();
  });

  it('updates code configuration without refreshing unrelated tables', () => {
    const tableConfig: MarkdownRendererProps['tableConfig'] = {
      actions: { fullScreen: 'modal' },
    };
    const { rerender } = render(
      <MarkdownRenderer content={content} tableConfig={tableConfig} />,
    );
    codeRender.mockClear();
    tableRender.mockClear();

    rerender(
      <MarkdownRenderer
        content={content}
        tableConfig={tableConfig}
        codeProps={{ theme: 'dark' }}
      />,
    );

    expect(codeRender).toHaveBeenCalledTimes(1);
    expect(codeRender.mock.lastCall?.[0].editorCodeProps.theme).toBe('dark');
    expect(tableRender).not.toHaveBeenCalled();
  });
});
