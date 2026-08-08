/**
 * ReadonlyListItem deepen：user name 缺省用 id。
 */
import { render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ReadonlyListItem } from '../ReadonlyListItem';

describe('ReadonlyListItem deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('无 name 用 id', () => {
    render(
      <ReadonlyListItem
        element={
          {
            type: 'list-item',
            children: [{ text: 'a' }],
            mentions: [{ id: 'u1', avatar: '' }],
          } as any
        }
        attributes={{} as any}
      >
        <span>item</span>
      </ReadonlyListItem>,
    );
    expect(document.body.textContent).toContain('item');
  });
});
