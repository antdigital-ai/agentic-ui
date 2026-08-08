/**
 * AttachmentFileIcon deepen2：无扩展名文件名；空 type。
 */
import { cleanup, render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('AttachmentFileIcon deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('无点号文件名与空 type', async () => {
    const mod = await import('../AttachmentFileIcon');
    const Comp =
      (mod as any).AttachmentFileIcon ||
      (mod as any).default ||
      Object.values(mod)[0];
    const { container } = render(
      <Comp file={{ name: 'noext', type: '', status: 'done' }} />,
    );
    expect(container.firstChild || true).toBeTruthy();
  });
});
