import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { AgenticUiTaskBlock } from '../../../../../src/MarkdownEditor/editor/elements/AgenticUiBlocks/AgenticUiTaskBlock';
import { AgenticUiToolUseBarBlock } from '../../../../../src/MarkdownEditor/editor/elements/AgenticUiBlocks/AgenticUiToolUseBarBlock';

vi.mock('../../../../../src/TaskList', () => ({
  TaskList: () => <div data-testid="task-list-mock" />,
}));

vi.mock('../../../../../src/ToolUseBar', () => ({
  ToolUseBar: () => <div data-testid="tooluse-bar-mock" />,
}));

describe('AgenticUiTaskBlock / AgenticUiToolUseBarBlock', () => {
  const baseAttrs = { 'data-slate-node': 'element' as const };

  it('AgenticUiTaskBlock 渲染 TaskList 与隐藏 children', () => {
    render(
      <AgenticUiTaskBlock
        attributes={baseAttrs as any}
        element={
          {
            type: 'agentic-ui-task',
            value: {
              items: [{ key: '1', title: 'T', content: 'c', status: 'pending' }],
            },
          } as any
        }
        children={<span>hidden</span>}
      />,
    );
    expect(screen.getByTestId('agentic-ui-task-block')).toBeInTheDocument();
    expect(screen.getByTestId('task-list-mock')).toBeInTheDocument();
    expect(screen.getByTestId('agentic-ui-task-hidden-children')).toBeInTheDocument();
  });

  it('AgenticUiToolUseBarBlock 渲染 ToolUseBar 与隐藏 children', () => {
    render(
      <AgenticUiToolUseBarBlock
        attributes={baseAttrs as any}
        element={
          {
            type: 'agentic-ui-toolusebar',
            value: {
              tools: [
                {
                  id: 'a',
                  toolName: 'x',
                  toolTarget: '',
                  status: 'idle',
                },
              ],
            },
          } as any
        }
        children={<span>hc</span>}
      />,
    );
    expect(screen.getByTestId('agentic-ui-toolusebar-block')).toBeInTheDocument();
    expect(screen.getByTestId('tooluse-bar-mock')).toBeInTheDocument();
    expect(
      screen.getByTestId('agentic-ui-toolusebar-hidden-children'),
    ).toBeInTheDocument();
  });
});
