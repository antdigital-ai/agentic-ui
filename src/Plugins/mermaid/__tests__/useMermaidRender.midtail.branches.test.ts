/**
 * useMermaidRender midtail：不可见 / 空 code 早退。
 */
import { renderHook } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../utils', () => ({
  loadMermaid: vi.fn(async () => ({
    initialize: vi.fn(),
    render: vi.fn(async () => ({ svg: '<svg></svg>' })),
  })),
  applyMermaidTheme: vi.fn(),
  createMermaidThemeConfig: vi.fn(() => ({
    cacheKey: 'k',
    darkMode: false,
    themeVariables: {},
  })),
  renderSvgToContainer: vi.fn(),
  cleanupTempElement: vi.fn(),
}));

import { useMermaidRender } from '../useMermaidRender';

describe('useMermaidRender midtail branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it('空 code 清空容器；isVisible=false 跳过', () => {
    const div = document.createElement('div');
    div.innerHTML = 'stale';
    const divRef = { current: div } as React.RefObject<HTMLDivElement>;

    const { rerender } = renderHook(
      ({ code, visible }) =>
        useMermaidRender(code, divRef, 'm1', visible, {}),
      { initialProps: { code: '', visible: true } },
    );
    expect(div.innerHTML).toBe('');

    rerender({ code: 'graph TD;A-->B', visible: false });
    vi.advanceTimersByTime(200);
    expect(div.innerHTML).toBe('');
  });
});
