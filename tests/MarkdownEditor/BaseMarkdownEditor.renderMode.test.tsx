import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { BaseMarkdownEditor } from '../../src/MarkdownEditor/BaseMarkdownEditor';

describe('BaseMarkdownEditor renderMode=markdown', () => {
  it('应使用 MarkdownRenderer 渲染 agentic-ui-task 围栏', () => {
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

    expect(
      container.querySelector('[data-testid="agentic-ui-task-block"]'),
    ).toBeTruthy();
    expect(
      screen.getByTestId('task-list-thoughtChainItem'),
    ).toBeInTheDocument();
  });

  it('renderType=markdown 与 renderMode=markdown 等价', () => {
    const md = [
      '```agentic-ui-usertoolbar',
      '{ "items": [{ "text": "操作", "key": "a" }], "layout": "horizontal" }',
      '```',
    ].join('\n');

    const { container } = render(
      <BaseMarkdownEditor readonly initValue={md} renderType="markdown" />,
    );

    expect(
      container.querySelector('[data-testid="agentic-ui-usertoolbar-block"]'),
    ).toBeTruthy();
  });
});
