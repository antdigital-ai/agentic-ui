import { render } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { DefaultCodeRouter } from '../DefaultCodeRouter';
import type { FileMapConfig, RendererBlockProps } from '../types';

describe('DefaultCodeRouter', () => {
  it('prefers plugin renderer for mermaid code blocks', () => {
    const MermaidRenderer = vi.fn((props: RendererBlockProps) => (
      <div data-testid="plugin-mermaid">{props.language}</div>
    ));

    const { getByTestId } = render(
      <DefaultCodeRouter
        language="mermaid"
        pluginComponents={{ mermaid: MermaidRenderer }}
      >
        graph TD;
      </DefaultCodeRouter>,
    );

    expect(getByTestId('plugin-mermaid').textContent).toBe('mermaid');
    expect(MermaidRenderer).toHaveBeenCalledWith(
      expect.objectContaining({ language: 'mermaid' }),
      undefined,
    );
  });

  it('passes file map config to plugin renderer', () => {
    const fileMapConfig: FileMapConfig = {
      onPreview: vi.fn(),
      normalizeFile: vi.fn(),
    };
    const FileMapRenderer = vi.fn((props: RendererBlockProps) => (
      <div data-testid="plugin-filemap">
        {String(props.fileMapConfig === fileMapConfig)}
      </div>
    ));

    const { getByTestId } = render(
      <DefaultCodeRouter
        language="agentic-ui-filemap"
        pluginComponents={{ 'agentic-ui-filemap': FileMapRenderer }}
        fileMapConfig={fileMapConfig}
      >
        {JSON.stringify({ fileList: [] })}
      </DefaultCodeRouter>,
    );

    expect(getByTestId('plugin-filemap').textContent).toBe('true');
    expect(FileMapRenderer).toHaveBeenCalledWith(
      expect.objectContaining({ fileMapConfig, language: 'agentic-ui-filemap' }),
      undefined,
    );
  });

  it('routes legacy user toolbar language to toolusebar plugin renderer', () => {
    const ToolUseBarRenderer = vi.fn((props: RendererBlockProps) => (
      <div data-testid="plugin-toolusebar">{props.language}</div>
    ));

    const { getByTestId } = render(
      <DefaultCodeRouter
        language="agentic-ui-usertoolbar"
        pluginComponents={{ 'agentic-ui-toolusebar': ToolUseBarRenderer }}
      >
        {JSON.stringify({ items: [] })}
      </DefaultCodeRouter>,
    );

    expect(getByTestId('plugin-toolusebar').textContent).toBe(
      'agentic-ui-usertoolbar',
    );
    expect(ToolUseBarRenderer).toHaveBeenCalledWith(
      expect.objectContaining({ language: 'agentic-ui-usertoolbar' }),
      undefined,
    );
  });

  it('passes schema and editor code options to schema plugin renderer', () => {
    const apaasifyRender = vi.fn();
    const editorCodeProps = { theme: 'dark' };
    const SchemaRenderer = vi.fn((props: RendererBlockProps) => (
      <div data-testid="plugin-schema">
        {[
          props.language,
          String(props.apaasifyRender === apaasifyRender),
          String(props.editorCodeProps === editorCodeProps),
        ].join('|')}
      </div>
    ));

    const { getByTestId } = render(
      <DefaultCodeRouter
        language="apaasify"
        pluginComponents={{ schema: SchemaRenderer }}
        apaasifyRender={apaasifyRender}
        editorCodeProps={editorCodeProps}
      >
        {JSON.stringify({ type: 'form' })}
      </DefaultCodeRouter>,
    );

    expect(getByTestId('plugin-schema').textContent).toBe(
      'apaasify|true|true',
    );
    expect(SchemaRenderer).toHaveBeenCalledWith(
      expect.objectContaining({
        apaasifyRender,
        editorCodeProps,
        language: 'apaasify',
      }),
      undefined,
    );
  });
});
