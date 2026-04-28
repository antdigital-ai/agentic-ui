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

    expect(schemaPlugin).toHaveBeenCalledWith(
      expect.objectContaining({
        language: 'apaasify',
        apaasifyRender,
        editorCodeProps,
      }),
      undefined,
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

    expect(fileMapPlugin).toHaveBeenCalledWith(
      expect.objectContaining({
        language: 'agentic-ui-filemap',
        fileMapConfig,
      }),
      undefined,
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

    expect(codePlugin).toHaveBeenCalledWith(
      expect.objectContaining({
        language: 'tsx',
        editorCodeProps,
      }),
      undefined,
    );
  });

  it('懒加载兜底应从嵌套 children 中抽取代码文本', () => {
    const { container } = render(
      <DefaultCodeRouter language="tsx" pluginComponents={{}}>
        <code>
          {'const value = '}
          <span>{1}</span>
          {';\n'}
          <span>export default value;</span>
        </code>
      </DefaultCodeRouter>,
    );

    const fallback = container.querySelector(
      '.agentic-md-renderer-fallback code',
    );
    expect(fallback?.textContent).toBe(
      'const value = 1;\nexport default value;',
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
