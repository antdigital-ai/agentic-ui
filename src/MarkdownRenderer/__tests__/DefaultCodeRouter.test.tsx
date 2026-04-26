import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import type { DefaultCodeRouterProps } from '../DefaultCodeRouter';
import { DefaultCodeRouter } from '../DefaultCodeRouter';
import { extractBlockTextContent } from '../extractBlockTextContent';
import type { RendererBlockProps } from '../types';

const createPluginProbe = (testId: string) => {
  const calls: RendererBlockProps[] = [];

  const Probe: React.FC<RendererBlockProps> = (props) => {
    calls.push(props);
    return <div data-testid={testId}>{props.language}</div>;
  };

  return { Probe, calls };
};

const renderRouter = ({
  children = 'const answer = 42;',
  ...props
}: Partial<DefaultCodeRouterProps>) =>
  render(
    <DefaultCodeRouter language="tsx" pluginComponents={{}} {...props}>
      {children}
    </DefaultCodeRouter>,
  );

describe('DefaultCodeRouter', () => {
  it('uses plugin renderers before lazy built-ins for special languages', () => {
    const mermaid = createPluginProbe('mermaid-plugin');
    const chart = createPluginProbe('chart-plugin');

    const { rerender } = renderRouter({
      language: 'mermaid',
      pluginComponents: { mermaid: mermaid.Probe },
      children: 'graph TD; A-->B;',
    });

    expect(screen.getByTestId('mermaid-plugin')).toHaveTextContent('mermaid');
    expect(mermaid.calls[0]).toEqual(
      expect.objectContaining({
        language: 'mermaid',
        children: 'graph TD; A-->B;',
      }),
    );

    rerender(
      <DefaultCodeRouter
        language="json-chart"
        pluginComponents={{ chart: chart.Probe }}
      >
        {'{"config":[]}'}
      </DefaultCodeRouter>,
    );

    expect(screen.getByTestId('chart-plugin')).toHaveTextContent('json-chart');
    expect(chart.calls[0]).toEqual(
      expect.objectContaining({
        language: 'json-chart',
        children: '{"config":[]}',
      }),
    );
  });

  it('forwards schema and code props through plugin routes', () => {
    const schema = createPluginProbe('schema-plugin');
    const code = createPluginProbe('code-plugin');
    const apaasifyRender = () => <div data-testid="apaasify-custom" />;
    const editorCodeProps = { showLineNumbers: true };

    const { rerender } = renderRouter({
      language: 'agentar-card',
      pluginComponents: { schema: schema.Probe },
      apaasifyRender,
      editorCodeProps,
      children: '{"type":"object"}',
    });

    expect(screen.getByTestId('schema-plugin')).toHaveTextContent(
      'agentar-card',
    );
    expect(schema.calls[0]).toEqual(
      expect.objectContaining({
        language: 'agentar-card',
        apaasifyRender,
        editorCodeProps,
      }),
    );

    rerender(
      <DefaultCodeRouter
        language="tsx"
        pluginComponents={{ code: code.Probe }}
        editorCodeProps={editorCodeProps}
      >
        const value = 1;
      </DefaultCodeRouter>,
    );

    expect(screen.getByTestId('code-plugin')).toHaveTextContent('tsx');
    expect(code.calls[0]).toEqual(
      expect.objectContaining({
        language: 'tsx',
        editorCodeProps,
      }),
    );
  });

  it('supports legacy tool bar aliases and file map config in plugin routes', () => {
    const userToolbar = createPluginProbe('user-toolbar-plugin');
    const fileMap = createPluginProbe('file-map-plugin');
    const fileMapConfig = {
      onPreview: () => {},
    };

    const { rerender } = renderRouter({
      language: 'agentic-ui-usertoolbar',
      pluginComponents: {
        'agentic-ui-usertoolbar': userToolbar.Probe,
      },
      children: '{"items":[]}',
    });

    expect(screen.getByTestId('user-toolbar-plugin')).toHaveTextContent(
      'agentic-ui-usertoolbar',
    );
    expect(userToolbar.calls[0]).toEqual(
      expect.objectContaining({
        language: 'agentic-ui-usertoolbar',
      }),
    );

    rerender(
      <DefaultCodeRouter
        language="agentic-ui-filemap"
        pluginComponents={{ 'agentic-ui-filemap': fileMap.Probe }}
        fileMapConfig={fileMapConfig}
      >
        {'{"fileList":[]}'}
      </DefaultCodeRouter>,
    );

    expect(screen.getByTestId('file-map-plugin')).toHaveTextContent(
      'agentic-ui-filemap',
    );
    expect(fileMap.calls[0]).toEqual(
      expect.objectContaining({
        language: 'agentic-ui-filemap',
        fileMapConfig,
      }),
    );
  });

  it('shows readable code text while the built-in lazy renderer loads', () => {
    renderRouter({
      language: 'tsx',
      children: (
        <code>
          {['const ', <strong key="name">answer</strong>, ' = ', 42, ';']}
        </code>
      ),
    });

    const fallback = document.querySelector('.agentic-md-renderer-fallback');
    expect(fallback).toBeInTheDocument();
    expect(fallback).toHaveTextContent('const answer = 42;');
  });
});

describe('extractBlockTextContent', () => {
  it('extracts code text from markdown renderer child shapes', () => {
    expect(
      extractBlockTextContent([
        'line ',
        1,
        <span key="nested">
          <em> nested</em>
        </span>,
        null,
      ]),
    ).toBe('line 1 nested');
  });
});
