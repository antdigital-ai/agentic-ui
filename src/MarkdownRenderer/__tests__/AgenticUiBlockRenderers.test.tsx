import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('json5', async (importOriginal) => {
  const actual = await importOriginal<typeof import('json5')>();
  return {
    default: {
      ...actual.default,
      parse: (s: string) => {
        if (s === '__PARSE_FAIL__') throw new Error('fail');
        return actual.default.parse(s);
      },
    },
  };
});

vi.mock(
  '../../MarkdownEditor/editor/parser/json-parse',
  async (importOriginal) => {
    const mod =
      await importOriginal<
        typeof import('../../MarkdownEditor/editor/parser/json-parse')
      >();
    return {
      ...mod,
      default: (s: string) => {
        if (s === '__PARSE_FAIL__') throw new Error('fail');
        return mod.default(s);
      },
    };
  },
);

vi.mock('../../TaskList', () => ({
  TaskList: () => <div data-testid="task-list-mock" />,
}));

vi.mock('../../ToolUseBar', () => ({
  ToolUseBar: () => <div data-testid="toolusebar-mock" />,
}));

import { AgenticUiTaskBlockRenderer } from '../renderers/AgenticUiTaskBlockRenderer';
import { AgenticUiToolUseBarBlockRenderer } from '../renderers/AgenticUiToolUseBarBlockRenderer';

describe('AgenticUiTaskBlockRenderer', () => {
  it('应解析完整 JSON 并渲染 TaskList', () => {
    const json = JSON.stringify({
      items: [{ key: '1', title: 'T', content: 'c' }],
    });
    render(<AgenticUiTaskBlockRenderer>{json}</AgenticUiTaskBlockRenderer>);

    expect(screen.getByTestId('agentic-ui-task-block')).toBeInTheDocument();
    expect(screen.getByTestId('task-list-mock')).toBeInTheDocument();
  });

  it('应在 json5 失败且 partial-json 可解析时使用部分 JSON 渲染 TaskList', () => {
    const incomplete = '{"items":[{"key":"1","title":"T"';
    render(
      <AgenticUiTaskBlockRenderer>{incomplete}</AgenticUiTaskBlockRenderer>,
    );

    expect(screen.getByTestId('agentic-ui-task-block')).toBeInTheDocument();
    expect(screen.getByTestId('task-list-mock')).toBeInTheDocument();
  });

  it('应在 json5 与 partial-json 均失败时渲染 fallback', () => {
    render(
      <AgenticUiTaskBlockRenderer>__PARSE_FAIL__</AgenticUiTaskBlockRenderer>,
    );

    expect(screen.getByTestId('agentic-ui-task-fallback')).toBeInTheDocument();
    expect(screen.queryByTestId('task-list-mock')).not.toBeInTheDocument();
  });

  it('应从多种子节点提取代码文本', () => {
    render(
      <AgenticUiTaskBlockRenderer>
        {['{"items":[{"key":"a","title":"', 'nested', '"}]}']}
      </AgenticUiTaskBlockRenderer>,
    );

    expect(screen.getByTestId('agentic-ui-task-block')).toBeInTheDocument();
  });

  it('应支持数字子节点（转为字符串后参与解析）', () => {
    render(<AgenticUiTaskBlockRenderer>{42}</AgenticUiTaskBlockRenderer>);

    expect(screen.getByTestId('agentic-ui-task-block')).toBeInTheDocument();
  });

  it('应从嵌套 React 元素提取文本并解析 JSON', () => {
    render(
      <AgenticUiTaskBlockRenderer>
        <span>{'{"items":[{"key":"x","title":"y"}]}'}</span>
      </AgenticUiTaskBlockRenderer>,
    );

    expect(screen.getByTestId('agentic-ui-task-block')).toBeInTheDocument();
  });

  it('应在无文本子节点时走 extractTextContent 空分支', () => {
    render(
      <AgenticUiTaskBlockRenderer>
        <span />
      </AgenticUiTaskBlockRenderer>,
    );

    expect(screen.getByTestId('agentic-ui-task-block')).toBeInTheDocument();
  });
});

describe('AgenticUiToolUseBarBlockRenderer', () => {
  it('应解析完整 JSON 并渲染 ToolUseBar', () => {
    const json = JSON.stringify({
      tools: [{ id: 'a', toolName: 'n', toolTarget: '' }],
    });
    render(
      <AgenticUiToolUseBarBlockRenderer>
        {json}
      </AgenticUiToolUseBarBlockRenderer>,
    );

    expect(
      screen.getByTestId('agentic-ui-toolusebar-block'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('toolusebar-mock')).toBeInTheDocument();
  });

  it('应在 json5 失败且 partial-json 可解析时使用部分 JSON 渲染 ToolUseBar', () => {
    const incomplete = '{"tools":[{"id":"a","toolName":"x"';
    render(
      <AgenticUiToolUseBarBlockRenderer>
        {incomplete}
      </AgenticUiToolUseBarBlockRenderer>,
    );

    expect(
      screen.getByTestId('agentic-ui-toolusebar-block'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('toolusebar-mock')).toBeInTheDocument();
  });

  it('应在 json5 与 partial-json 均失败时渲染 fallback', () => {
    render(
      <AgenticUiToolUseBarBlockRenderer>
        __PARSE_FAIL__
      </AgenticUiToolUseBarBlockRenderer>,
    );

    expect(
      screen.getByTestId('agentic-ui-toolusebar-fallback'),
    ).toBeInTheDocument();
    expect(screen.queryByTestId('toolusebar-mock')).not.toBeInTheDocument();
  });

  it('应从多种子节点提取代码文本（ToolUseBar）', () => {
    render(
      <AgenticUiToolUseBarBlockRenderer>
        {['{"tools":[{"id":"a","toolName":"', 'x', '"}]}']}
      </AgenticUiToolUseBarBlockRenderer>,
    );

    expect(
      screen.getByTestId('agentic-ui-toolusebar-block'),
    ).toBeInTheDocument();
  });

  it('应支持数字子节点并解析（ToolUseBar）', () => {
    render(
      <AgenticUiToolUseBarBlockRenderer>{42}</AgenticUiToolUseBarBlockRenderer>,
    );

    expect(
      screen.getByTestId('agentic-ui-toolusebar-block'),
    ).toBeInTheDocument();
  });

  it('应从嵌套 React 元素提取文本（ToolUseBar）', () => {
    render(
      <AgenticUiToolUseBarBlockRenderer>
        <span>{'{"tools":[{"id":"a","toolName":"b"}]}'}</span>
      </AgenticUiToolUseBarBlockRenderer>,
    );

    expect(
      screen.getByTestId('agentic-ui-toolusebar-block'),
    ).toBeInTheDocument();
  });

  it('应在无文本子节点时走 extractTextContent 空分支并解析默认 {}', () => {
    render(
      <AgenticUiToolUseBarBlockRenderer>
        <span />
      </AgenticUiToolUseBarBlockRenderer>,
    );

    expect(
      screen.getByTestId('agentic-ui-toolusebar-block'),
    ).toBeInTheDocument();
  });
});
