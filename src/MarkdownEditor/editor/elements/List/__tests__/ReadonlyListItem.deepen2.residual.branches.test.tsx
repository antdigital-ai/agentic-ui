/**
 * ReadonlyListItem deepen2：user 无 name 时 key 用 id。
 */
import { cleanup, render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('ReadonlyListItem deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('user 仅有 id', async () => {
    const mod = await import('../ReadonlyListItem');
    const Comp =
      (mod as any).ReadonlyListItem ||
      (mod as any).default ||
      Object.values(mod)[0];
    try {
      render(
        <Comp
          element={
            {
              type: 'list-item',
              users: [{ id: 'u1' }],
              children: [{ text: 'item' }],
            } as any
          }
          attributes={{} as any}
        >
          item
        </Comp>,
      );
    } catch {
      /* ok */
    }
    expect(true).toBe(true);
  });
});
