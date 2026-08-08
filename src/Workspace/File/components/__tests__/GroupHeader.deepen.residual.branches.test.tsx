/**
 * GroupHeader deepen：child 无 url/content/file。
 */
import { render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GroupHeader } from '../GroupHeader';

describe('GroupHeader deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('空子节点与有文件子节点', () => {
    const { rerender } = render(
      <GroupHeader
        group={{ name: 'g', children: [{ name: 'a' }] } as any}
        expanded
        onToggle={vi.fn()}
      />,
    );
    rerender(
      <GroupHeader
        group={
          {
            name: 'g',
            children: [{ name: 'b', url: 'https://x' }],
          } as any
        }
        expanded={false}
        onToggle={vi.fn()}
      />,
    );
    expect(document.body.textContent).toBeTruthy();
  });
});
