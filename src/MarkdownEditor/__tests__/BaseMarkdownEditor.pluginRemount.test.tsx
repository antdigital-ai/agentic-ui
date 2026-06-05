import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React, { useMemo, useState } from 'react';
import { describe, expect, it } from 'vitest';
import type { MarkdownEditorPlugin } from '../plugin';
import { BaseMarkdownEditor } from '../BaseMarkdownEditor';

const withMarker: MarkdownEditorPlugin = {
  withEditorKey: 'marker-v1',
  withEditor: (editor) => {
    (editor as any).__pluginMarker = 'a';
    return editor;
  },
};

const withMarkerV2: MarkdownEditorPlugin = {
  withEditorKey: 'marker-v2',
  withEditor: (editor) => {
    (editor as any).__pluginMarker = 'b';
    return editor;
  },
};

describe('BaseMarkdownEditorSlate plugin remount', () => {
  it('withEditor 栈变化后仍保留文档文本', async () => {
    const Demo = () => {
      const [plugins, setPlugins] = useState<MarkdownEditorPlugin[]>([]);
      return (
        <div>
          <button type="button" onClick={() => setPlugins([withMarker])}>
            add-plugin
          </button>
          <BaseMarkdownEditor initValue="hello remount" plugins={plugins} />
        </div>
      );
    };

    render(<Demo />);
    expect(await screen.findByText('hello remount')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'add-plugin' }));
    await waitFor(() => {
      expect(screen.getByText('hello remount')).toBeInTheDocument();
    });
  });

  it('withEditorKey 变化时 remount 并保留文档', async () => {
    const Demo = () => {
      const [useV2, setUseV2] = useState(false);
      const plugins = useMemo(
        () => [useV2 ? withMarkerV2 : withMarker],
        [useV2],
      );
      return (
        <div>
          <button type="button" onClick={() => setUseV2(true)}>
            swap-plugin-key
          </button>
          <BaseMarkdownEditor initValue="hello key swap" plugins={plugins} />
        </div>
      );
    };

    render(<Demo />);
    expect(await screen.findByText('hello key swap')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'swap-plugin-key' }));
    await waitFor(() => {
      expect(screen.getByText('hello key swap')).toBeInTheDocument();
    });
  });
});
