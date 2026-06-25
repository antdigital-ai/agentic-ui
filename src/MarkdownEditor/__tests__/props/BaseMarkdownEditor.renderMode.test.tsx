import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { STREAM_TOKEN_CLASS } from '../../../MarkdownRenderer/streaming/rehypeStreamingTokens';
import { BaseMarkdownEditor } from '../../BaseMarkdownEditor';

const countStreamingTokens = (root: HTMLElement) =>
  root.querySelectorAll(`.${STREAM_TOKEN_CLASS}`).length;

describe('BaseMarkdownEditor renderMode=markdown', () => {
  it('应使用 MarkdownRenderer 渲染 agentic-ui-task 围栏', async () => {
    const md = [
      '```agentic-ui-task',
      '{',
      '  "items": [',
      '    { "key": "1", "title": "步骤", "content": "内容", "status": "success" }',
      '  ]',
      '}',
      '```',
    ].join('\n');

    const { container } = render(
      <BaseMarkdownEditor readonly initValue={md} renderMode="markdown" />,
    );

    await waitFor(() => {
      expect(
        container.querySelector('[data-testid="agentic-ui-task-block"]'),
      ).toBeTruthy();
    });
    expect(
      await screen.findByTestId('task-list-simple-wrapper'),
    ).toBeInTheDocument();
  });

  it('renderType=markdown 与 renderMode=markdown 等价', async () => {
    const md = [
      '```agentic-ui-toolusebar',
      '{ "tools": [{ "id": "a", "toolName": "操作", "toolTarget": "目标", "status": "loading" }] }',
      '```',
    ].join('\n');

    const { container } = render(
      <BaseMarkdownEditor readonly initValue={md} renderType="markdown" />,
    );

    await waitFor(() => {
      expect(
        container.querySelector('[data-testid="agentic-ui-toolusebar-block"]'),
      ).toBeTruthy();
    });
    expect(
      await screen.findByTestId('ToolUse', {}, { timeout: 10_000 }),
    ).toBeInTheDocument();
  });

  it('只读 Markdown 模式应透传 throttleOptions.fade 控制逐词淡入', () => {
    const props = {
      readonly: true,
      initValue: 'alpha beta',
      renderMode: 'markdown' as const,
      streaming: true,
    };

    const { container, rerender } = render(
      <BaseMarkdownEditor {...props} throttleOptions={{ enabled: false }} />,
    );

    expect(countStreamingTokens(container)).toBeGreaterThan(0);
    expect(
      container.querySelector('[class*="content-streaming"]'),
    ).not.toBeNull();

    rerender(
      <BaseMarkdownEditor
        {...props}
        throttleOptions={{ enabled: false, fade: false }}
      />,
    );

    expect(countStreamingTokens(container)).toBe(0);
    expect(container.querySelector('[class*="content-streaming"]')).toBeNull();
  });
});

describe('BaseMarkdownEditor readonly renderMode=slate', () => {
  it('只读 Slate 模式下 initValue 追加时同步文档内容', async () => {
    const { rerender } = render(
      <BaseMarkdownEditor
        readonly
        initValue="第一段"
        renderMode="slate"
        toc={false}
      />,
    );

    expect(await screen.findByText('第一段')).toBeInTheDocument();

    rerender(
      <BaseMarkdownEditor
        readonly
        initValue={'第一段\n\n第二段'}
        renderMode="slate"
        toc={false}
      />,
    );

    expect(await screen.findByText('第二段')).toBeInTheDocument();
    expect(screen.getAllByText('第一段')).toHaveLength(1);
  });
});
