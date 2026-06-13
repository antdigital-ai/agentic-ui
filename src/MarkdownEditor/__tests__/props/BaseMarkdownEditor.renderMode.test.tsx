import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { BaseMarkdownEditor } from '../../BaseMarkdownEditor';
import type { MarkdownEditorInstance } from '../../types';

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
  it('流式追加 initValue 时同步只读 Slate 文档且不重复旧内容', async () => {
    const editorRef = React.createRef<MarkdownEditorInstance | undefined>();
    const initialContent = '第一段';
    const streamedContent = `${initialContent}\n\n第二段`;

    const { rerender } = render(
      <BaseMarkdownEditor
        readonly
        streaming
        initValue={initialContent}
        editorRef={editorRef}
      />,
    );

    await waitFor(() => {
      expect(editorRef.current?.store.getMDContent()).toBe(initialContent);
    });

    rerender(
      <BaseMarkdownEditor
        readonly
        streaming
        initValue={streamedContent}
        editorRef={editorRef}
      />,
    );

    await waitFor(() => {
      expect(editorRef.current?.store.getMDContent()).toBe(streamedContent);
    });
  });
});
