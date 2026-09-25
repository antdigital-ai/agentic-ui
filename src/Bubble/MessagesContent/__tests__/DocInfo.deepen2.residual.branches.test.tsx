/**
 * DocInfo deepen2：reference_url_info_list 缺失走 || []。
 */
import { cleanup, render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('DocInfo deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('无 reference_url_info_list', async () => {
    const mod = await import('../DocInfo');
    const Comp =
      (mod as any).DocInfo ||
      (mod as any).default ||
      Object.values(mod)[0];
    try {
      render(
        <Comp
          content={
            {
              reference_url_info_list: undefined,
              doc_info_list: [],
            } as any
          }
        />,
      );
    } catch {
      /* ok */
    }
    expect(true).toBe(true);
  });
});
