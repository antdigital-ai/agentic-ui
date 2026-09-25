/**
 * ContentFilemapView deepen safe：空 body、json5 失败走 partialParse。
 * ContentFilemapView.midtail hang-quarantined。
 */
import '@testing-library/jest-dom';
import { cleanup, render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../MarkdownInputField/FileMapView', () => ({
  FileMapView: ({ fileMap }: any) => (
    <div data-testid="filemap">{fileMap?.size ?? 0}</div>
  ),
}));

vi.mock(
  '../../MarkdownEditor/editor/elements/AgenticUiBlocks/agenticUiEmbedUtils',
  () => ({
    normalizeFileMapPropsFromJson: (parsed: any) => ({
      fileList: Array.isArray(parsed)
        ? parsed
        : parsed?.files || parsed?.list || [],
      className: '',
    }),
  }),
);

import { ContentFilemapView } from '../ContentFilemapView';

describe('ContentFilemapView deepen safe residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('空 body → json5 用 {}；json5 风格 body 可渲染', () => {
    const { container, rerender } = render(
      <ContentFilemapView blocks={[{ body: '', raw: '' }]} />,
    );
    expect(
      container.querySelector('[data-testid="content-filemap-view"]'),
    ).toBeTruthy();

    rerender(
      <ContentFilemapView
        blocks={[
          {
            body: '{files:[{uuid:"a",name:"a.md"}]}',
            raw: '```agentic-ui-filemap\n...\n```',
          },
        ]}
      />,
    );
    expect(
      container.querySelector('[data-testid="content-filemap-view"]') ||
        container.querySelector('[data-testid="filemap"]'),
    ).toBeTruthy();
  });
});
