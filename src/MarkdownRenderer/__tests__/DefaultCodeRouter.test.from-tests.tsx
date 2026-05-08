import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import {
  DefaultCodeRouter,
  type DefaultCodeRouterProps,
} from '../../src/MarkdownRenderer/DefaultCodeRouter';
import { extractBlockTextContent } from '../../src/MarkdownRenderer/extractBlockTextContent';
import type { RendererBlockProps } from '../../src/MarkdownRenderer/types';

vi.mock('../../src/MarkdownRenderer/renderers/MermaidRenderer', () => ({
  MermaidBlockRenderer: ({ children, language }: RendererBlockProps) => (
    <div data-testid="lazy-mermaid-renderer">
      {language}:{children}
    </div>
  ),
}));

const DEFAULT_CHILDREN = 'router payload';

const renderRouter = (
  props: Partial<DefaultCodeRouterProps> &
    Pick<DefaultCodeRouterProps, 'language'>,
) =>
  render(
    <DefaultCodeRouter
      pluginComponents={{}}
      {...props}
      children={props.children ?? DEFAULT_CHILDREN}
    />,
  );

const createPluginProbe = (
  testId: string,
  onRender?: (props: RendererBlockProps) => void,
) => {
  const PluginProbe: React.FC<RendererBlockProps> = (props) => {
    onRender?.(props);
    return <div data-testid={testId}>{props.children}</div>;
  };

  return PluginProbe;
};

describe('DefaultCodeRouter', () => {
  it('prefers plugin renderers for built-in languages without loading the lazy fallback', () => {
    const onRender = vi.fn();
    const MermaidPlugin = createPluginProbe('mermaid-plugin', onRender);

    renderRouter({
      language: 'mermaid',
      pluginComponents: {
        mermaid: MermaidPlugin,
      },
    });

    expect(screen.getByTestId('mermaid-plugin')).toHaveTextContent(
      DEFAULT_CHILDREN,
    );
    expect(
      screen.queryByTestId('lazy-mermaid-renderer'),
    ).not.toBeInTheDocument();
    expect(onRender).toHaveBeenCalledWith(
      expect.objectContaining({
        children: DEFAULT_CHILDREN,
        language: 'mermaid',
      }),
    );
  });

  it('preserves code text in the lazy renderer fallback while the chunk loads', async () => {
    renderRouter({
      language: 'mermaid',
      children: (
        <code>
          graph TD;
          <span>A--&gt;B</span>
        </code>
      ),
    });

    expect(screen.getByText('graph TD;A-->B')).toBeInTheDocument();
    expect(
      await screen.findByTestId('lazy-mermaid-renderer'),
    ).toHaveTextContent('mermaid:graph TD;A-->B');
  });

  it('forwards file map config to plugin file map renderers', () => {
    const fileMapConfig = {
      onPreview: vi.fn(),
      normalizeFile: vi.fn(),
    };
    const onRender = vi.fn();
    const FileMapPlugin = createPluginProbe('filemap-plugin', onRender);

    renderRouter({
      language: 'agentic-ui-filemap',
      fileMapConfig,
      pluginComponents: {
        'agentic-ui-filemap': FileMapPlugin,
      },
    });

    expect(screen.getByTestId('filemap-plugin')).toBeInTheDocument();
    expect(onRender).toHaveBeenCalledWith(
      expect.objectContaining({
        fileMapConfig,
        language: 'agentic-ui-filemap',
      }),
    );
  });

  it('routes schema aliases through the schema plugin with schema-specific props', () => {
    const apaasifyRender = vi.fn();
    const editorCodeProps = { readonly: true };
    const onRender = vi.fn();
    const SchemaPlugin = createPluginProbe('schema-plugin', onRender);

    renderRouter({
      language: 'agentar-card',
      apaasifyRender,
      editorCodeProps,
      pluginComponents: {
        schema: SchemaPlugin,
      },
    });

    expect(screen.getByTestId('schema-plugin')).toBeInTheDocument();
    expect(onRender).toHaveBeenCalledWith(
      expect.objectContaining({
        apaasifyRender,
        editorCodeProps,
        language: 'agentar-card',
      }),
    );
  });

  it('uses the toolusebar plugin for usertoolbar aliases while preserving the original language', () => {
    const onRender = vi.fn();
    const ToolUsePlugin = createPluginProbe('tooluse-plugin', onRender);

    renderRouter({
      language: 'agentic-ui-usertoolbar',
      pluginComponents: {
        'agentic-ui-toolusebar': ToolUsePlugin,
      },
    });

    expect(screen.getByTestId('tooluse-plugin')).toBeInTheDocument();
    expect(onRender).toHaveBeenCalledWith(
      expect.objectContaining({
        language: 'agentic-ui-usertoolbar',
      }),
    );
  });
});

describe('extractBlockTextContent', () => {
  it('flattens mixed React children into code text for lazy fallbacks', () => {
    expect(
      extractBlockTextContent([
        'const value = ',
        <span key="number">{42}</span>,
        ';',
        false,
        null,
        <em key="nested">
          <strong>nested</strong>
        </em>,
      ]),
    ).toBe('const value = 42;nested');
  });
});
