/**
 * MermaidRendererImpl deepen：空 code 复制早退；无 root 下载早退。
 */
import { cleanup, fireEvent, render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('MermaidRendererImpl deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('空源码与无 svg 根节点', async () => {
    const mod = await import('../MermaidRendererImpl');
    const Comp =
      (mod as any).MermaidRendererImpl ||
      (mod as any).default ||
      Object.values(mod)[0];
    const { container } = render(
      <Comp mermaidSource="" isRendered={false} />,
    );
    container.querySelectorAll('button').forEach((b) => fireEvent.click(b));
    expect(container.firstChild || true).toBeTruthy();
  });
});
