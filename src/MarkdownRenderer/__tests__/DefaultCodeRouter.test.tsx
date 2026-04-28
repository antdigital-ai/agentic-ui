import { render } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { DefaultCodeRouter } from '../DefaultCodeRouter';
import { extractBlockTextContent } from '../extractBlockTextContent';
import type { RendererBlockProps } from '../types';

describe('DefaultCodeRouter', () => {
  it('优先使用插件渲染器并透传特殊代码块配置', () => {
    const apaasifyRender = vi.fn();
    const onPreview = vi.fn();
    const fileMapConfig = { onPreview };
    const editorCodeProps = { showLineNumbers: true };
    const schemaPlugin = vi.fn((props: RendererBlockProps) => (
      <div data-testid="schema-plugin">{props.language}</div>
    ));
    const fileMapPlugin = vi.fn((props: RendererBlockProps) => (
      <div data-testid="filemap-plugin">{props.language}</div>
    ));

    const { rerender } = render(
      <DefaultCodeRouter
        language="apaasify"
        pluginComponents={{ schema: schemaPlugin }}
        apaasifyRender={apaasifyRender}
        editorCodeProps={editorCodeProps}
      >
        schema content
      </DefaultCodeRouter>,
    );

    expect(schemaPlugin.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        language: 'apaasify',
        apaasifyRender,
        editorCodeProps,
      }),
    );

    rerender(
      <DefaultCodeRouter
        language="agentic-ui-filemap"
        pluginComponents={{ 'agentic-ui-filemap': fileMapPlugin }}
        fileMapConfig={fileMapConfig}
      >
        file map content
      </DefaultCodeRouter>,
    );

    expect(fileMapPlugin.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        language: 'agentic-ui-filemap',
        fileMapConfig,
      }),
    );
  });

  it('通用代码块插件应接收 editorCodeProps', () => {
    const editorCodeProps = { showLineNumbers: true };
    const codePlugin = vi.fn((props: RendererBlockProps) => (
      <div data-testid="code-plugin">{props.language}</div>
    ));

    render(
      <DefaultCodeRouter
        language="tsx"
        pluginComponents={{ code: codePlugin }}
        editorCodeProps={editorCodeProps}
      >
        const value = 1;
      </DefaultCodeRouter>,
    );

    expect(codePlugin.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        language: 'tsx',
        editorCodeProps,
      }),
    );
  });

});

describe('extractBlockTextContent', () => {
  it('应稳定拼接字符串、数字、数组与嵌套 React 节点', () => {
    const content = extractBlockTextContent([
      'line ',
      1,
      <React.Fragment key="fragment">
        <span>A</span>
        {null}
        {false}
        <span>B</span>
      </React.Fragment>,
      [' nested ', <code key="code">code</code>],
    ]);

    expect(content).toBe('line 1AB nested code');
  });
});
