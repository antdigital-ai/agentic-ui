import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { DefaultCodeRouter } from '../DefaultCodeRouter';
import { extractBlockTextContent } from '../extractBlockTextContent';
import type { FileMapConfig, RendererBlockProps } from '../types';

const createPluginComponent = (testId: string) => {
  const Component = vi.fn((props: RendererBlockProps) => (
    <div
      data-file-map={props.fileMapConfig ? 'yes' : undefined}
      data-testid={testId}
    >
      {props.language}
    </div>
  ));

  return Component;
};

describe('extractBlockTextContent', () => {
  it('extracts text from nested React children without dropping falsy values', () => {
    expect(
      extractBlockTextContent(
        <>
          {'const count = '}
          <span>{0}</span>
          {false}
          <span />
        </>,
      ),
    ).toBe('const count = 0');
  });
});

describe('DefaultCodeRouter', () => {
  it('uses plugin renderers before lazy built-ins for specialized languages', () => {
    const MermaidRenderer = createPluginComponent('plugin-mermaid');

    render(
      <DefaultCodeRouter
        language="mermaid"
        pluginComponents={{ mermaid: MermaidRenderer }}
      >
        graph TD; A--&gt;B;
      </DefaultCodeRouter>,
    );

    expect(screen.getByTestId('plugin-mermaid')).toHaveTextContent('mermaid');
    expect(MermaidRenderer.mock.calls[0][0]).toEqual(
      expect.objectContaining({ language: 'mermaid' }),
    );
  });

  it('forwards schema rendering options to plugin renderers', () => {
    const SchemaRenderer = createPluginComponent('plugin-schema');
    const apaasifyRender = vi.fn();
    const editorCodeProps = { hideToolBar: true };

    render(
      <DefaultCodeRouter
        language="agentar-card"
        pluginComponents={{ schema: SchemaRenderer }}
        apaasifyRender={apaasifyRender}
        editorCodeProps={editorCodeProps}
      >
        {'{"type":"card"}'}
      </DefaultCodeRouter>,
    );

    expect(screen.getByTestId('plugin-schema')).toHaveTextContent(
      'agentar-card',
    );
    expect(SchemaRenderer.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        apaasifyRender,
        editorCodeProps,
        language: 'agentar-card',
      }),
    );
  });

  it('normalizes tool-use aliases and forwards file-map config to plugin renderers', () => {
    const ToolUseRenderer = createPluginComponent('plugin-tooluse');
    const FileMapRenderer = createPluginComponent('plugin-filemap');
    const fileMapConfig: FileMapConfig = {
      onPreview: vi.fn(),
    };

    const { rerender } = render(
      <DefaultCodeRouter
        language="agentic-ui-usertoolbar"
        pluginComponents={{ 'agentic-ui-toolusebar': ToolUseRenderer }}
      >
        {'{"tools":[]}'}
      </DefaultCodeRouter>,
    );

    expect(screen.getByTestId('plugin-tooluse')).toHaveTextContent(
      'agentic-ui-usertoolbar',
    );
    expect(ToolUseRenderer.mock.calls[0][0]).toEqual(
      expect.objectContaining({ language: 'agentic-ui-usertoolbar' }),
    );

    rerender(
      <DefaultCodeRouter
        language="agentic-ui-filemap"
        pluginComponents={{ 'agentic-ui-filemap': FileMapRenderer }}
        fileMapConfig={fileMapConfig}
      >
        {'[]'}
      </DefaultCodeRouter>,
    );

    expect(screen.getByTestId('plugin-filemap')).toHaveAttribute(
      'data-file-map',
      'yes',
    );
    expect(FileMapRenderer.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        fileMapConfig,
        language: 'agentic-ui-filemap',
      }),
    );
  });

  it('shows extracted fallback text while the default code renderer is loading', () => {
    render(
      <DefaultCodeRouter language="tsx" pluginComponents={{}}>
        <span>
          {'const count = '}
          <strong>{0}</strong>
        </span>
      </DefaultCodeRouter>,
    );

    expect(screen.getByText('const count = 0')).toBeInTheDocument();
  });
});
