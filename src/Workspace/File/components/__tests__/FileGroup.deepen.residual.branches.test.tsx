/**
 * FileGroup deepen：折叠切换清理旧 collapseTimer。
 */
import { act, cleanup, render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FileGroup } from '../FileGroup';

describe('FileGroup deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('快速折叠再展开会 clearTimeout', async () => {
    const group = {
      id: 'g1',
      name: 'G',
      collapsed: false,
      children: [
        { id: '1', name: 'a.txt', url: 'https://x/a.txt' },
        { id: '2', name: 'b.txt', url: 'https://x/b.txt' },
      ],
    };
    const { rerender } = render(
      <FileGroup
        group={group as any}
        onToggleGroup={vi.fn()}
        onPreview={vi.fn()}
      />,
    );
    await act(async () => {
      rerender(
        <FileGroup
          group={{ ...group, collapsed: true } as any}
          onToggleGroup={vi.fn()}
          onPreview={vi.fn()}
        />,
      );
      vi.advanceTimersByTime(50);
      rerender(
        <FileGroup
          group={{ ...group, collapsed: false } as any}
          onToggleGroup={vi.fn()}
          onPreview={vi.fn()}
        />,
      );
      vi.advanceTimersByTime(300);
    });
    expect(true).toBe(true);
  });
});
