/**
 * DefaultCodeRouter residual：路由表 / schema / 插件 / 默认 code / fallback。
 */
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { DefaultCodeRouter } from '../DefaultCodeRouter';

vi.mock('../renderers/MermaidRenderer', () => ({
  MermaidBlockRenderer: (p: any) => <div data-testid="lazy-mermaid">{p.language}</div>,
}));
vi.mock('../renderers/ChartRenderer', () => ({
  ChartBlockRenderer: (p: any) => <div data-testid="lazy-chart">{p.language}</div>,
}));
vi.mock('../renderers/CodeRenderer', () => ({
  CodeBlockRenderer: (p: any) => <div data-testid="lazy-code">{p.language}</div>,
}));
vi.mock('../renderers/SchemaRenderer', () => ({
  SchemaBlockRenderer: (p: any) => <div data-testid="lazy-schema">{p.language}</div>,
}));
vi.mock('../renderers/AgenticUiTaskBlockRenderer', () => ({
  AgenticUiTaskBlockRenderer: () => <div data-testid="lazy-task" />,
}));
vi.mock('../renderers/AgenticUiToolUseBarBlockRenderer', () => ({
  AgenticUiToolUseBarBlockRenderer: () => <div data-testid="lazy-tool" />,
}));
vi.mock('../renderers/AgenticUiFileMapBlockRenderer', () => ({
  AgenticUiFileMapBlockRenderer: (p: any) => (
    <div data-testid="lazy-filemap">{p.fileMapConfig ? 'cfg' : 'no'}</div>
  ),
}));

const base = {
  children: 'code',
  pluginComponents: {} as Record<string, React.ComponentType<any>>,
};

describe('DefaultCodeRouter residual branches', () => {
  it('mermaid 无插件走 lazy；有插件用插件', async () => {
    const { findByTestId, rerender } = render(
      <DefaultCodeRouter {...base} language="mermaid" />,
    );
    expect(await findByTestId('lazy-mermaid')).toBeTruthy();

    rerender(
      <DefaultCodeRouter
        {...base}
        language="mermaid"
        pluginComponents={{
          mermaid: () => <div data-testid="plugin-mermaid" />,
        }}
      />,
    );
    expect(await findByTestId('plugin-mermaid')).toBeTruthy();
  });

  it('json-chart 别名；agentic-ui-usertoolbar 别名', async () => {
    const { findByTestId, rerender } = render(
      <DefaultCodeRouter {...base} language="json-chart" />,
    );
    expect(await findByTestId('lazy-chart')).toBeTruthy();
    rerender(
      <DefaultCodeRouter {...base} language="agentic-ui-usertoolbar" />,
    );
    expect(await findByTestId('lazy-tool')).toBeTruthy();
  });

  it('filemap extraProps；schema 族；通用插件；默认 code；最终 lazy code', async () => {
    const { findByTestId, rerender } = render(
      <DefaultCodeRouter
        {...base}
        language="agentic-ui-filemap"
        fileMapConfig={{ show: true } as any}
      />,
    );
    expect(await findByTestId('lazy-filemap')).toHaveTextContent('cfg');

    rerender(
      <DefaultCodeRouter {...base} language="agentar-card" />,
    );
    expect(await findByTestId('lazy-schema')).toBeTruthy();

    rerender(
      <DefaultCodeRouter
        {...base}
        language="agentar-card"
        pluginComponents={{
          schema: () => <div data-testid="plugin-schema" />,
        }}
      />,
    );
    expect(await findByTestId('plugin-schema')).toBeTruthy();

    rerender(
      <DefaultCodeRouter
        {...base}
        language="python"
        pluginComponents={{
          python: () => <div data-testid="plugin-py" />,
        }}
      />,
    );
    expect(await findByTestId('plugin-py')).toBeTruthy();

    rerender(
      <DefaultCodeRouter
        {...base}
        language="ruby"
        pluginComponents={{
          code: () => <div data-testid="plugin-code" />,
        }}
      />,
    );
    expect(await findByTestId('plugin-code')).toBeTruthy();

    rerender(<DefaultCodeRouter {...base} language="unknown-lang" />);
    expect(await findByTestId('lazy-code')).toBeTruthy();
  });

  it('无 language 走默认 code lazy', async () => {
    render(<DefaultCodeRouter {...base} language={undefined as any} />);
    expect(await screen.findByTestId('lazy-code')).toBeTruthy();
  });
});
