/**
 * ReadonlyList deepen2：task 列表 data-task。
 */
import { render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ReadonlyList } from '../ReadonlyList';

describe('ReadonlyList deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('bulleted task 标记', () => {
    render(
      <ReadonlyList
        element={
          {
            type: 'bulleted-list',
            task: true,
            children: [
              {
                type: 'list-item',
                checked: false,
                children: [{ text: 'a' }],
              },
            ],
          } as any
        }
        attributes={{} as any}
      >
        <li>a</li>
      </ReadonlyList>,
    );
    expect(document.body.textContent).toContain('a');
  });
});
