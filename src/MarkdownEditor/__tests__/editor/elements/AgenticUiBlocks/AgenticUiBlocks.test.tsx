import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { AgenticUiFileMapBlock } from '../../../../editor/elements/AgenticUiBlocks/AgenticUiFileMapBlock';
import {
  AgenticUiTaskBlock,
  ReadonlyAgenticUiTaskBlock,
} from '../../../../editor/elements/AgenticUiBlocks/AgenticUiTaskBlock';
import {
  AgenticUiToolUseBarBlock,
  ReadonlyAgenticUiToolUseBarBlock,
} from '../../../../editor/elements/AgenticUiBlocks/AgenticUiToolUseBarBlock';

vi.mock('../../../../../TaskList', () => ({
  TaskList: () => <div data-testid="task-list-mock" />,
}));

vi.mock('../../../../../ToolUseBar', () => ({
  ToolUseBar: () => <div data-testid="tooluse-bar-mock" />,
}));

vi.mock('../../../../../MarkdownInputField/FileMapView', () => ({
  FileMapView: () => <div data-testid="filemap-view-mock" />,
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
              items: [
                { key: '1', title: 'T', content: 'c', status: 'pending' },
              ],
            },
          } as any
        }
      >
        <span>hidden</span>
      </AgenticUiTaskBlock>,
    );
    expect(screen.getByTestId('agentic-ui-task-block')).toBeInTheDocument();
    expect(screen.getByTestId('task-list-mock')).toBeInTheDocument();
    expect(
      screen.getByTestId('agentic-ui-task-hidden-children'),
    ).toBeInTheDocument();
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
      >
        <span>hc</span>
      </AgenticUiToolUseBarBlock>,
    );
    expect(
      screen.getByTestId('agentic-ui-toolusebar-block'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('tooluse-bar-mock')).toBeInTheDocument();
    expect(
      screen.getByTestId('agentic-ui-toolusebar-hidden-children'),
    ).toBeInTheDocument();
  });

  it('ReadonlyAgenticUiTaskBlock 与 AgenticUiTaskBlock 行为一致', () => {
    render(
      <ReadonlyAgenticUiTaskBlock
        attributes={baseAttrs as any}
        element={
          {
            type: 'agentic-ui-task',
            value: {
              items: [{ key: 'r1', title: 'Readonly', status: 'success' }],
              variant: 'default',
            },
          } as any
        }
      >
        <span>ro</span>
      </ReadonlyAgenticUiTaskBlock>,
    );
    expect(screen.getByTestId('agentic-ui-task-block')).toBeInTheDocument();
    expect(screen.getByTestId('task-list-mock')).toBeInTheDocument();
  });

  it('ReadonlyAgenticUiToolUseBarBlock 渲染 ToolUseBar', () => {
    render(
      <ReadonlyAgenticUiToolUseBarBlock
        attributes={baseAttrs as any}
        element={
          {
            type: 'agentic-ui-toolusebar',
            value: {
              tools: [{ id: 'ro', toolName: 'ro-tool', toolTarget: '' }],
            },
          } as any
        }
      >
        <span>ro</span>
      </ReadonlyAgenticUiToolUseBarBlock>,
    );
    expect(
      screen.getByTestId('agentic-ui-toolusebar-block'),
    ).toBeInTheDocument();
  });

  it('AgenticUiFileMapBlock 渲染 FileMapView', () => {
    render(
      <AgenticUiFileMapBlock
        attributes={baseAttrs as any}
        element={
          {
            type: 'agentic-ui-filemap',
            value: {
              fileList: [{ name: 'a.ts', uuid: 'u1', type: 'text/plain' }],
            },
          } as any
        }
      >
        <span>fm</span>
      </AgenticUiFileMapBlock>,
    );
    expect(screen.getByTestId('agentic-ui-filemap-block')).toBeInTheDocument();
    expect(screen.getByTestId('filemap-view-mock')).toBeInTheDocument();
  });
});
