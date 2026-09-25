/**
 * AgenticUiFileMapBlock deepen：uuid 空串回退 name。
 */
import '@testing-library/jest-dom';
import { cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AgenticUiFileMapBlock } from '../AgenticUiFileMapBlock';

describe('AgenticUiFileMapBlock deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('uuid 空串用 name 作 key 并渲染', () => {
    render(
      <AgenticUiFileMapBlock
        attributes={{ 'data-slate': '1' } as any}
        element={
          {
            type: 'agentic-ui-filemap',
            value: { files: [{ name: 'only-name.txt', uuid: '' }] },
          } as any
        }
      >
        <span />
      </AgenticUiFileMapBlock>,
    );
    expect(screen.getByTestId('file-item-name').textContent).toContain(
      'only-name',
    );
  });
});
