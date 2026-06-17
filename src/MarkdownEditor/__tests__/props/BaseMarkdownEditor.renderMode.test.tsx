import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { BaseMarkdownEditor } from '../../BaseMarkdownEditor';

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
});

describe('BaseMarkdownEditor readonly renderMode=slate', () => {
  it('应在流式 initValue 追加时同步只读 Slate 内容', async () => {
    const firstChunk = '第一段';
    const nextChunk = `${firstChunk}\n\n第二段`;

    const { container, rerender } = render(
      <BaseMarkdownEditor
        readonly
        streaming
        initValue={firstChunk}
        renderMode="slate"
        toc={false}
      />,
    );

    await waitFor(() => {
      expect(container).toHaveTextContent(firstChunk);
    });

    rerender(
      <BaseMarkdownEditor
        readonly
        streaming
        initValue={nextChunk}
        renderMode="slate"
        toc={false}
      />,
    );

    await waitFor(() => {
      expect(container).toHaveTextContent(firstChunk);
      expect(container).toHaveTextContent('第二段');
    });
  });
});
